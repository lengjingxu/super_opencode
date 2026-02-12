from __future__ import annotations

from typing import Any, Optional


def make_card(
    title: str,
    content: str,
    color: str = "blue",
    buttons: list[dict[str, Any]] | None = None,
) -> dict[str, Any]:
    elements: list[dict[str, Any]] = [{"tag": "markdown", "content": content}]
    if buttons:
        elements.append({"tag": "action", "actions": buttons})
    return {
        "header": {"title": {"tag": "plain_text", "content": title}, "template": color},
        "elements": elements,
    }


def make_button(
    text: str,
    action: str,
    kind: str = "default",
    confirm: str | None = None,
    **extra: Any,
) -> dict[str, Any]:
    btn: dict[str, Any] = {
        "tag": "button",
        "text": {"tag": "plain_text", "content": text},
        "type": kind,
        "value": {"action": action, **extra},
    }
    if confirm:
        btn["confirm"] = {
            "title": {"tag": "plain_text", "content": "确认"},
            "text": {"tag": "plain_text", "content": confirm},
        }
    return btn


def help_card() -> dict[str, Any]:
    content = (
        "**💬 直接发消息** → AI 对话\n\n"
        "**📂 会话管理**\n"
        "点击下方按钮或输入命令操作\n\n"
        "**🔍 代码**\n"
        "`/d` 查看 Diff · `/t` 任务清单 · `/v` Git 状态\n\n"
        "**🧠 记忆**\n"
        "`/m <关键词>` 搜索历史 · `/m status` 记忆状态\n\n"
        "**⚙️ 系统**\n"
        "`/health` 健康检查 · `/x` 终止任务"
    )
    buttons = [
        make_button("📋 会话列表", "show_sessions", kind="default"),
        make_button("➕ 新建会话", "new_session", kind="primary"),
        make_button("💚 健康检查", "health_check", kind="default"),
    ]
    return make_card("📖 OpenCode Bot 帮助", content, buttons=buttons)


def session_list_card(
    sessions: list[dict[str, Any]], active_id: str = ""
) -> dict[str, Any]:
    if not sessions:
        buttons = [make_button("➕ 新建会话", "new_session", kind="primary")]
        return make_card(
            "📋 会话列表", "暂无会话\n\n点击按钮或发送消息开始对话", buttons=buttons
        )

    elements: list[dict[str, Any]] = []

    for s in sessions[:10]:
        sid = s.get("id", "")
        title = s.get("title", "未命名")
        is_active = sid == active_id
        icon = "●" if is_active else "○"
        short_id = sid[-8:] if len(sid) > 8 else sid
        marker = " ← 当前" if is_active else ""

        elements.append(
            {
                "tag": "markdown",
                "content": f"{icon} **{title}** `{short_id}`{marker}",
            }
        )

        row_buttons: list[dict[str, Any]] = []
        if not is_active:
            row_buttons.append(
                make_button("切换", "switch_session", kind="primary", session_id=sid)
            )
        row_buttons.append(make_button("📊 Todo", "show_todos", session_id=sid))
        row_buttons.append(make_button("📝 Diff", "show_diff", session_id=sid))
        elements.append({"tag": "action", "actions": row_buttons})

    elements.append({"tag": "hr"})

    footer_buttons = [
        make_button("➕ 新建会话", "new_session", kind="primary"),
        make_button("🔄 刷新", "show_sessions"),
    ]
    elements.append({"tag": "action", "actions": footer_buttons})

    return {
        "header": {
            "title": {"tag": "plain_text", "content": f"📋 会话列表 ({len(sessions)})"},
            "template": "blue",
        },
        "elements": elements,
    }


