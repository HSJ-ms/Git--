# Report Guidelines

Use these rules when refining generated Markdown or HTML output.

## Article Goal

Write Chinese articles that can be published externally without additional restructuring.

## Required Reports

Generate three separate Markdown reports when running the full workflow:

1. `GitHub Trending 日报`
2. `GitHub Trending 周报`
3. `GitHub Trending 月报`

Each report must include:

1. Title with period and date
2. `整体趋势分析`
3. `项目清单`

Do not create a separate focus-only section. Show `【重点关注：...】` inline on affected project entries only, and keep the full project list unchanged.

## Repository Entry Requirements

Every repository entry must include:

- project name with hyperlink
- project link
- `Star`
- period delta: `今日新增`, `本周新增`, or `本月新增`
- `项目简介`
- `解决场景`
- `技术亮点`
- `为什么会火`
- `AI Insight`

The repository analysis should stay compact and publish-ready. Write it in Chinese and answer:

- 项目是什么
- 项目在什么具体场景下解决问题
- 项目的技术亮点是什么
- 项目为什么会火
- 它是否印证了本期宏观趋势

## Overall Trend Analysis Rules

The `整体趋势分析` section must summarize the whole Trending set into `1-2 个核心趋势`, not a loose collection of per-project observations.

Use this logic:

1. `宏观 What（现象层）`
   - 寻找高 Star 增量项目之间的“最大公约数”。
   - 将孤立工具抽象为行业演进方向，而不是停留在项目罗列。
2. `宏观 Why（本质层）`
   - 回答“为什么整个社区都在向这个方向发力”。
   - 将微观工程价值升维为行业痛点与范式转移。
3. `宏观 How（支撑层）`
   - 分析支撑趋势落地的通用工具链、架构模式或开发方法论。
   - 提炼社区正在沉淀的基础设施与标准化规范。
4. `结构化输出`
   - 严格使用以下 Markdown 结构：
     - `🔥 核心技术趋势洞察`
     - `📊 趋势拆解分析`
     - `🎯 宏观 What (演进方向)：...`
     - `💡 宏观 Why (核心驱动力)：...`
     - `⚙️ 宏观 How (底层支撑)：...`
     - `🏆 代表项目：...`
     - `⚠️ 潜在风险与冷思考`
   - 语言保持客观、专业、精炼，归纳必须锚定输入项目数据。

## AI Insight Routing Rules

For the second section, do not treat projects as isolated blurbs. Use the macro trend result as the background layer for each repository.

1. `Macro-Synthesis`
   - Take the macro trend conclusion as the period's “时代背景”.
2. `Dynamic Routing`
   - Route the micro analysis focus according to the matched macro trend.
   - `AI Agent 工业化` 优先看：自主性、工具调用、多阶段编排、长期记忆。
   - `AI 编程增强` 优先看：上下文管理、RAG 检索增强、代码架构理解、仓库级索引。
   - `模型平台化` 优先看：统一协议、推理网关、成本控制、部署运维。
3. `Micro-Validation`
   - If the project aligns with the macro trend, explicitly say how it validates or supports that trend.
   - If the project does not align with the macro trend, do not force a validation claim.

## Dashboard Direction

- Generate a webpage in the bundled `analyze-github-trending/assets/dashboard/` dark information-board style.
- Show tabs for daily, weekly, and monthly when all periods are available.
- Sync the dashboard hero and trend panel with the same `整体趋势分析` results used in Markdown.
- Emphasize focus projects with clear inline badges and dashboard chips.
- Preserve the project-level ranking and do not remove non-focus repositories.

## Tone

- Write in Chinese.
- Keep the tone analytical, concrete, and outward-facing.
- Use README-derived details when they are specific enough to explain the project.
- Avoid pretending to have audited the whole codebase when the input is the repo description plus rendered README.
