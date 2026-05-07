# CLAUDE.md — claude-settings

This repository stores shared Claude Code configuration, settings, and conventions for the `sambloomberg-sketch` organization.

## Repository Purpose

`claude-settings` is a centralized configuration repository for managing Claude Code preferences, prompt guidelines, and project-level settings that can be shared across multiple repositories and team members.

## Repository Structure

```
claude-settings/
├── CLAUDE.md                  # Project conventions and AI assistant guidance
├── README.md                  # Weather God user-facing docs
├── pyproject.toml             # Python package metadata for Weather God
├── .claude/settings.json      # Project-level Claude Code config (permissions, hooks)
├── .devcontainer/             # Dev container spec
├── data/                      # Static airports/lanes seed data + offline mock fixtures
├── src/weather_god/           # Weather God CLI source
└── tests/                     # Pytest suite (runs without network)
```

## Weather God app

The repo also hosts **Weather God**, a Python CLI that produces a global
transit-risk report. Full usage is in `README.md`. Quick reference:

```bash
pip install -e ".[dev]"   # install in editable mode with test deps
weather-god --mock        # offline run with bundled fixtures
weather-god --mock --json # machine-readable output
pytest -q                 # full test suite, no network required
```

Python 3.10+ required. The dev container's `postCreateCommand` runs the install
automatically.

## Development Workflow

- **Branch naming**: Feature branches follow the pattern `claude/<description>-<id>` (e.g., `claude/add-claude-documentation-lKPvI`)
- **Commits**: Use clear, descriptive commit messages that explain the "why" behind changes
- **Push**: Always push with `git push -u origin <branch-name>`

## Key Conventions

### Configuration Files

- Keep configuration files well-documented with inline comments where applicable
- Use JSON for structured settings (e.g., `settings.json`)
- Validate configuration changes before committing

### CLAUDE.md Files

When writing or updating `CLAUDE.md` files (for this or other repos):

- Start with a brief description of the repository's purpose
- Document the project structure and key directories
- Include build, test, and lint commands
- Note code style conventions and patterns
- Keep instructions actionable and concise — avoid redundant or obvious guidance
- Update the file as the project evolves

### Code Style

- Prefer clarity over cleverness
- Follow existing patterns and conventions in each file
- Do not add unnecessary abstractions or speculative features

## Contributing

1. Create a feature branch from `main`
2. Make changes and commit with descriptive messages
3. Push the branch and open a pull request for review
