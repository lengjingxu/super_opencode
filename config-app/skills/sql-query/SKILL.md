---
name: sql-query
description: 通用 SQL 数据库查询助手 - 支持 MySQL 连接、表结构探索、SQL 查询执行、数据分析、可视化图表生成
triggers:
  - SQL查询
  - 数据库查询
  - MySQL
  - 查询数据
  - 导出数据
  - 表结构
  - 数据分析
  - 数据可视化
  - 图表
  - 报表
---

# SQL 数据库查询 Skill

智能 MySQL 数据库查询助手，支持配置数据库连接、探索表结构、编写执行 SQL、验证结果、导出数据。

## 配置

在 `~/.config/opencode/credentials.json` 中配置数据库连接：

```json
{
  "database": {
    "default": {
      "host": "localhost",
      "port": 3306,
      "user": "root",
      "password": "your_password",
      "database": "your_database",
      "charset": "utf8mb4"
    },
    "production": {
      "host": "rm-xxx.mysql.rds.aliyuncs.com",
      "port": 3306,
      "user": "readonly_user",
      "password": "your_password",
      "database": "main_db",
      "charset": "utf8mb4"
    }
  }
}
```

配置加载优先级:
1. 代码指定路径
2. 同目录 `connections.json` (便于独立使用)
3. `~/.config/opencode/credentials.json` → `database` (config-app 规范)

## 核心能力

### 1. 列出所有数据库
```python
from sql_query_client import SQLQueryManager
manager = SQLQueryManager()
databases = manager.list_databases()
# 返回: ["main_db", "analytics_db", "logs_db", ...]
```

### 2. 列出表
```python
tables = manager.list_tables(database="main_db")
# 返回: [
#   {"name": "users", "rows": 10000, "size_mb": 5.2},
#   {"name": "orders", "rows": 50000, "size_mb": 25.8},
#   ...
# ]
```

### 3. 获取表结构
```python
schema = manager.get_table_schema("users")
# 返回: {
#   "table_name": "users",
#   "columns": [
#     {"name": "id", "type": "bigint", "nullable": False, "key": "PRI", "default": None},
#     {"name": "username", "type": "varchar(50)", "nullable": False, "key": "UNI", "default": None},
#     {"name": "email", "type": "varchar(100)", "nullable": True, "key": "", "default": None},
#     ...
#   ],
#   "indexes": [
#     {"name": "PRIMARY", "columns": ["id"], "unique": True},
#     {"name": "idx_username", "columns": ["username"], "unique": True},
#   ]
# }
```

### 4. 预览表数据
```python
preview = manager.preview_table("users", limit=10)
# 返回: {
#   "columns": ["id", "username", "email", "created_at"],
#   "rows": [
#     [1, "alice", "alice@example.com", "2024-01-01 10:00:00"],
#     [2, "bob", "bob@example.com", "2024-01-02 11:00:00"],
#     ...
#   ],
#   "total_rows": 10000
# }
```

### 5. 执行 SQL 查询
```python
result = manager.execute_query("""
    SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
    FROM orders
    WHERE created_at >= '2024-01-01'
    GROUP BY DATE(created_at)
    ORDER BY date DESC
    LIMIT 10
""")
# 返回: {
#   "columns": ["date", "count"],
#   "rows": [
#     ["2024-01-15", 150],
#     ["2024-01-14", 142],
#     ...
#   ],
#   "row_count": 10,
#   "execution_time_ms": 45
# }
```

### 6. 验证 SQL（不执行）
```python
validation = manager.validate_query("SELECT * FROM users WHERE id = 1")
# 返回: {
#   "valid": True,
#   "query_type": "SELECT",
#   "tables_referenced": ["users"],
#   "estimated_rows": 1
# }
```

### 7. 导出查询结果
```python
# 导出为 CSV
result = manager.export_query(
    query="SELECT * FROM users WHERE status = 'active'",
    output_file="active_users.csv",
    format="csv"
)
# 返回: {"file": "active_users.csv", "rows": 5000, "size_bytes": 125000}

# 导出为 Excel
result = manager.export_query(
    query="SELECT * FROM orders WHERE date >= '2024-01-01'",
    output_file="orders_2024.xlsx",
    format="excel"
)
```

