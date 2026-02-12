"""
通用 MySQL 数据库查询客户端
支持数据库连接、表结构探索、SQL 查询执行、数据导出
"""

import json
import os
import re
import time
import logging
from typing import Optional, List, Dict, Any, Union
from datetime import datetime, date
from decimal import Decimal

import pymysql
from pymysql.cursors import DictCursor

logger = logging.getLogger(__name__)


class SQLQueryManager:
    """MySQL 数据库查询管理器"""

    def __init__(self, config_path: str = None):
        self.config = self._load_config(config_path)
        self.connections_config = self.config.get("connections", {})
        self.default_connection = self.config.get("default_connection", "default")
        self._connections: Dict[str, pymysql.Connection] = {}

    def _load_config(self, config_path: str = None) -> Dict[str, Any]:
        """
        加载配置，优先级：
        1. 显式传入的 config_path
        2. 同目录下的 connections.json (便于独立使用)
        3. ~/.config/opencode/credentials.json -> database (config-app 规范)
        """
        script_dir = os.path.dirname(__file__)
        config_files = [
            config_path,
            os.path.join(script_dir, "connections.json"),
        ]

        for path in config_files:
            if path and os.path.exists(path):
                with open(path, "r", encoding="utf-8") as f:
                    return json.load(f)

        # 从 credentials.json 加载 (config-app 规范)
        credentials_path = os.path.expanduser("~/.config/opencode/credentials.json")
        if os.path.exists(credentials_path):
            with open(credentials_path, "r", encoding="utf-8") as f:
                cred = json.load(f)
            db_config = cred.get("database", {})
            if db_config:
                return {"connections": db_config, "default_connection": "default"}

        raise FileNotFoundError(
            "未找到数据库配置。请在以下位置之一配置：\n"
            "1. ~/.config/opencode/credentials.json (database)\n"
            "2. 同目录下的 connections.json"
        )

        connections = self.config.get("connections", {})
        if self.connection_name not in connections:
            raise ValueError(f"Connection '{self.connection_name}' not found in config")

        return connections[self.connection_name]

    def _get_connection(self) -> pymysql.Connection:
        if self._connection is None or not self._connection.open:
            conn_config = self._get_connection_config()
            self._connection = pymysql.connect(
                host=conn_config.get("host", "localhost"),
                port=conn_config.get("port", 3306),
                user=conn_config.get("user", "root"),
                password=conn_config.get("password", ""),
                database=conn_config.get("database"),
                charset=conn_config.get("charset", "utf8mb4"),
                connect_timeout=10,
                read_timeout=self.query_timeout,
                write_timeout=self.query_timeout,
                cursorclass=DictCursor,
            )
        return self._connection

    def _is_write_query(self, sql: str) -> bool:
        normalized = sql.strip().upper()
        first_word = normalized.split()[0] if normalized.split() else ""
        return first_word in self.WRITE_KEYWORDS

    def _check_readonly(self, sql: str) -> None:
        if self.readonly and self._is_write_query(sql):
            raise PermissionError(
                f"Write operations not allowed in readonly mode. "
                f"Initialize with readonly=False to allow writes."
            )

    def close(self) -> None:
        if self._connection and self._connection.open:
            self._connection.close()
            self._connection = None

    def list_databases(self) -> List[str]:
        conn = self._get_connection()
        with conn.cursor() as cursor:
            cursor.execute("SHOW DATABASES")
            return [row["Database"] for row in cursor.fetchall()]

    def list_tables(self, database: Optional[str] = None) -> List[Dict[str, Any]]:
        conn = self._get_connection()

        if database:
            conn.select_db(database)

        with conn.cursor() as cursor:
            cursor.execute("""
                SELECT 
                    TABLE_NAME as name,
                    TABLE_ROWS as rows,
                    ROUND(DATA_LENGTH / 1024 / 1024, 2) as size_mb,
                    TABLE_COMMENT as comment
                FROM information_schema.TABLES
                WHERE TABLE_SCHEMA = DATABASE()
                ORDER BY TABLE_NAME
            """)
            return list(cursor.fetchall())

    def get_table_schema(
        self, table_name: str, database: Optional[str] = None
    ) -> Dict[str, Any]:
        conn = self._get_connection()

        if database:
            conn.select_db(database)

        with conn.cursor() as cursor:
            cursor.execute(f"DESCRIBE `{table_name}`")
            columns = []
            for row in cursor.fetchall():
                columns.append(
                    {
                        "name": row["Field"],
                        "type": row["Type"],
                        "nullable": row["Null"] == "YES",
                        "key": row["Key"],
                        "default": row["Default"],
                        "extra": row["Extra"],
                    }
                )

            cursor.execute(f"SHOW INDEX FROM `{table_name}`")
            indexes_raw = cursor.fetchall()

            indexes: Dict[str, Dict[str, Any]] = {}
            for idx in indexes_raw:
                idx_name = idx["Key_name"]
                if idx_name not in indexes:
                    indexes[idx_name] = {
                        "name": idx_name,
                        "columns": [],
                        "unique": idx["Non_unique"] == 0,
                    }
                indexes[idx_name]["columns"].append(idx["Column_name"])

            return {
                "table_name": table_name,
                "columns": columns,
                "indexes": list(indexes.values()),
            }

    def preview_table(
        self, table_name: str, limit: int = 10, database: Optional[str] = None
    ) -> Dict[str, Any]:
        conn = self._get_connection()

        if database:
            conn.select_db(database)

        with conn.cursor() as cursor:
            cursor.execute(f"SELECT COUNT(*) as cnt FROM `{table_name}`")
            total_rows = cursor.fetchone()["cnt"]

            cursor.execute(f"SELECT * FROM `{table_name}` LIMIT {limit}")
            rows_dict = cursor.fetchall()

            if not rows_dict:
                return {"columns": [], "rows": [], "total_rows": total_rows}

            columns = list(rows_dict[0].keys())
            rows = [[row[col] for col in columns] for row in rows_dict]

            return {
                "columns": columns,
                "rows": rows,
                "total_rows": total_rows,
            }

    def execute_query(
        self, sql: str, params: Optional[tuple] = None, max_rows: int = 10000
    ) -> Dict[str, Any]:
        self._check_readonly(sql)

        conn = self._get_connection()
        start_time = time.time()

        with conn.cursor() as cursor:
            cursor.execute(sql, params)

            if sql.strip().upper().startswith("SELECT"):
                rows_dict = cursor.fetchmany(max_rows)
                execution_time_ms = int((time.time() - start_time) * 1000)

                if not rows_dict:
                    return {
                        "columns": [],
                        "rows": [],
                        "row_count": 0,
                        "execution_time_ms": execution_time_ms,
                    }

                columns = list(rows_dict[0].keys())
                rows = [
                    [self._serialize_value(row[col]) for col in columns]
                    for row in rows_dict
                ]

                return {
                    "columns": columns,
                    "rows": rows,
                    "row_count": len(rows),
                    "execution_time_ms": execution_time_ms,
                    "truncated": len(rows) >= max_rows,
                }
            else:
                conn.commit()
                execution_time_ms = int((time.time() - start_time) * 1000)
                return {
                    "affected_rows": cursor.rowcount,
                    "execution_time_ms": execution_time_ms,
                }

    def _serialize_value(self, value: Any) -> Any:
        if value is None:
            return None
        if isinstance(value, datetime):
            return value.strftime("%Y-%m-%d %H:%M:%S")
        if isinstance(value, date):
            return value.strftime("%Y-%m-%d")
        if isinstance(value, Decimal):
            return float(value)
        if isinstance(value, bytes):
            return value.decode("utf-8", errors="replace")
        return value

    def validate_query(self, sql: str) -> Dict[str, Any]:
        normalized = sql.strip().upper()
        first_word = normalized.split()[0] if normalized.split() else ""

        tables = re.findall(
            r"(?:FROM|JOIN|INTO|UPDATE)\s+`?(\w+)`?", sql, re.IGNORECASE
        )

        return {
            "valid": True,
            "query_type": first_word,
            "tables_referenced": list(set(tables)),
            "is_write_operation": first_word in self.WRITE_KEYWORDS,
        }

    def export_query(
        self,
        query: str,
        output_file: str,
        format: str = "csv",
        params: Optional[tuple] = None,
    ) -> Dict[str, Any]:
        result = self.execute_query(query, params, max_rows=1000000)

        if format == "csv":
            return self._export_csv(result, output_file)
        elif format == "excel":
            return self._export_excel(result, output_file)
        else:
            raise ValueError(f"Unsupported format: {format}. Use 'csv' or 'excel'.")

    def _export_csv(self, result: Dict[str, Any], output_file: str) -> Dict[str, Any]:
        import csv

        with open(output_file, "w", newline="", encoding="utf-8-sig") as f:
            writer = csv.writer(f)
            writer.writerow(result["columns"])
            writer.writerows(result["rows"])

        size_bytes = os.path.getsize(output_file)
        return {
            "file": output_file,
            "rows": result["row_count"],
            "size_bytes": size_bytes,
            "format": "csv",
        }

    def _export_excel(self, result: Dict[str, Any], output_file: str) -> Dict[str, Any]:
        try:
            import pandas as pd
        except ImportError:
            raise ImportError(
                "pandas is required for Excel export. Install with: pip install pandas openpyxl"
            )

        df = pd.DataFrame(result["rows"], columns=result["columns"])
        df.to_excel(output_file, index=False, engine="openpyxl")

        size_bytes = os.path.getsize(output_file)
        return {
            "file": output_file,
            "rows": result["row_count"],
            "size_bytes": size_bytes,
            "format": "excel",
        }

    def explore_table(
        self, table_name: str, database: Optional[str] = None
    ) -> Dict[str, Any]:
        schema = self.get_table_schema(table_name, database)
        preview = self.preview_table(table_name, limit=5, database=database)

        conn = self._get_connection()
        column_stats = {}

        with conn.cursor() as cursor:
            for col in schema["columns"][:10]:
                col_name = col["name"]
                col_type = col["type"].lower()

                try:
                    if (
                        "int" in col_type
                        or "float" in col_type
                        or "double" in col_type
                        or "decimal" in col_type
                    ):
                        cursor.execute(f"""
                            SELECT 
                                MIN(`{col_name}`) as min_val,
                                MAX(`{col_name}`) as max_val,
                                AVG(`{col_name}`) as avg_val,
                                SUM(CASE WHEN `{col_name}` IS NULL THEN 1 ELSE 0 END) as null_count
                            FROM `{table_name}`
                        """)
                        stats = cursor.fetchone()
                        column_stats[col_name] = {
                            "min": stats["min_val"],
                            "max": stats["max_val"],
                            "avg": float(stats["avg_val"])
                            if stats["avg_val"]
                            else None,
                            "null_count": stats["null_count"],
                        }
                    else:
                        cursor.execute(f"""
                            SELECT 
                                COUNT(DISTINCT `{col_name}`) as distinct_count,
                                SUM(CASE WHEN `{col_name}` IS NULL THEN 1 ELSE 0 END) as null_count
                            FROM `{table_name}`
                        """)
                        stats = cursor.fetchone()

                        distinct_values = None
                        if stats["distinct_count"] <= 20:
                            cursor.execute(
                                f"SELECT DISTINCT `{col_name}` FROM `{table_name}` LIMIT 20"
                            )
                            distinct_values = [
                                row[col_name] for row in cursor.fetchall()
                            ]

                        column_stats[col_name] = {
                            "distinct_count": stats["distinct_count"],
                            "null_count": stats["null_count"],
                            "distinct_values": distinct_values,
                        }
                except Exception as e:
                    logger.warning(f"Failed to get stats for column {col_name}: {e}")
                    column_stats[col_name] = {"error": str(e)}

        return {
            "table_name": table_name,
            "row_count": preview["total_rows"],
            "columns": schema["columns"],
            "indexes": schema["indexes"],
            "sample_data": preview["rows"],
            "column_stats": column_stats,
        }

    def get_table_relationships(self, table_name: str) -> List[Dict[str, Any]]:
        """获取表的外键关系，用于智能 JOIN 推荐"""
        conn = self._get_connection()
        with conn.cursor() as cursor:
            cursor.execute(
                """
                SELECT 
                    COLUMN_NAME as column_name,
                    REFERENCED_TABLE_NAME as ref_table,
                    REFERENCED_COLUMN_NAME as ref_column
                FROM information_schema.KEY_COLUMN_USAGE
                WHERE TABLE_SCHEMA = DATABASE() 
                  AND TABLE_NAME = %s 
                  AND REFERENCED_TABLE_NAME IS NOT NULL
            """,
                (table_name,),
            )
            return list(cursor.fetchall())

    def get_database_schema_summary(self) -> Dict[str, Any]:
        """生成完整的数据库 Schema 摘要，供 AI 理解数据库结构"""
        tables = self.list_tables()
        schema_summary = {
            "database": self._get_connection_config().get("database"),
            "table_count": len(tables),
            "tables": [],
        }

        for table_info in tables:
            table_name = table_info["name"]
            try:
                schema = self.get_table_schema(table_name)
                relationships = self.get_table_relationships(table_name)

                table_summary = {
                    "name": table_name,
                    "row_count": table_info.get("rows", 0),
                    "size_mb": table_info.get("size_mb", 0),
                    "comment": table_info.get("comment", ""),
                    "columns": [
                        {
                            "name": c["name"],
                            "type": c["type"],
                            "key": c["key"],
                            "semantic_type": self._infer_semantic_type(
                                c["name"], c["type"]
                            ),
                        }
                        for c in schema["columns"]
                    ],
                    "primary_key": [
                        c["name"] for c in schema["columns"] if c["key"] == "PRI"
                    ],
                    "foreign_keys": relationships,
                    "indexes": [idx["name"] for idx in schema["indexes"]],
                }
                schema_summary["tables"].append(table_summary)
            except Exception as e:
                logger.warning(f"Failed to get schema for {table_name}: {e}")

        return schema_summary

    def _infer_semantic_type(self, col_name: str, col_type: str) -> str:
        """根据列名和类型推断语义类型"""
        name_lower = col_name.lower()
        type_lower = col_type.lower()

        if name_lower in ("id", "pk") or name_lower.endswith("_id"):
            return "identifier"
        if any(
            kw in name_lower for kw in ("created", "updated", "time", "date", "_at")
        ):
            return "timestamp"
        if any(
            kw in name_lower
            for kw in ("is_", "has_", "can_", "flag", "enabled", "active")
        ):
            return "boolean"
        if any(kw in name_lower for kw in ("name", "title", "label")):
            return "name"
        if any(kw in name_lower for kw in ("email", "mail")):
            return "email"
        if any(kw in name_lower for kw in ("phone", "mobile", "tel")):
            return "phone"
        if any(kw in name_lower for kw in ("price", "amount", "cost", "fee", "total")):
            return "money"
        if any(kw in name_lower for kw in ("count", "num", "qty", "quantity")):
            return "count"
        if any(kw in name_lower for kw in ("status", "state", "type", "category")):
            return "enum"
        if any(
            kw in name_lower
            for kw in ("desc", "description", "content", "text", "note")
        ):
            return "text"
        if any(kw in name_lower for kw in ("url", "link", "path")):
            return "url"
        if "json" in type_lower:
            return "json"
        if "text" in type_lower or "blob" in type_lower:
            return "large_text"

        return "unknown"

    def generate_ai_context(self, tables: Optional[List[str]] = None) -> str:
        """生成供 AI 使用的数据库上下文描述（DDL 风格）"""
        if tables:
            target_tables = tables
        else:
            all_tables = self.list_tables()
            target_tables = [t["name"] for t in all_tables[:20]]

        context_parts = []
        context_parts.append(
            f"-- Database: {self._get_connection_config().get('database')}"
        )
        context_parts.append(f"-- Tables: {len(target_tables)}\n")

        for table_name in target_tables:
            try:
                schema = self.get_table_schema(table_name)
                relationships = self.get_table_relationships(table_name)
                table_info = next(
                    (t for t in self.list_tables() if t["name"] == table_name),
                    {"rows": 0, "comment": ""},
                )

                comment = table_info.get("comment", "")
                row_count = table_info.get("rows", 0)

                context_parts.append(f"-- Table: {table_name} ({row_count:,} rows)")
                if comment:
                    context_parts.append(f"-- Comment: {comment}")

                context_parts.append(f"CREATE TABLE `{table_name}` (")

                col_lines = []
                for col in schema["columns"]:
                    semantic = self._infer_semantic_type(col["name"], col["type"])
                    key_info = ""
                    if col["key"] == "PRI":
                        key_info = " PRIMARY KEY"
                    elif col["key"] == "UNI":
                        key_info = " UNIQUE"

                    semantic_hint = (
                        f"  -- [{semantic}]" if semantic != "unknown" else ""
                    )
                    col_lines.append(
                        f"  `{col['name']}` {col['type']}{key_info}{semantic_hint}"
                    )

                context_parts.append(",\n".join(col_lines))
                context_parts.append(");")

                if relationships:
                    for rel in relationships:
                        context_parts.append(
                            f"-- FK: {table_name}.{rel['column_name']} -> "
                            f"{rel['ref_table']}.{rel['ref_column']}"
                        )

                context_parts.append("")

            except Exception as e:
                context_parts.append(f"-- Error loading {table_name}: {e}\n")

        return "\n".join(context_parts)

    def suggest_joins(self, table1: str, table2: str) -> List[Dict[str, Any]]:
        """推荐两个表之间的 JOIN 方式"""
        suggestions = []

        rel1 = self.get_table_relationships(table1)
        rel2 = self.get_table_relationships(table2)

        for rel in rel1:
            if rel["ref_table"] == table2:
                suggestions.append(
                    {
                        "type": "direct_fk",
                        "join_sql": f"`{table1}` JOIN `{table2}` ON `{table1}`.`{rel['column_name']}` = `{table2}`.`{rel['ref_column']}`",
                        "confidence": "high",
                    }
                )

        for rel in rel2:
            if rel["ref_table"] == table1:
                suggestions.append(
                    {
                        "type": "reverse_fk",
                        "join_sql": f"`{table1}` JOIN `{table2}` ON `{table1}`.`{rel['ref_column']}` = `{table2}`.`{rel['column_name']}`",
                        "confidence": "high",
                    }
                )

        schema1 = self.get_table_schema(table1)
        schema2 = self.get_table_schema(table2)
        cols1 = {c["name"].lower(): c["name"] for c in schema1["columns"]}
        cols2 = {c["name"].lower(): c["name"] for c in schema2["columns"]}

        common_cols = set(cols1.keys()) & set(cols2.keys())
        for col_lower in common_cols:
            if col_lower in ("id", "created_at", "updated_at"):
                continue
            suggestions.append(
                {
                    "type": "common_column",
                    "join_sql": f"`{table1}` JOIN `{table2}` ON `{table1}`.`{cols1[col_lower]}` = `{table2}`.`{cols2[col_lower]}`",
                    "confidence": "medium",
                    "column": cols1[col_lower],
                }
            )

        return suggestions

    def analyze_query_complexity(self, sql: str) -> Dict[str, Any]:
        """分析 SQL 查询复杂度"""
        sql_upper = sql.upper()

        analysis = {
            "has_join": " JOIN " in sql_upper,
            "has_subquery": "SELECT" in sql_upper[sql_upper.find("FROM") :]
            if "FROM" in sql_upper
            else False,
            "has_aggregation": any(
                kw in sql_upper
                for kw in ["GROUP BY", "SUM(", "COUNT(", "AVG(", "MAX(", "MIN("]
            ),
            "has_window_function": "OVER(" in sql_upper,
            "has_cte": sql_upper.strip().startswith("WITH"),
            "has_union": " UNION " in sql_upper,
            "tables_referenced": list(
                set(re.findall(r"(?:FROM|JOIN)\s+`?(\w+)`?", sql, re.IGNORECASE))
            ),
        }

        complexity_score = sum(
            [
                analysis["has_join"] * 2,
                analysis["has_subquery"] * 3,
                analysis["has_aggregation"] * 1,
                analysis["has_window_function"] * 2,
                analysis["has_cte"] * 2,
                analysis["has_union"] * 2,
                len(analysis["tables_referenced"]) - 1,
            ]
        )

        if complexity_score <= 2:
            analysis["complexity_level"] = "simple"
        elif complexity_score <= 5:
            analysis["complexity_level"] = "moderate"
        else:
            analysis["complexity_level"] = "complex"

        analysis["complexity_score"] = complexity_score
        return analysis


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)

    print("SQL Query Manager initialized.")
    print(
        "Configure connections in ~/.config/opencode/skills/retail-sql/connections.json or db_connections.json"
    )
