---
name: analyze-github-trending
description: Analyze GitHub Trending repositories and generate publish-ready Chinese daily, weekly, and monthly Markdown reports plus a bundled dashboard webpage. Use when Codex needs to collect all repositories from GitHub Trending, read repository README content, produce macro trend analysis with strict What/Why/How framing, generate trend-aware per-project AI Insight summaries, or explicitly mark AI open source, AI agents, and AI software development automation projects.
---

# Analyze GitHub Trending

## Overview

Use this skill to turn GitHub Trending daily, weekly, and monthly pages into publish-ready Chinese reports and a dashboard-style webpage.
Run the bundled Node script to collect repository metadata, read rendered README content from each repository page, extract tags and trend signals, classify AI relevance, and write Markdown, cache JSON, and dashboard outputs.

## Workflow

1. Run the analysis script from the working directory where `reports/github-trending` should be saved.
2. Review the generated Markdown reports first; they are the source publishable articles.
3. Use the generated dashboard at `reports/github-trending/dashboard/index.html` for a visual overview that matches the project dashboard style.
4. Edit generated articles only when the user asks for tone, structure, or editorial refinement.

## Bundled Resources

This skill is self-contained for independent publishing:

- `scripts/analysis-core.mjs`
  - 主分析与报告生成逻辑
- `scripts/dashboard/`
  - dashboard 数据模型与 HTML 渲染器
- `assets/dashboard/`
  - dashboard 样式与图形资源
- `references/`
  - 报告结构、重点关注口径与编辑规范

## Trend Analysis Framework

Use the overall trend section to infer the current GitHub Trending direction from the full project set, not from isolated repositories.

Follow these four standardized steps:

1. `Step 1: 数据获取 (Fetch)`
   - 抓取指定时间范围（Daily / Weekly / Monthly）的 Trending 页面数据。
   - 提取字段至少包括：项目名称、描述、编程语言、Star 增量、Fork 数、核心贡献者列表。
2. `Step 2: 特征提取 (Extract)`
   - 基于项目描述、Trending 摘要与 README 关键内容做快速扫描。
   - 为每个项目打技术标签，例如：`Agent`、`RAG`、`Rust`、`前端框架`、`安全`、`多模态`、`AI Coding`、`MCP`。
3. `Step 3: 宏观归纳 (Synthesize)`
   - 严格从以下三个维度分析趋势：
     - `宏观 What（现象层）`：寻找高 Star 增量项目之间的最大公约数，识别“集群化”演进方向。
     - `宏观 Why（本质层）`：解释为什么社区会集体转向该方向，把微观工程价值升维为行业痛点与范式转移。
     - `宏观 How（支撑层）`：抽象支撑趋势落地的基础设施、架构模式与方法论。
   - 结合当前科技大背景交叉验证趋势合理性，例如：AI 工业化、模型平台化、云原生工程化、多模态内容生产。
4. `Step 4: 结构化输出 (Format)`
   - 每篇报告的 `整体趋势分析` 只输出 `1-2 个核心趋势`。
   - 必须严格使用以下 Markdown 结构：
     - `🔥 核心技术趋势洞察`
     - `📊 趋势拆解分析`
     - `🎯 宏观 What (演进方向)：...`
     - `💡 宏观 Why (核心驱动力)：...`
     - `⚙️ 宏观 How (底层支撑)：...`
     - `🏆 代表项目：...`
     - `⚠️ 潜在风险与冷思考`
   - 保持客观、专业、精炼，避免脱离输入项目数据臆造趋势。

## Quick Start

Run the full daily + weekly + monthly workflow:

```powershell
node .\analyze-github-trending\scripts\run-analysis.mjs --period all
```

Run a single period:

```powershell
node .\analyze-github-trending\scripts\run-analysis.mjs --period daily
node .\analyze-github-trending\scripts\run-analysis.mjs --period weekly
node .\analyze-github-trending\scripts\run-analysis.mjs --period monthly
```

Override the output directory or report date when needed:

```powershell
node .\analyze-github-trending\scripts\run-analysis.mjs --period all --output-dir .\reports\github-trending --date 2026-07-03
```

## Expected Outputs

- Save Markdown reports under `./reports/github-trending/<date>-daily.md`, `<date>-weekly.md`, and `<date>-monthly.md` by default.
- Save a dashboard webpage under `./reports/github-trending/dashboard/index.html`.
- Save parsed Trending JSON and enriched repository JSON under `./reports/github-trending/cache/<date>/`.
- Keep every repository from each selected Trending page.
- Mark AI-related repositories inline with visible `【重点关注：...】` labels.

## Project Card Rules

Every project entry must include:

- project link
- `Star`
- period delta: `今日新增`, `本周新增`, or `本月新增`
- `项目简介`
- `解决场景`
- `技术亮点`
- `为什么会火`
- `AI Insight`

Project-level analysis must be generated through this workflow:

1. `Macro-Synthesis`
   - Use the macro trend conclusions as the period's “时代背景”.
2. `Dynamic Routing`
   - Choose the micro analysis focus from the matched macro trend.
   - If the trend is `AI Agent 工业化`, prioritize `自主性` and `工具调用`.
   - If the trend is `AI 编程增强`, prioritize `上下文管理能力`、`RAG 检索增强`、`代码架构理解`.
3. `Micro-Validation`
   - Summarize each project with the routed framework.
   - If the project aligns with the macro trend, explicitly state how it validates or supports that trend.
   - If the project does not align with the macro trend, do not force a validation claim.

The project analysis must stay compact, Chinese, and answer these questions clearly:

- 项目是什么
- 项目在什么具体场景下解决问题
- 项目的技术亮点是什么
- 项目为什么会火
- 它是否印证了本期宏观趋势

## Review Guidelines

- Treat generated Markdown as publishable drafts.
- Read [references/focus-rubric.md](references/focus-rubric.md) when you need to understand why a repository was marked as `重点关注`.
- Read [references/report-guidelines.md](references/report-guidelines.md) when reshaping the article without changing the data pipeline.
- When revising `整体趋势分析`, keep it anchored to shared pain points and macro trends rather than per-repo summaries.
- When revising project-level `AI Insight`, preserve the macro-to-micro routing logic instead of rewriting each project as an isolated blurb.
- If the user asks for deeper technical commentary, build on cached README-derived notes instead of re-scraping unless the report date or period changed.