### 8. 智能表探索
```python
exploration = manager.explore_table("orders")
# 返回: {
#   "table_name": "orders",
#   "row_count": 50000,
#   "columns": [...],
#   "sample_data": [...],
#   "column_stats": {
#     "status": {"distinct_values": ["pending", "completed", "cancelled"], "null_count": 0},
#     "amount": {"min": 10.0, "max": 9999.0, "avg": 150.5, "null_count": 5},
#     ...
#   }
# }
```

## 完整使用示例

```python
from sql_query_client import SQLQueryManager

# 初始化（使用默认连接）
manager = SQLQueryManager()

# 或指定连接
manager = SQLQueryManager(connection_name="production")

# 1. 探索数据库结构
print("=== 数据库列表 ===")
for db in manager.list_databases():
    print(f"  - {db}")

# 2. 查看表结构
print("\n=== users 表结构 ===")
schema = manager.get_table_schema("users")
for col in schema["columns"]:
    print(f"  {col['name']}: {col['type']} {'(PK)' if col['key'] == 'PRI' else ''}")

# 3. 预览数据
print("\n=== 数据预览 ===")
preview = manager.preview_table("users", limit=5)
print(f"列: {preview['columns']}")
for row in preview["rows"]:
    print(f"  {row}")

# 4. 执行查询
print("\n=== 查询结果 ===")
result = manager.execute_query("""
    SELECT status, COUNT(*) as count
    FROM orders
    GROUP BY status
""")
for row in result["rows"]:
    print(f"  {row[0]}: {row[1]}")

# 5. 导出数据
print("\n=== 导出数据 ===")
export = manager.export_query(
    query="SELECT * FROM users WHERE created_at >= '2024-01-01'",
    output_file="new_users.csv",
    format="csv"
)
print(f"已导出 {export['rows']} 行到 {export['file']}")
```

## 安全特性

### 只读模式（默认）
```python
manager = SQLQueryManager(readonly=True)  # 默认
# 只允许 SELECT 语句，拒绝 INSERT/UPDATE/DELETE/DROP 等
```

### 允许写操作
```python
manager = SQLQueryManager(readonly=False)
# 允许所有 SQL 操作（谨慎使用）
```

### 查询超时
```python
manager = SQLQueryManager(query_timeout=30)  # 30秒超时
```

### 结果行数限制
```python
result = manager.execute_query("SELECT * FROM big_table", max_rows=10000)
# 最多返回 10000 行
```

## 依赖安装

```bash
pip install pymysql pandas openpyxl
```

## 文件结构

```
sql-query/
├── SKILL.md              # 本文件
└── sql_query_client.py   # SQL 查询客户端封装
```

## 错误处理

| 错误类型 | 说明 | 解决方案 |
|----------|------|----------|
| ConnectionError | 无法连接数据库 | 检查 host/port/网络 |
| AuthenticationError | 认证失败 | 检查 user/password |
| PermissionDenied | 无权限 | 检查数据库用户权限 |
| QueryTimeout | 查询超时 | 优化 SQL 或增加超时时间 |
| ReadOnlyViolation | 只读模式下尝试写操作 | 使用 readonly=False |

## 最佳实践

1. **生产环境使用只读账号**: 避免误操作
2. **设置合理的超时时间**: 防止长时间查询阻塞
3. **限制返回行数**: 大表查询时使用 LIMIT
4. **先验证再执行**: 使用 validate_query 检查 SQL
5. **敏感数据脱敏**: 导出时注意 PII 数据处理

---

## 智能分析功能

