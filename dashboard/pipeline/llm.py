"""One door to Claude for the pipeline, with two credentials:

  ANTHROPIC_API_KEY        -> Anthropic SDK (pay-per-token, console.anthropic.com credits)
  CLAUDE_CODE_OAUTH_TOKEN  -> Claude Code CLI in print mode (`claude -p`), which runs on a Claude Pro/Max subscription.
                              Create it once on a machine with a browser: `claude setup-token`, then store it as a
                              repository secret. The workflows install the CLI with `npm i -g @anthropic-ai/claude-code`.

mode()          "api" | "cli" | None
complete_json() one-shot structured answer (system + user -> dict). API mode uses output_config json_schema; CLI mode asks
                for JSON only and parses the `result` field tolerantly.
agent_json()    an agentic run that may read repository files and run read-only python helpers before answering with JSON.
                API mode: the caller supplies a tool runner (advisor.py keeps its SDK tools); CLI mode: `claude -p` with Read and
                a restricted Bash allowlist, max_turns bounded.
"""

from __future__ import annotations

import json
import logging
import os
import re
import shutil
import subprocess
from pathlib import Path

log = logging.getLogger("pipeline.llm")


def mode() -> str | None:
    if os.environ.get("PIPELINE_NO_CLAUDE"):
        return None
    if os.environ.get("ANTHROPIC_API_KEY"):
        return "api"
    if os.environ.get("CLAUDE_CODE_OAUTH_TOKEN") and shutil.which("claude"):
        return "cli"
    return None


def model_name() -> str:
    return os.environ.get("PIPELINE_MODEL") or "claude-opus-5-5"  # 워크플로가 빈 vars 를 넘겨도 기본값


def cli_model_alias() -> str:
    m = model_name()
    return "opus" if "opus" in m else "sonnet" if "sonnet" in m else "fable" if "fable" in m else m


def parse_json(text: str):
    """Whole text, else one code fence, else first {...} / [...] span."""
    if text is None:
        return None
    t = text.strip()
    for cand in (t, *re.findall(r"```(?:json)?\s*(.*?)```", t, re.S)):
        try:
            return json.loads(cand)
        except (json.JSONDecodeError, TypeError):
            pass
    for o, c in (("{", "}"), ("[", "]")):
        i, j = t.find(o), t.rfind(c)
        if i >= 0 and j > i:
            try:
                return json.loads(t[i:j + 1])
            except json.JSONDecodeError:
                continue
    return None


def _run_cli(prompt: str, max_turns: int = 1, allowed_tools: list[str] | None = None, cwd: Path | None = None, timeout: int = 900) -> str | None:
    cmd = ["claude", "-p", prompt, "--output-format", "json", "--max-turns", str(max_turns), "--model", cli_model_alias()]
    if allowed_tools:
        cmd += ["--allowedTools", *allowed_tools]
    else:
        cmd += ["--restricted"]
    env = {k: v for k, v in os.environ.items() if k != "ANTHROPIC_API_KEY"}  # never let an API key silently override the subscription token
    try:
        r = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout, cwd=str(cwd) if cwd else None, env=env)
    except subprocess.TimeoutExpired:
        log.warning("claude -p timed out after %ss", timeout)
        return None
    if r.returncode != 0:
        log.warning("claude -p exit %s: %s", r.returncode, (r.stderr or r.stdout)[-400:])
        return None
    try:
        d = json.loads(r.stdout)
    except json.JSONDecodeError:
        return r.stdout
    if d.get("is_error"):
        log.warning("claude -p error: %s", str(d.get("result"))[:300])
        return None
    return d.get("result")


def complete_json(system: str, user: str, schema: dict | None = None, max_tokens: int = 8000, effort: str = "low", model: str | None = None) -> dict | list | None:
    m = mode()
    if m == "api":
        import anthropic
        client = anthropic.Anthropic()
        kw = {"model": model or model_name(), "max_tokens": max_tokens, "betas": ["server-side-fallback-2026-07-01"], "fallbacks": "default",
              "system": [{"type": "text", "text": system, "cache_control": {"type": "ephemeral"}}], "messages": [{"role": "user", "content": user}],
              "output_config": {"effort": effort, **({"format": {"type": "json_schema", "schema": schema}} if schema else {})}}
        try:
            resp = client.beta.messages.create(**kw)
        except anthropic.APIStatusError as e:
            log.warning("API error %s: %s", e.status_code, e.message); return None
        except anthropic.APIConnectionError as e:
            log.warning("connection error: %s", e); return None
        if resp.stop_reason == "refusal":
            log.warning("refused"); return None
        text = next((b.text for b in resp.content if b.type == "text"), "")
        return parse_json(text)
    if m == "cli":
        prompt = system + "\n\n반드시 JSON 하나만 출력한다. 설명·마크다운·코드 펜스 없이 JSON 본문만." + (("\n\nJSON 스키마:\n" + json.dumps(schema, ensure_ascii=False)) if schema else "") + "\n\n" + user
        return parse_json(_run_cli(prompt, max_turns=1))
    return None


def agent_json(system: str, task: str, cwd: Path, helpers: list[str] | None = None, max_turns: int = 12) -> dict | list | None:
    """CLI-only agentic run (API mode is handled by the caller's SDK tool runner). `helpers` are shell command prefixes to allow."""
    if mode() != "cli":
        return None
    allowed = ["Read", "Glob", "Grep"] + [f"Bash({h})" for h in (helpers or [])]
    prompt = system + "\n\n저장소 파일을 Read/Grep으로 읽고 허용된 python 도우미만 실행해 조사한 뒤, 마지막 메시지는 JSON 하나만 출력한다.\n\n" + task
    return parse_json(_run_cli(prompt, max_turns=max_turns, allowed_tools=allowed, cwd=cwd, timeout=1500))
