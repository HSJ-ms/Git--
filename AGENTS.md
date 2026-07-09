# AGENTS.md

## Purpose

This repository is a reusable, agent-agnostic GitHub Trending analysis toolkit.

Use it to:

- fetch daily, weekly, and monthly GitHub Trending repositories
- enrich repository summaries from rendered README content
- generate publish-ready Chinese Markdown reports
- sync a dashboard page under `reports/.../dashboard/index.html`

Treat `scripts/run-analysis.mjs` as the canonical execution entrypoint.
Treat Markdown reports as the primary deliverable.
Treat the dashboard as a synchronized presentation layer, not a second analysis source.

## Primary entrypoint

From the repository root, run:

```powershell
node .\scripts\run-analysis.mjs --period all
```

Single period:

```powershell
node .\scripts\run-analysis.mjs --period daily
node .\scripts\run-analysis.mjs --period weekly
node .\scripts\run-analysis.mjs --period monthly
```

Override output and date:

```powershell
node .\scripts\run-analysis.mjs --period all --output-dir ..\reports\github-trending --date 2026-07-06
```

## Output contract

Expected outputs:

- `reports/github-trending/<date>-daily.md`
- `reports/github-trending/<date>-weekly.md`
- `reports/github-trending/<date>-monthly.md`
- `reports/github-trending/cache/<date>/`
- `reports/github-trending/dashboard/index.html`

Interpret them as:

- Markdown reports: canonical publishable outputs
- Cache JSON: structured intermediate artifacts
- Dashboard HTML: synced web view built from the same data

## Analysis rules

Macro trend analysis must:

- summarize the whole set into `1-2` core trends
- use strict `What / Why / How` framing
- include representative projects and star deltas
- include risk notes

Project analysis must include:

- `项目简介`
- `解决场景`
- `技术亮点`
- `为什么会火`
- `AI Insight`

When a project aligns with a macro trend, explicitly state how it validates that trend.

Do not require provider-specific tools or Codex-only context if the same result can be achieved by reading the repo files and running Node.js.

## Important files

- `README.md`
  - general human-readable usage guide
- `SKILL.md`
  - Codex-specific discovery adapter; not required outside Codex
- `references/report-guidelines.md`
  - report structure and editorial rules
- `scripts/analysis-core.mjs`
  - core pipeline
- `scripts/dashboard/`
  - dashboard data model and renderer

## Validation

Run tests:

```powershell
node --test .\scripts\analysis-core.test.mjs
node --test .\scripts\dashboard\dashboard-data.test.mjs .\scripts\dashboard\dashboard-render.test.mjs
```

Run end-to-end self-check:

```powershell
node .\scripts\self-check.mjs
```