### 9. 生成 AI 上下文（智能 Schema 描述）
```python
context = manager.generate_ai_context(tables=["users", "orders"])
# 返回 DDL 风格的结构化描述，包含语义类型标注：
# -- Database: main_db
# -- Tables: 2
#
# -- Table: users (10,000 rows)
# CREATE TABLE `users` (
#   `id` bigint PRIMARY KEY  -- [identifier]
#   `username` varchar(50) UNIQUE  -- [name]
#   `email` varchar(100)  -- [email]
#   `created_at` datetime  -- [timestamp]
# );
# -- FK: orders.user_id -> users.id
```

### 10. 获取表关系（外键分析）
```python
relationships = manager.get_table_relationships("orders")
# 返回: [
#   {"column_name": "user_id", "ref_table": "users", "ref_column": "id"},
#   {"column_name": "product_id", "ref_table": "products", "ref_column": "id"}
# ]
```

### 11. 智能 JOIN 推荐
```python
suggestions = manager.suggest_joins("users", "orders")
# 返回: [
#   {
#     "type": "direct_fk",
#     "join_sql": "`users` JOIN `orders` ON `users`.`id` = `orders`.`user_id`",
#     "confidence": "high"
#   }
# ]
```

### 12. 查询复杂度分析
```python
analysis = manager.analyze_query_complexity("""
    SELECT u.name, SUM(o.amount) as total
    FROM users u
    JOIN orders o ON u.id = o.user_id
    WHERE o.status = 'completed'
    GROUP BY u.id
    HAVING total > 1000
""")
# 返回: {
#   "has_join": True,
#   "has_aggregation": True,
#   "has_subquery": False,
#   "tables_referenced": ["users", "orders"],
#   "complexity_level": "moderate",
#   "complexity_score": 4
# }
```

### 13. 数据库 Schema 摘要
```python
summary = manager.get_database_schema_summary()
# 返回完整的数据库结构摘要，包含：
# - 所有表的列信息和语义类型
# - 主键和外键关系
# - 索引信息
# - 行数和大小统计
```

## 语义类型推断

系统会根据列名和类型自动推断语义类型：

| 语义类型 | 匹配规则 | 示例列名 |
|----------|----------|----------|
| identifier | `*_id`, `id`, `pk` | user_id, order_id |
| timestamp | `*_at`, `*_time`, `*_date` | created_at, updated_at |
| boolean | `is_*`, `has_*`, `*_flag` | is_active, has_paid |
| name | `*name`, `*title` | username, product_name |
| email | `*email`, `*mail` | email, user_email |
| phone | `*phone`, `*mobile` | phone, mobile_number |
| money | `*price`, `*amount`, `*cost` | price, total_amount |
| count | `*count`, `*num`, `*qty` | order_count, quantity |
| enum | `*status`, `*type`, `*state` | order_status, user_type |
| text | `*desc*`, `*content`, `*note` | description, content |
| url | `*url`, `*link`, `*path` | avatar_url, file_path |

## 数据分析工作流示例

```python
from sql_query_client import SQLQueryManager

manager = SQLQueryManager()

# Step 1: 生成 AI 上下文，理解数据库结构
context = manager.generate_ai_context()
print("=== 数据库结构 ===")
print(context)

# Step 2: 分析要查询的表之间的关系
joins = manager.suggest_joins("users", "orders")
print("\n=== 推荐的 JOIN 方式 ===")
for j in joins:
    print(f"  [{j['confidence']}] {j['join_sql']}")

# Step 3: 编写查询并分析复杂度
sql = """
    SELECT u.username, COUNT(o.id) as order_count, SUM(o.amount) as total
    FROM users u
    LEFT JOIN orders o ON u.id = o.user_id
    WHERE o.created_at >= '2024-01-01'
    GROUP BY u.id
    ORDER BY total DESC
    LIMIT 100
"""
complexity = manager.analyze_query_complexity(sql)
print(f"\n=== 查询复杂度: {complexity['complexity_level']} ===")

# Step 4: 执行查询
result = manager.execute_query(sql)
print(f"\n=== 查询结果: {result['row_count']} 行, 耗时 {result['execution_time_ms']}ms ===")

# Step 5: 导出结果
manager.export_query(sql, "top_customers.xlsx", format="excel")
print("\n已导出到 top_customers.xlsx")
```

