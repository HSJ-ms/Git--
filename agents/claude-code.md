# Claude Code Instructions

This file is the canonical Claude Code entry for this skill.

## What to do here

Use the Node.js scripts in `scripts/` to:

- fetch GitHub Trending data
- enrich repository summaries from rendered README content
- generate Chinese Markdown reports
- sync a dashboard page from the same analysis result

Use `scripts/run-analysis.mjs` as the canonical execution entrypoint.
Treat Markdown reports as the primary deliverable.

## Main command

```powershell
node .\scripts\run-analysis.mjs --period all
```

Single period:

```powershell
node .\scripts\run-analysis.mjs --period daily
node .\scripts\run-analysis.mjs --period weekly
node .\scripts\run-analysis.mjs --period monthly
```

## Read these files when needed

- `README.md`
  - general usage and compatibility notes
- `references/report-guidelines.md`
  - report output rules
- `scripts/analysis-core.mjs`
  - analysis pipeline

`SKILL.md` exists for Codex discovery only. It is not required for Claude Code execution.

## Output expectations

Trend analysis:

- use `What / Why / How`
- output `1-2` core trends
- include representative projects and risks

Per-project analysis:

- `项目简介`
- `解决场景`
- `技术亮点`
- `为什么会火`
- `AI Insight`

If a project aligns with the macro trend, say how it validates the trend.
