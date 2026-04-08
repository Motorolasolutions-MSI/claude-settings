# CLAUDE.md — claude-settings

This repository stores shared Claude Code configuration, settings, and conventions for the `sambloomberg-sketch` organization.

## Repository Purpose

`claude-settings` is a centralized configuration repository for managing Claude Code preferences, prompt guidelines, and project-level settings that can be shared across multiple repositories and team members.

## Repository Structure

```
claude-settings/
├── CLAUDE.md          # This file — project conventions and AI assistant guidance
└── (future files)     # Settings, hooks, and configuration as needed
```

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