def todo_card(
    todos: list[dict[str, Any]],
    session_title: str = "",
    session_id: str = "",
) -> dict[str, Any]:
    if not todos:
        return make_card("📋 任务清单", "暂无任务")

    lines = []
    done = 0
    total = len(todos)
    for t in todos:
        status = t.get("status", "pending")
        text = t.get("content", t.get("text", ""))
        if status == "completed":
            lines.append(f"✅ ~~{text}~~")
            done += 1
        elif status == "in_progress":
            lines.append(f"🔄 {text} ← 进行中")
        else:
            lines.append(f"⬜ {text}")

    pct = int(done / total * 100) if total > 0 else 0
    bar_filled = int(pct / 10)
    bar = "█" * bar_filled + "░" * (10 - bar_filled)

    header = f"「{session_title}」" if session_title else ""
    content = "\n".join(lines) + f"\n\n进度: {done}/{total} ({pct}%)\n{bar}"

    buttons = [
        make_button("🔄 刷新", "refresh_todos", session_id=session_id),
        make_button("📝 查看 Diff", "show_diff", session_id=session_id),
    ]
    if done < total:
        buttons.append(
            make_button(
                "⏹ 终止任务",
                "abort",
                kind="danger",
                confirm="确定要终止当前任务吗？",
                session_id=session_id,
            )
        )
    return make_card(f"📋 任务清单 {header}", content, buttons=buttons)


def diff_card(diffs: list[dict[str, Any]], session_id: str = "") -> dict[str, Any]:
    if not diffs:
        return make_card("📝 代码变更", "无变更")

    lines = []
    for d in diffs[:20]:
        path = d.get("path", d.get("file", "unknown"))
        additions = d.get("additions", 0)
        deletions = d.get("deletions", 0)
        lines.append(f"**{path}**  +{additions} -{deletions}")

    content = "\n".join(lines)
    if len(diffs) > 20:
        content += f"\n\n... 还有 {len(diffs) - 20} 个文件"

    buttons = [
        make_button("🔄 刷新", "refresh_diff", session_id=session_id),
        make_button("📊 查看 Todo", "show_todos", session_id=session_id),
    ]
    return make_card(f"📝 代码变更 ({len(diffs)} 个文件)", content, buttons=buttons)


def health_card(healthy: bool, project: dict[str, Any] | None = None) -> dict[str, Any]:
    if not healthy:
        return make_card("❌ OpenCode 离线", "服务未运行或不可达", color="red")

    lines = ["**服务**: ✅ 在线"]
    if project:
        lines.append(f"**项目**: {project.get('name', 'unknown')}")
        lines.append(f"**路径**: `{project.get('path', 'unknown')}`")

    return make_card("💚 OpenCode 运行正常", "\n".join(lines), color="green")


def error_card(message: str) -> dict[str, Any]:
    return make_card("❌ 错误", message, color="red")


def vcs_card(
    project: dict[str, Any] | None = None,
    diffs: list[dict[str, Any]] | None = None,
    session_id: str = "",
) -> dict[str, Any]:
    lines: list[str] = []

    if project:
        lines.append(f"**项目**: {project.get('name', 'unknown')}")
        lines.append(f"**路径**: `{project.get('path', 'unknown')}`")
        lines.append("")

    if diffs:
        total_add = sum(d.get("additions", 0) for d in diffs)
        total_del = sum(d.get("deletions", 0) for d in diffs)
        lines.append(f"**变更文件**: {len(diffs)}  +{total_add} -{total_del}")
        lines.append("")
        for d in diffs[:15]:
            path = d.get("path", d.get("file", "unknown"))
            add = d.get("additions", 0)
            dele = d.get("deletions", 0)
            lines.append(f"`{path}`  +{add} -{dele}")
        if len(diffs) > 15:
            lines.append(f"... 还有 {len(diffs) - 15} 个文件")
    else:
        lines.append("无代码变更")

    buttons = [
        make_button("🔄 刷新", "show_vcs", session_id=session_id),
    ]
    return make_card("🔀 Git 状态", "\n".join(lines), buttons=buttons)


def thinking_card(session_id: str = "") -> dict[str, Any]:
    buttons = [
        make_button(
            "⏹ 终止",
            "abort",
            kind="danger",
            confirm="确定要终止当前任务吗？",
            session_id=session_id,
        ),
    ]
    return make_card(
        "⚙️ 正在思考中...",
        "请稍候，AI 正在处理你的请求...",
        color="blue",
        buttons=buttons,
    )


