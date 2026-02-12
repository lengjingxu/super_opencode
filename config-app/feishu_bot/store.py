from __future__ import annotations

import json
import os
import re
import tempfile
import threading
import time
from datetime import datetime
from pathlib import Path
from typing import Any


CHINESE_STOPWORDS: set[str] = {
    "的",
    "了",
    "是",
    "在",
    "我",
    "有",
    "和",
    "就",
    "不",
    "人",
    "都",
    "一",
    "这",
    "中",
    "大",
    "为",
    "上",
    "个",
    "国",
    "到",
    "说",
    "们",
    "以",
    "会",
    "着",
    "来",
    "对",
    "要",
    "也",
    "能",
    "下",
    "过",
    "子",
    "地",
    "多",
    "后",
    "然",
    "于",
    "心",
    "学",
    "么",
    "之",
    "用",
    "发",
    "天",
    "如",
    "出",
    "把",
    "好",
    "没",
    "成",
    "只",
    "事",
    "那",
    "还",
    "被",
    "做",
    "可",
    "她",
    "吧",
    "最",
    "但",
    "他",
    "它",
    "你",
    "很",
    "看",
    "得",
    "去",
    "又",
    "让",
    "给",
    "从",
    "想",
    "与",
    "而",
    "等",
    "比",
    "其",
    "更",
    "已",
    "所",
    "同",
    "日",
    "手",
    "行",
    "前",
    "无",
    "动",
    "方",
    "问",
    "应",
    "新",
    "间",
    "两",
    "次",
    "些",
    "什",
    "当",
    "经",
    "头",
    "起",
    "第",
    "公",
    "此",
    "工",
    "使",
    "情",
    "感",
    "种",
    "面",
    "别",
    "开",
    "门",
    "回",
    "话",
    "该",
    "并",
    "进",
    "正",
    "向",
    "关",
    "点",
    "长",
}

ENGLISH_STOPWORDS: set[str] = {
    "the",
    "a",
    "an",
    "is",
    "are",
    "was",
    "were",
    "be",
    "been",
    "being",
    "have",
    "has",
    "had",
    "do",
    "does",
    "did",
    "will",
    "would",
    "shall",
    "should",
    "may",
    "might",
    "can",
    "could",
    "must",
    "need",
    "dare",
    "ought",
    "used",
    "to",
    "of",
    "in",
    "for",
    "on",
    "with",
    "at",
    "by",
    "from",
    "as",
    "into",
    "through",
    "during",
    "before",
    "after",
    "above",
    "below",
    "between",
    "out",
    "off",
    "over",
    "under",
    "again",
    "further",
    "then",
    "once",
    "here",
    "there",
    "when",
    "where",
    "why",
    "how",
    "all",
    "both",
    "each",
    "few",
    "more",
    "most",
    "other",
    "some",
    "such",
    "no",
    "nor",
    "not",
    "only",
    "own",
    "same",
    "so",
    "than",
    "too",
    "very",
    "just",
    "because",
    "but",
    "and",
    "or",
    "if",
    "while",
    "that",
    "this",
    "it",
    "its",
    "i",
    "me",
    "my",
    "we",
    "our",
    "you",
    "your",
    "he",
    "him",
    "his",
    "she",
    "her",
    "they",
    "them",
    "their",
    "what",
    "which",
    "who",
    "whom",
}

_DEFAULT_DATA: dict[str, Any] = {
    "user_sessions": {},
    "summaries": {},
    "keyword_index": {},
}


