# ant

Minimal Python CLI wrapper around the Anthropic Messages API. Sibling to
`weather_god`, `openai.chatgpt`, etc. — independent, no shared code.

## Install

```bash
pip install anthropic
export ANTHROPIC_API_KEY=sk-ant-...
```

## Usage

```bash
python3 ant/ant.py messages create \
  --model claude-opus-4-7 \
  --max-tokens 1024 \
  --message '{"role": "user", "content": "Hello, Claude"}'
```

- `--message` is repeatable (multi-turn conversation; alternate user/assistant)
- `--system` adds an optional system prompt
- `--message` values must be strict JSON (double-quoted keys/strings)

## Tests

```bash
pip install pytest
python3 -m pytest ant/tests -v
```

Tests mock the `anthropic` SDK and run without network access or an API key.
