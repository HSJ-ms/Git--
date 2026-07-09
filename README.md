# analyze-github-trending

`analyze-github-trending` 首先是一个通用的 Node.js GitHub Trending 分析工具集，用来抓取 `Daily / Weekly / Monthly` 榜单，补充 README 语义信息，生成可发布的中文 Markdown 报告，并同步输出 dashboard 页面。

`Codex skill` 只是它的一种包装形态。它同样可以被 Claude Code、OpenCode、普通终端脚本，或任何能读取 Markdown 说明并执行 Node.js 脚本的 Agent CLI 直接调用。

## 它能做什么

- 抓取 GitHub Trending 项目列表与基础指标
- 扫描项目描述、Trending 摘要和 README 关键信息
- 为项目打上 `Agent`、`AI Coding`、`MCP`、`RAG`、`安全`、`多模态` 等标签
- 输出严格遵循 `What / Why / How` 的宏观趋势分析
- 为每个项目生成带“时代背景”的 `AI Insight`
- 生成 dashboard 所需的数据和静态页面

## 兼容方式

当前仓库同时提供多种入口，方便不同 Agent CLI 使用，但统一以 `scripts/run-analysis.mjs` 作为唯一执行入口：

- `SKILL.md`
  - 面向 Codex 的技能发现与触发入口
- `CLAUDE.md`
  - 面向 Claude Code 的项目指令入口
- `AGENTS.md`
  - 面向 OpenCode 与其他支持 `AGENTS.md` 约定的代理入口
- `README.md`
  - 面向通用 CLI、人工协作和非特定代理环境的使用说明
- `scripts/run-analysis.mjs`
  - 通用 Node.js 命令行入口，不依赖 Codex

## 输出内容

默认会生成以下产物：

- `reports/github-trending/<date>-daily.md`
- `reports/github-trending/<date>-weekly.md`
- `reports/github-trending/<date>-monthly.md`
- `reports/github-trending/cache/<date>/`
- `reports/github-trending/dashboard/index.html`

其中：

- Markdown 报告是主产物，也是对外发布时的权威内容
- `cache/<date>/` 是中间结构化数据，方便调试、复核与二次处理
- dashboard 页面是和 Markdown 同步的 Web 展示层，不应引入额外结论

报告中的趋势部分会输出：

- `🔥 核心技术趋势洞察`
- `📊 趋势拆解分析`
- `🎯 宏观 What`
- `💡 宏观 Why`
- `⚙️ 宏观 How`
- `🏆 代表项目`
- `⚠️ 潜在风险与冷思考`

项目部分会输出：

- `项目简介`
- `解决场景`
- `技术亮点`
- `为什么会火`
- `AI Insight`

## 目录结构

```text
analyze-github-trending/
├─ SKILL.md
├─ README.md
├─ agents/
│  └─ openai.yaml
├─ assets/
│  └─ dashboard/
├─ references/
│  ├─ focus-rubric.md
│  └─ report-guidelines.md
└─ scripts/
   ├─ analysis-core.mjs
   ├─ run-analysis.mjs
   ├─ self-check.mjs
   └─ dashboard/
```

## 快速开始

建议使用带内置 `fetch` 的 Node.js 运行时。
建议在仓库根目录执行以下命令。

运行全量流程：

```powershell
node .\scripts\run-analysis.mjs --period all
```

只运行单个周期：

```powershell
node .\scripts\run-analysis.mjs --period daily
node .\scripts\run-analysis.mjs --period weekly
node .\scripts\run-analysis.mjs --period monthly
```

指定输出目录与日期：

```powershell
node .\scripts\run-analysis.mjs --period all --output-dir ..\reports\github-trending --date 2026-07-06
```

如果该目录被其他项目以子目录形式引用，例如 `./analyze-github-trending/`，则将命令改为：

```powershell
node .\analyze-github-trending\scripts\run-analysis.mjs --period all
```

## 通用性原则

- 执行不依赖 Codex 专属 API、工具协议或隐藏上下文；只需要 Node.js 与公开的 GitHub 页面访问能力
- `README.md`、`AGENTS.md`、`CLAUDE.md` 负责适配不同 Agent CLI 的阅读入口，但不改变核心执行链路
- `scripts/analysis-core.mjs` 与 `references/report-guidelines.md` 才是核心逻辑与输出约束的真实来源
- dashboard 必须复用与 Markdown 相同的趋势结论和项目分析，不得产生两套独立口径

## Agent CLI 适配约定

如果你在不同的代理环境中使用：

- Claude Code
  - 让代理优先读取项目根目录的 `CLAUDE.md`
  - 再根据需要读取 `README.md`、`references/report-guidelines.md` 和 `scripts/analysis-core.mjs`
- OpenCode
  - 让代理优先读取项目根目录的 `AGENTS.md`
  - 再执行 `node .\scripts\run-analysis.mjs ...`
- 其他 Agent CLI
  - 直接把本仓库当作一个普通 Node.js 工具使用
  - 读取 `README.md` 了解命令，读取 `references/` 了解报告约束

## 测试

运行核心测试：

```powershell
node --test .\scripts\analysis-core.test.mjs
node --test .\scripts\dashboard\dashboard-data.test.mjs .\scripts\dashboard\dashboard-render.test.mjs
```

运行一次真实链路自检：

```powershell
node .\scripts\self-check.mjs
```

## 与 SKILL.md 的分工

- `README.md`：给人和通用 Agent CLI 看，说明工具定位、结构、运行方式与输出结果
- `SKILL.md`：给 Codex 用，只负责技能发现与高信号执行约束，不是唯一事实来源
- `CLAUDE.md`：给 Claude Code 用，提供最小但高信号的项目级执行说明
- `AGENTS.md`：给 OpenCode 和其他支持该约定的代理用，提供可执行规则与命令入口

如果要把这个目录独立发布到其他 Agent CLI 环境，至少保留以下内容即可完整工作：

- `README.md`
- `AGENTS.md` 或 `CLAUDE.md`
- `references/`
- `scripts/`
- `assets/dashboard/`

如果你要修改趋势分析逻辑，优先查看：

- [SKILL.md](./SKILL.md)
- [CLAUDE.md](./CLAUDE.md)
- [AGENTS.md](./AGENTS.md)
- [references/report-guidelines.md](./references/report-guidelines.md)
- [scripts/analysis-core.mjs](./scripts/analysis-core.mjs)