class JsonStore:
    def __init__(self, path: str | None = None) -> None:
        if path is None:
            path = str(
                Path.home()
                / ".config"
                / "opencode"
                / "feishu_bot"
                / "data"
                / "store.json"
            )
        self._path = Path(path)
        self._path.parent.mkdir(parents=True, exist_ok=True)
        self._lock = threading.Lock()
        self._data = self._load()

    def _load(self) -> dict[str, Any]:
        try:
            if self._path.exists():
                with open(self._path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                for key in _DEFAULT_DATA:
                    if key not in data:
                        data[key] = _DEFAULT_DATA[key]
                return data
        except Exception:
            print(
                f"[{datetime.now().isoformat()}] store.json corrupt or unreadable, resetting"
            )
        return json.loads(json.dumps(_DEFAULT_DATA))

    def _flush(self) -> None:
        dir_path = str(self._path.parent)
        tmp_path: str | None = None
        try:
            fd = tempfile.NamedTemporaryFile(
                mode="w",
                dir=dir_path,
                suffix=".tmp",
                delete=False,
                encoding="utf-8",
            )
            tmp_path = fd.name
            json.dump(self._data, fd, ensure_ascii=False, indent=2)
            fd.flush()
            os.fsync(fd.fileno())
            fd.close()
            os.replace(tmp_path, str(self._path))
        except Exception:
            print(f"[{datetime.now().isoformat()}] flush failed")
            if tmp_path is not None:
                try:
                    os.unlink(tmp_path)
                except Exception:
                    pass

    def get_user_session(self, open_id: str) -> str | None:
        with self._lock:
            return self._data["user_sessions"].get(open_id)

    def set_user_session(self, open_id: str, session_id: str) -> None:
        with self._lock:
            self._data["user_sessions"][open_id] = session_id
            self._flush()

    def get_all_user_sessions(self) -> dict[str, str]:
        with self._lock:
            return dict(self._data["user_sessions"])

    def get_summary(self, session_id: str) -> dict[str, Any] | None:
        with self._lock:
            s = self._data["summaries"].get(session_id)
            return dict(s) if s is not None else None

    def set_summary(
        self,
        session_id: str,
        title: str,
        summary: str,
        keywords: list[str],
        user_id: str,
    ) -> None:
        with self._lock:
            now = datetime.now().isoformat()
            existing = self._data["summaries"].get(session_id)
            created_at = existing["created_at"] if existing else now
            self._data["summaries"][session_id] = {
                "title": title,
                "summary": summary,
                "keywords": keywords,
                "user_id": user_id,
                "created_at": created_at,
                "updated_at": now,
            }
            idx = self._data["keyword_index"]
            for kw, sids in list(idx.items()):
                if session_id in sids:
                    sids.remove(session_id)
                    if not sids:
                        del idx[kw]
            for kw in keywords:
                idx.setdefault(kw, [])
                if session_id not in idx[kw]:
                    idx[kw].append(session_id)
            self._flush()

    def get_summarized_session_ids(self) -> set[str]:
        with self._lock:
            return set(self._data["summaries"].keys())

    def search_by_keywords(
        self, keywords: list[str], user_id: str | None = None
    ) -> list[dict[str, Any]]:
        with self._lock:
            scores: dict[str, int] = {}
            idx = self._data["keyword_index"]
            for kw in keywords:
                for sid in idx.get(kw, []):
                    scores[sid] = scores.get(sid, 0) + 1
            results: list[dict[str, Any]] = []
            for sid, score in scores.items():
                s = self._data["summaries"].get(sid)
                if s is None:
                    continue
                if user_id is not None and s.get("user_id") != user_id:
                    continue
                entry = dict(s)
                entry["session_id"] = sid
                entry["_score"] = score
                results.append(entry)
            results.sort(
                key=lambda x: (x["_score"], x.get("updated_at", "") or ""),
                reverse=True,
            )
            for r in results[:10]:
                r.pop("_score", None)
            return results[:10]

    def search_by_text(
        self, query: str, user_id: str | None = None
    ) -> list[dict[str, Any]]:
        with self._lock:
            q = query.lower()
            results: list[dict[str, Any]] = []
            for sid, s in self._data["summaries"].items():
                if user_id is not None and s.get("user_id") != user_id:
                    continue
                haystack = " ".join(
                    [
                        s.get("title", ""),
                        s.get("summary", ""),
                        " ".join(s.get("keywords", [])),
                    ]
                ).lower()
                if q in haystack:
                    entry = dict(s)
                    entry["session_id"] = sid
                    results.append(entry)
            results.sort(
                key=lambda x: x.get("updated_at", "") or "",
                reverse=True,
            )
            return results[:10]


class MemoryManager:
    def __init__(self, store: JsonStore, client: Any, interval: float = 300.0) -> None:
        self._store = store
        self._client = client
        self._interval = interval
        self._running = False
        self._timer: threading.Timer | None = None

    def start(self) -> None:
        self._running = True
        self._schedule_next()

    def stop(self) -> None:
        self._running = False
        if self._timer is not None:
            self._timer.cancel()
            self._timer = None

    def _schedule_next(self) -> None:
        self._timer = threading.Timer(self._interval, self._sweep)
        self._timer.daemon = True
        self._timer.start()

    def _sweep(self) -> None:
        try:
            print(f"[{datetime.now().isoformat()}] memory sweep started")
            unsummarized = self._find_unsummarized()
            print(
                f"[{datetime.now().isoformat()}] found {len(unsummarized)} unsummarized sessions"
            )
            for session in unsummarized:
                try:
                    self._summarize_session(session)
                except Exception as e:
                    print(f"[{datetime.now().isoformat()}] summarize failed: {e}")
            print(f"[{datetime.now().isoformat()}] memory sweep finished")
        except Exception as e:
            print(f"[{datetime.now().isoformat()}] sweep error: {e}")
        finally:
            if self._running:
                self._schedule_next()

    def _find_unsummarized(self) -> list[dict[str, Any]]:
        try:
            sessions = self._client.list_sessions()
        except Exception as e:
            print(f"[{datetime.now().isoformat()}] list_sessions failed: {e}")
            return []
        summarized = self._store.get_summarized_session_ids()
        now = time.time()
        results: list[dict[str, Any]] = []
        for s in sessions:
            sid = s.get("id", "")
            if sid in summarized:
                continue
            updated = s.get("time", {}).get("updated")
            if updated is not None:
                try:
                    ts = float(updated) / 1000.0
                    if now - ts < 300:
                        continue
                except (ValueError, TypeError):
                    pass
            results.append(s)
        return results

    def _summarize_session(self, session: dict[str, Any]) -> None:
        sid = session.get("id", "")
        title = session.get("title", sid)

        summary = self._try_api_summary(sid)

        if not summary:
            summary = self._fallback_summary(sid)

        if not summary:
            return

        keywords = self._extract_keywords(summary, title)
        user_sessions = self._store.get_all_user_sessions()
        user_id = ""
        for uid, s in user_sessions.items():
            if s == sid:
                user_id = uid
                break
        self._store.set_summary(sid, title, summary, keywords, user_id)
        print(f"[{datetime.now().isoformat()}] summarized session {sid}: {title}")

    def _try_api_summary(self, sid: str) -> str:
        if not hasattr(self._client, "summarize_session"):
            return ""
        try:
            self._client.summarize_session(sid)
        except Exception as e:
            print(f"[{datetime.now().isoformat()}] summarize API failed for {sid}: {e}")
            return ""

        try:
            messages = self._client.get_session_messages(sid, limit=5)
        except Exception:
            return ""

        for msg in reversed(messages if isinstance(messages, list) else []):
            if not isinstance(msg, dict):
                continue
            info = msg.get("info", {})
            if isinstance(info, dict) and info.get("role") == "assistant":
                for part in msg.get("parts", []):
                    if isinstance(part, dict) and part.get("type") == "text":
                        text = part.get("text", "")
                        if text.strip():
                            return text.strip()[:2000]
        return ""

    def _fallback_summary(self, sid: str) -> str:
        try:
            messages = self._client.get_session_messages(sid, limit=50)
        except Exception as e:
            print(
                f"[{datetime.now().isoformat()}] get_session_messages failed for {sid}: {e}"
            )
            return ""
        conversations = self._extract_text_from_messages(messages)
        if not conversations:
            return ""
        return self._generate_summary(conversations)

    def _extract_text_from_messages(self, messages: Any) -> list[tuple[str, str]]:
        result: list[tuple[str, str]] = []
        if not isinstance(messages, list):
            return result
        for msg in messages:
            role = ""
            if isinstance(msg, dict):
                info = msg.get(
                    "info",
                )
                if isinstance(info, dict):
                    role = info.get("role", "")
                if not role:
                    role = msg.get("role", "")
                parts = msg.get("parts", [])
                if isinstance(parts, list):
                    for part in parts:
                        if isinstance(part, dict) and part.get("type") == "text":
                            text = part.get("text", "")
                            if text:
                                result.append((role, text))
        return result

    def _generate_summary(self, conversations: list[tuple[str, str]]) -> str:
        full = "\n".join(f"[{role}] {text}" for role, text in conversations)
        if len(full) > 1000:
            return full[:400] + " ... " + full[-400:]
        return full

    def _extract_keywords(self, text: str, title: str) -> list[str]:
        combined = f"{title} {text}".lower()
        tokens = re.findall(r"[\u4e00-\u9fff]|[a-zA-Z]{3,}", combined)
        freq: dict[str, int] = {}
        for t in tokens:
            t_lower = t.lower()
            if t_lower in CHINESE_STOPWORDS or t_lower in ENGLISH_STOPWORDS:
                continue
            freq[t_lower] = freq.get(t_lower, 0) + 1
        ranked = sorted(freq.items(), key=lambda x: -x[1])
        return [kw for kw, _ in ranked[:15]]

    def trigger_sweep(self) -> None:
        t = threading.Thread(target=self._sweep, daemon=True)
        t.start()
