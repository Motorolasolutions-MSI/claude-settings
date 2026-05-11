# Procurement Tollgates Intake Tool

A best-in-class project tollgates intake and tracking tool for procurement and logistics teams.

## Features

- **Project Intake Form** — 4-step wizard for submitting new project requests (details, budget/timeline, stakeholders, business justification)
- **Tollgate Review Workflow** — 5 gates (Concept → Business Case → Planning → Execution → Closeout) with approve, reject, hold, and resubmit actions
- **Dashboard** — KPI cards, recent projects, gate distribution chart, priority breakdown, portfolio health
- **Projects List** — Searchable, filterable, sortable table with gate progress indicators
- **Project Detail View** — Full tollgate progress visualization, required documents checklist, reviewer roster, inline commenting
- **Analytics** — Gate pipeline, status distribution, type breakdown, priority matrix

## Tech Stack

- React 19 + TypeScript (Vite)
- Tailwind CSS v4
- React Hook Form
- Lucide React icons

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Tollgate Structure

| Gate | Name | Purpose |
|------|------|---------|
| Gate 0 | Concept | Initial project concept and ideation approval |
| Gate 1 | Business Case | Full business case review and approval |
| Gate 2 | Planning | Project plan approval and resource allocation |
| Gate 3 | Execution | Execution review and progress validation |
| Gate 4 | Closeout | Project closure and lessons learned |
