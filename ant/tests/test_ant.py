"""Tests for ant.py. The Anthropic SDK is mocked via sys.modules."""
import sys
import types
from unittest.mock import MagicMock

import pytest

# Stub anthropic before importing ant so the import inside main() resolves.
_fake_anthropic = types.ModuleType("anthropic")
_fake_anthropic.Anthropic = MagicMock()
sys.modules["anthropic"] = _fake_anthropic

import ant  # noqa: E402


def _stub_response(text="Hello there!"):
    block = MagicMock()
    block.type = "text"
    block.text = text
    response = MagicMock()
    response.content = [block]
    return response


def _patched_client(monkeypatch, response):
    client = MagicMock()
    client.messages.create.return_value = response
    factory = MagicMock(return_value=client)
    monkeypatch.setattr(_fake_anthropic, "Anthropic", factory)
    return client


def test_basic_call(monkeypatch, capsys):
    client = _patched_client(monkeypatch, _stub_response("Hi!"))

    rc = ant.main([
        "messages", "create",
        "--model", "claude-opus-4-7",
        "--max-tokens", "1024",
        "--message", '{"role": "user", "content": "Hello, Claude"}',
    ])

    assert rc == 0
    client.messages.create.assert_called_once_with(
        model="claude-opus-4-7",
        max_tokens=1024,
        messages=[{"role": "user", "content": "Hello, Claude"}],
    )
    assert capsys.readouterr().out.strip() == "Hi!"


def test_multi_turn(monkeypatch):
    client = _patched_client(monkeypatch, _stub_response())

    rc = ant.main([
        "messages", "create",
        "--model", "claude-opus-4-7",
        "--max-tokens", "256",
        "--message", '{"role": "user", "content": "Hi"}',
        "--message", '{"role": "assistant", "content": "Hello!"}',
        "--message", '{"role": "user", "content": "How are you?"}',
    ])

    assert rc == 0
    _, kwargs = client.messages.create.call_args
    assert len(kwargs["messages"]) == 3
    assert [m["role"] for m in kwargs["messages"]] == ["user", "assistant", "user"]


def test_system_prompt(monkeypatch):
    client = _patched_client(monkeypatch, _stub_response())

    rc = ant.main([
        "messages", "create",
        "--model", "claude-opus-4-7",
        "--max-tokens", "256",
        "--system", "You are terse.",
        "--message", '{"role": "user", "content": "Hi"}',
    ])

    assert rc == 0
    _, kwargs = client.messages.create.call_args
    assert kwargs["system"] == "You are terse."


def test_invalid_json_message(monkeypatch, capsys):
    _patched_client(monkeypatch, _stub_response())

    rc = ant.main([
        "messages", "create",
        "--model", "claude-opus-4-7",
        "--max-tokens", "256",
        "--message", "{role: user, content: hi}",  # not valid JSON
    ])

    assert rc == 2
    assert "invalid JSON" in capsys.readouterr().err


def test_missing_required_flag(monkeypatch):
    _patched_client(monkeypatch, _stub_response())
    with pytest.raises(SystemExit):
        ant.main(["messages", "create", "--model", "claude-opus-4-7"])