def streaming_card(text: str, session_id: str = "") -> dict[str, Any]:
    preview = text[-2000:] if len(text) > 2000 else text
    buttons = [
        make_button(
            "⏹ 终止",
            "abort",
            kind="danger",
            confirm="确定要终止当前任务吗？",
            session_id=session_id,
        ),
    ]
    return make_card("✍️ AI 正在回复...", preview, color="blue", buttons=buttons)


def working_card(
    todos: list[dict[str, Any]] | None = None,
    partial_text: str = "",
    session_id: str = "",
) -> dict[str, Any]:
    elements: list[dict[str, Any]] = []

    if todos:
        lines = []
        done = 0
        total = len(todos)
        for t in todos:
            status = t.get("status", "pending")
            text = t.get("content", t.get("text", ""))
            if status == "completed":
                lines.append(f"✅ ~~{text}~~")
                done += 1
            elif status == "in_progress":
                lines.append(f"🔄 {text}")
            else:
                lines.append(f"⬜ {text}")
        pct = int(done / total * 100) if total else 0
        bar_filled = int(pct / 10)
        bar = "█" * bar_filled + "░" * (10 - bar_filled)
        todo_md = "\n".join(lines) + f"\n\n{bar} {done}/{total} ({pct}%)"
        elements.append({"tag": "markdown", "content": todo_md})

    if partial_text:
        if todos:
            elements.append({"tag": "hr"})
        preview = partial_text[-1500:] if len(partial_text) > 1500 else partial_text
        elements.append({"tag": "markdown", "content": preview})

    if not elements:
        elements.append(
            {"tag": "markdown", "content": "请稍候，AI 正在处理你的请求..."}
        )

    elements.append(
        {
            "tag": "action",
            "actions": [
                make_button(
                    "⏹ 终止",
                    "abort",
                    kind="danger",
                    confirm="确定要终止当前任务吗？",
                    session_id=session_id,
                )
            ],
        }
    )

    return {
        "header": {
            "title": {"tag": "plain_text", "content": "⚙️ AI 正在工作..."},
            "template": "blue",
        },
        "elements": elements,
    }


def _build_inline_summary(
    todos: list[dict[str, Any]] | None = None,
    diffs: list[dict[str, Any]] | None = None,
) -> str:
    parts: list[str] = []

    if todos:
        done = sum(1 for t in todos if t.get("status") == "completed")
        total = len(todos)
        in_progress = sum(1 for t in todos if t.get("status") == "in_progress")
        pct = int(done / total * 100) if total else 0
        bar_filled = int(pct / 10)
        bar = "█" * bar_filled + "░" * (10 - bar_filled)
        status = f"📋 **任务** {done}/{total} ({pct}%) {bar}"
        if in_progress:
            status += f"  🔄 {in_progress} 进行中"
        parts.append(status)

    if diffs:
        total_add = sum(d.get("additions", 0) for d in diffs)
        total_del = sum(d.get("deletions", 0) for d in diffs)
        parts.append(f"📝 **变更** {len(diffs)} 文件  +{total_add} -{total_del}")

    return "\n".join(parts)


def completion_card(
    text: str,
    session_id: str = "",
    todos: list[dict[str, Any]] | None = None,
    diffs: list[dict[str, Any]] | None = None,
) -> dict[str, Any]:
    display = text[-3000:] if len(text) > 3000 else text

    elements: list[dict[str, Any]] = [{"tag": "markdown", "content": display}]

    summary_parts = _build_inline_summary(todos, diffs)
    if summary_parts:
        elements.append({"tag": "hr"})
        elements.append({"tag": "markdown", "content": summary_parts})

    return {
        "header": {
            "title": {"tag": "plain_text", "content": "✅ 回复完成"},
            "template": "green",
        },
        "elements": elements,
    }