---

## 数据分析与可视化

### 分析流程

```
1. 理解数据 → 2. 探索模式 → 3. 生成洞察 → 4. 可视化呈现 → 5. 讲述故事
```

### 快速分析模板

```python
import pandas as pd
import matplotlib.pyplot as plt

# 从查询结果创建 DataFrame
result = manager.execute_query("SELECT date, sales, category FROM daily_sales")
df = pd.DataFrame(result['rows'], columns=result['columns'])

# 基础统计
print(df.describe())
print(df.groupby('category').agg({'sales': ['sum', 'mean', 'count']}))

# 趋势分析
df['date'] = pd.to_datetime(df['date'])
df.set_index('date')['sales'].rolling(7).mean().plot(title='7日移动平均')
plt.savefig('trend.png', dpi=150, bbox_inches='tight')
```

### 图表选择指南

| 分析目标 | 推荐图表 | matplotlib 代码 |
|----------|----------|-----------------|
| 趋势变化 | 折线图 | `df.plot(kind='line')` |
| 分类比较 | 柱状图 | `df.plot(kind='bar')` |
| 占比分布 | 饼图 | `df.plot(kind='pie')` |
| 相关性 | 散点图 | `df.plot(kind='scatter', x='a', y='b')` |
| 分布情况 | 直方图 | `df['col'].hist(bins=20)` |
| 多维比较 | 热力图 | `plt.imshow(df.corr())` |

### 常用分析代码片段

**时间序列分析**
```python
df['date'] = pd.to_datetime(df['date'])
df['month'] = df['date'].dt.to_period('M')
monthly = df.groupby('month')['amount'].sum()
monthly.plot(kind='bar', title='月度趋势')
```

**同比/环比计算**
```python
df['yoy'] = df['value'].pct_change(periods=12) * 100  # 同比
df['mom'] = df['value'].pct_change(periods=1) * 100   # 环比
```

**Top N 分析**
```python
top10 = df.nlargest(10, 'sales')
top10.plot(kind='barh', x='name', y='sales', title='销售额 Top 10')
```

**分组占比**
```python
category_sum = df.groupby('category')['amount'].sum()
category_sum.plot(kind='pie', autopct='%.1f%%', title='各类别占比')
```

### 数据叙事框架

**1. 问题-发现-建议 结构**
```
背景: [业务问题是什么]
发现: [数据显示了什么]
  - 关键指标: X 增长了 Y%
  - 异常点: Z 在某时间出现下降
建议: [基于数据的行动建议]
```

**2. 对比叙事**
```
对比维度: [时间/地区/产品]
A vs B: [具体数值对比]
差异原因: [可能的解释]
```

**3. 趋势叙事**
```
整体趋势: [上升/下降/平稳]
关键转折点: [何时发生变化]
预测: [如果趋势持续会怎样]
```

### 报告输出格式

**Markdown 报告模板**
```markdown
# 数据分析报告

## 摘要
- 分析时间范围: YYYY-MM-DD 至 YYYY-MM-DD
- 核心发现: [一句话总结]

## 关键指标
| 指标 | 当期 | 上期 | 变化 |
|------|------|------|------|
| 销售额 | ¥X | ¥Y | +Z% |

## 详细分析
### 1. 趋势分析
![趋势图](trend.png)
[图表解读]

### 2. 分布分析
![分布图](distribution.png)
[图表解读]

## 结论与建议
1. [建议1]
2. [建议2]
```

### 图表美化设置

```python
import matplotlib.pyplot as plt

# 中文字体支持
plt.rcParams['font.sans-serif'] = ['Arial Unicode MS', 'SimHei']
plt.rcParams['axes.unicode_minus'] = False

# 统一风格
plt.style.use('seaborn-v0_8-whitegrid')

# 保存高清图
plt.savefig('chart.png', dpi=200, bbox_inches='tight', facecolor='white')
```
