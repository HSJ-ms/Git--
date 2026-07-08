import { copyFile, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { renderDashboardHtml } from "./dashboard/render-dashboard.mjs";

const USER_AGENT =
  "Mozilla/5.0 (compatible; GitHubTrendingAIAnalyst/3.0; +https://github.com)";

const SKILL_DIR = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const PERIOD_ORDER = ["daily", "weekly", "monthly"];

const PERIOD_CONFIG = {
  daily: {
    deltaLabel: "今日新增",
    titleLabel: "GitHub Trending 日报",
    listLabel: "日榜",
  },
  weekly: {
    deltaLabel: "本周新增",
    titleLabel: "GitHub Trending 周报",
    listLabel: "周榜",
  },
  monthly: {
    deltaLabel: "本月新增",
    titleLabel: "GitHub Trending 月报",
    listLabel: "月榜",
  },
};

const FOCUS_RULES = [
  {
    id: "ai-dev-automation",
    label: "AI 软件开发/代码自动化",
    keywords: [
      "coding agent",
      "coding agents",
      "code generation",
      "code review",
      "code search",
      "code intelligence",
      "codebase memory",
      "software engineering",
      "developer tool",
      "developer workflow",
      "coding assistant",
      "test generation",
      "repo automation",
      "agent-native",
      "coding workflow",
      "design spec for coding agents",
      "ai coding",
      "ade",
      "ide",
    ],
  },
  {
    id: "ai-agents",
    label: "AI 智能体及其辅助工作",
    keywords: [
      "agent",
      "multi-agent",
      "tool calling",
      "workflow automation",
      "workflow",
      "browser use",
      "orchestrator",
      "planner",
      "memory",
      "evaluation",
      "guardrail",
      "copilot",
      "mcp",
      "autonomous",
      "agent toolkit",
      "gui agent",
      "agentic",
    ],
  },
  {
    id: "ai-open-source",
    label: "AI 开源项目",
    keywords: [
      "llm",
      "language model",
      "ai model",
      "machine learning",
      "inference",
      "fine-tuning",
      "finetuning",
      "embedding",
      "rag",
      "diffusion",
      "vision",
      "speech",
      "audio",
      "video generation",
      "multimodal",
      "dataset",
      "transformer",
      "genai",
      "artificial intelligence",
      "openai-compatible",
      "foundation model",
      "ai",
    ],
  },
];

const FOCUS_ORDER = Object.fromEntries(FOCUS_RULES.map((rule, index) => [rule.label, index]));

const THEME_RULES = [
  {
    id: "coding",
    label: "AI 编程与开发自动化",
    narrative: "热点项目正在把 AI 能力接入真实的软件研发流程。",
    keywords: [
      "coding agent",
      "code review",
      "software engineering",
      "developer tool",
      "developer workflow",
      "code intelligence",
      "repo automation",
      "agent-native",
      "mcp",
      "ade",
      "cli",
      "ide",
    ],
  },
  {
    id: "agents",
    label: "智能体与自动化工作流",
    narrative: "社区继续把智能体拆成更可编排、可复用、可落地的工作流组件。",
    keywords: [
      "agent",
      "agentic",
      "workflow",
      "orchestrator",
      "planner",
      "memory",
      "browser use",
      "tool calling",
      "mcp",
      "copilot",
    ],
  },
  {
    id: "models",
    label: "模型能力与推理基础设施",
    narrative: "模型能力、推理效率和模型接入层仍然是持续升温的基础赛道。",
    keywords: [
      "llm",
      "model",
      "inference",
      "fine-tuning",
      "embedding",
      "rag",
      "token",
      "prompt",
      "openai-compatible",
    ],
  },
  {
    id: "multimodal",
    label: "多模态内容生成",
    narrative: "视频、图像、语音等多模态工具仍然是容易冲榜的热门形态。",
    keywords: [
      "image",
      "video",
      "audio",
      "speech",
      "voice",
      "vision",
      "multimodal",
      "diffusion",
      "avatar",
    ],
  },
  {
    id: "infra",
    label: "平台基础设施与工程化",
    narrative: "高热项目也在补齐平台层、部署层和工程整合层的能力。",
    keywords: [
      "platform",
      "infrastructure",
      "deploy",
      "cloud",
      "runtime",
      "api",
      "sdk",
      "database",
      "self-host",
      "server",
      "observability",
    ],
  },
];

const TECH_TAG_RULES = [
  {
    id: "agent",
    label: "Agent",
    keywords: ["agent", "agentic", "multi-agent", "autonomous", "copilot"],
  },
  {
    id: "ai-coding",
    label: "AI Coding",
    keywords: [
      "coding agent",
      "code review",
      "code generation",
      "code search",
      "code intelligence",
      "software engineering",
      "developer workflow",
      "repo automation",
      "coding assistant",
      "ade",
      "ide",
      "cli",
    ],
  },
  {
    id: "workflow",
    label: "Workflow",
    keywords: ["workflow", "orchestrator", "planner", "tool calling", "browser use", "automation"],
  },
  {
    id: "mcp",
    label: "MCP",
    keywords: ["mcp", "model context protocol"],
  },
  {
    id: "rag",
    label: "RAG",
    keywords: ["rag", "retrieval", "embedding", "vector", "knowledge graph", "knowledge base"],
  },
  {
    id: "model-infra",
    label: "Model Infra",
    keywords: [
      "llm",
      "language model",
      "model serving",
      "model router",
      "provider",
      "inference",
      "fine-tuning",
      "finetuning",
      "openai-compatible",
    ],
  },
  {
    id: "multimodal",
    label: "Multimodal",
    keywords: ["multimodal", "vision", "video", "image", "audio", "speech", "voice", "avatar"],
  },
  {
    id: "video",
    label: "Video",
    keywords: ["video", "short video", "movie", "montage", "video production"],
  },
  {
    id: "audio",
    label: "Audio",
    keywords: ["audio", "speech", "voice", "tts", "voice studio"],
  },
  {
    id: "security",
    label: "安全",
    keywords: ["security", "cybersecurity", "pentest", "pentesting", "vulnerability", "guardrail"],
  },
  {
    id: "frontend",
    label: "前端框架",
    keywords: ["frontend", "react", "next.js", "nextjs", "vue", "svelte", "tailwind", "design system"],
  },
  {
    id: "rust",
    label: "Rust",
    keywords: ["rust"],
  },
  {
    id: "infra",
    label: "Infra",
    keywords: [
      "infrastructure",
      "platform",
      "deploy",
      "cloud",
      "runtime",
      "server",
      "container",
      "docker",
      "kubernetes",
      "observability",
    ],
  },
  {
    id: "self-hosted",
    label: "Self-Hosted",
    keywords: ["self-hosted", "self hosted", "local processing", "local-first", "on-prem", "offline"],
  },
  {
    id: "privacy",
    label: "隐私",
    keywords: ["privacy", "private", "end-to-end", "e2ee"],
  },
  {
    id: "data",
    label: "数据采集",
    keywords: ["crawler", "scraper", "data collection", "extractor", "etl"],
  },
  {
    id: "evaluation",
    label: "Evaluation",
    keywords: ["evaluation", "benchmark", "judge", "grader", "eval"],
  },
  {
    id: "research",
    label: "Research",
    keywords: ["research framework", "analysis system", "quant", "investment", "resume"],
  },
];

const TREND_RULES = [
  {
    id: "ai-coding-engineering",
    name: "AI 编程从单点辅助走向工程化工作流",
    keywords: [
      "coding agent",
      "code review",
      "software engineering",
      "developer workflow",
      "repo automation",
      "code intelligence",
      "ade",
      "ide",
      "mcp",
      "workflow",
    ],
    tagLabels: ["AI Coding", "Workflow", "MCP", "Agent", "Infra", "Rust"],
    themeLabels: ["AI 编程与开发自动化", "智能体与自动化工作流"],
    focusLabels: ["AI 软件开发/代码自动化", "AI 智能体及其辅助工作"],
    overview:
      "本期高增项目的最大公约数不是单个插件或脚本，而是让 AI 真正接入真实仓库、真实上下文和真实研发流程的工程化能力。",
    what:
      "高 Star 增量项目正在从“补一个能力点”演进为“补一整条研发链路”，共同指向 AI 编程增强与工程化工作流这一集群化方向。",
    why:
      "社区集体发力的根因，是大模型在大型代码库中存在上下文窗口受限、仓库级记忆缺失和任务交接脆弱等瓶颈，迫使 AI 编程从单文件补全转向全库架构级理解与执行。",
    how:
      "支撑这一趋势落地的底层支撑，正在收敛为 MCP 接口、仓库级索引/RAG、代码知识图谱、终端工作流接入以及可编排的 Agent 链路。",
    risk:
      "潜在风险在于，很多项目仍停留在工作流包装层，若缺少稳定的上下文管理、索引质量和可验证执行闭环，工程化承诺容易沦为演示效果。",
    routeLabels: ["AI 编程增强与深度洞察", "AI 编程从单点辅助走向工程化工作流"],
  },
  {
    id: "agent-execution-loop",
    name: "智能体开始补齐执行闭环、记忆与工具编排",
    keywords: [
      "agent",
      "agentic",
      "workflow",
      "orchestrator",
      "planner",
      "memory",
      "browser use",
      "tool calling",
      "mcp",
      "copilot",
    ],
    tagLabels: ["Agent", "Workflow", "MCP", "Evaluation", "AI Coding"],
    themeLabels: ["智能体与自动化工作流"],
    focusLabels: ["AI 智能体及其辅助工作"],
    overview:
      "社区正在把智能体从聊天式能力模块，推向具备执行闭环、工具调用、记忆和多阶段编排的工业化系统。",
    what:
      "多个高增项目的共同演进方向，是让 Agent 从单轮交互接口升级为可持续运行、可调度、可接入外部工具链的全链路系统。",
    why:
      "其背后的范式转移是，单轮问答式 Agent 已无法覆盖真实业务中的长链路任务，行业开始追求具备稳定执行、自主性和可复用流水线的智能体基础能力。",
    how:
      "支撑这一趋势的通用方法论包括多 Agent 协同架构、工具调用协议、任务编排器、长期记忆层以及浏览器/终端等执行接口的标准化接入。",
    risk:
      "潜在风险在于，Agent 工业化很容易堆叠复杂度；如果缺少评测、权限控制和故障回滚机制，系统会在真实环境中暴露稳定性与安全性问题。",
    routeLabels: ["AI 智能体的工业化与具身化", "智能体开始补齐执行闭环、记忆与工具编排"],
  },
  {
    id: "model-platform",
    name: "模型接入与推理基础设施继续平台化",
    keywords: [
      "llm",
      "model",
      "inference",
      "fine-tuning",
      "finetuning",
      "embedding",
      "rag",
      "openai-compatible",
      "provider",
      "router",
      "serving",
      "runtime",
    ],
    tagLabels: ["Model Infra", "RAG", "Infra", "Self-Hosted", "Rust"],
    themeLabels: ["模型能力与推理基础设施", "平台基础设施与工程化"],
    focusLabels: ["AI 开源项目"],
    overview:
      "高热项目正在把模型层竞争，转化为接入层、推理层和运维层的系统化竞争。",
    what:
      "孤立的模型调用工具正在聚合成统一的模型平台化方向，重点从“接哪个模型”转向“如何稳定、低成本、可控地接入和运行模型”。",
    why:
      "社区共同发力的根因，是多模型时代带来的接口碎片化、推理成本攀升和部署复杂度失控，推动行业从模型试用走向平台整合与成本优化。",
    how:
      "支撑该趋势的基础设施包括 OpenAI-compatible 协议、模型路由层、推理网关、自托管部署栈、缓存与检索增强，以及围绕吞吐与成本的运维工程体系。",
    risk:
      "潜在风险在于，平台化项目容易陷入协议兼容与功能堆叠，但若缺乏足够的性能、观测性和成本控制优势，很难形成真正护城河。",
    routeLabels: ["模型接入与推理基础设施继续平台化"],
  },
  {
    id: "multimodal-production",
    name: "多模态内容生成正在产品化和流水线化",
    keywords: [
      "video",
      "image",
      "audio",
      "speech",
      "voice",
      "multimodal",
      "avatar",
      "diffusion",
      "editing",
    ],
    tagLabels: ["Multimodal", "Video", "Audio", "Workflow", "Self-Hosted"],
    themeLabels: ["多模态内容生成"],
    focusLabels: ["AI 开源项目"],
    overview:
      "榜单中的多模态项目，正在从单点生成器演变为围绕内容生产链路的系统化流水线。",
    what:
      "高增项目的集群化方向，是把视频、语音、图像等离散能力重新组装为可批量生产、可自动化交付的多模态内容流水线。",
    why:
      "社区转向这一方向的核心驱动力，是单点生成工具已无法解决真实生产中的链路断裂、素材组织和人机协作效率问题，AI 内容生成因此进入工业化阶段。",
    how:
      "底层支撑正在沉淀为多 Agent 协同编排、素材采集与处理链、统一的内容生产工作流、自托管运行环境以及围绕渲染/审核/发布的自动化方法论。",
    risk:
      "风险在于，多模态流水线项目容易因外部模型依赖、渲染成本和内容质量波动而失真，若没有稳定产能与评估机制，增长可能先于交付能力。",
    routeLabels: ["AI 智能体的工业化与具身化", "多模态内容生成正在产品化和流水线化"],
  },
  {
    id: "security-automation",
    name: "安全自动化与研究辅助工具持续获得关注",
    keywords: [
      "security",
      "cybersecurity",
      "vulnerability",
      "pentest",
      "pentesting",
      "guardrail",
      "analysis system",
      "research framework",
    ],
    tagLabels: ["安全", "Evaluation", "Research", "Infra", "数据采集"],
    themeLabels: ["平台基础设施与工程化"],
    focusLabels: [],
    overview:
      "安全与研究类项目的热度上升，说明社区正在把高度依赖专家经验的流程，重新编码为可复用的 AI 工作流和技能体系。",
    what:
      "高增项目并非孤立的安全工具，而是在共同推动 AI 安全与研究自动化这一演进方向，把攻防、验证和分析流程系统化。",
    why:
      "其本质驱动力，是安全检测与研究分析长期存在流程重复、专家稀缺和验证成本高的问题，推动社区将经验型框架转化为 AI 可执行的方法论。",
    how:
      "支撑该趋势的底层支撑包括结构化技能集、MITRE/ATT&CK 等框架映射、AI 驱动的评测与红队链路、自动化数据采集以及标准流程模板化。",
    risk:
      "风险在于，安全自动化若只做知识搬运而没有高质量验证与权限边界，会放大误报、误用甚至攻击滥用的风险。",
    routeLabels: ["AI 安全与红队测试", "安全自动化与研究辅助工具持续获得关注"],
  },
];

const INTENT_RULES = [
  {
    keywords: ["video", "short video", "video production", "montage", "movie"],
    what: "AI 视频生成与自动化制作",
    why: "把脚本、素材、剪辑和成片流程尽量自动化",
    problem: "视频生产链路长、工具切换频繁、协作成本高的问题",
  },
  {
    keywords: ["voice", "audio", "speech", "tts", "voice studio"],
    what: "语音与音频生成能力",
    why: "更快搭建语音创作、配音或音频交互场景",
    problem: "语音生成、克隆和音频处理门槛高的问题",
  },
  {
    keywords: ["design system", "visual identity", "design.md", "design spec"],
    what: "设计系统与 AI 协作规范",
    why: "让编码代理更稳定地理解设计语言和视觉约束",
    problem: "设计意图难传递、前端实现容易跑偏的问题",
  },
  {
    keywords: ["code intelligence", "codebase", "coding agent", "ade", "repo automation", "developer workflow"],
    what: "AI 编码、代码理解与开发工作流",
    why: "让 AI 真正接入真实仓库、代码上下文和研发流程",
    problem: "代码上下文难获取、自动化流程不顺、工程接入成本高的问题",
  },
  {
    keywords: ["agent", "agentic", "orchestrator", "memory", "browser use", "gui agent", "mcp"],
    what: "智能体编排、记忆或执行能力",
    why: "提升 Agent 的可用性、可控性和执行闭环能力",
    problem: "Agent 缺少工具接入、记忆能力或稳定执行链路的问题",
  },
  {
    keywords: ["stock", "investment", "research framework", "resume", "evaluate", "analysis system"],
    what: "AI 分析与决策辅助工具",
    why: "把复杂分析流程标准化，并提升决策效率",
    problem: "研究信息分散、分析效率低、结果难复用的问题",
  },
  {
    keywords: ["messaging", "chat", "private", "privacy"],
    what: "通信与隐私保护工具",
    why: "构建更安全、去标识化的沟通体验",
    problem: "传统通信依赖身份标识、隐私边界不清的问题",
  },
  {
    keywords: ["container", "virtual machine", "linux containers", "docker"],
    what: "容器与本地开发基础设施",
    why: "更轻量地搭建隔离环境和本地运行能力",
    problem: "开发环境搭建重、隔离运行不便的问题",
  },
  {
    keywords: ["crawler", "scraper", "media crawler", "platform crawler"],
    what: "内容采集与平台数据抓取工具",
    why: "快速构建多平台的数据收集和监测流程",
    problem: "多平台抓取分散、维护成本高的问题",
  },
  {
    keywords: ["openai-compatible", "provider", "model catalog", "router", "models"],
    what: "模型接入与统一代理层",
    why: "用统一接口管理多个模型和推理服务",
    problem: "多模型接入分散、切换和容灾复杂的问题",
  },
  {
    keywords: ["security", "cybersecurity", "pentesting", "vulnerabilities"],
    what: "安全能力与漏洞验证工具",
    why: "更快搭建安全测试、验证或防护流程",
    problem: "安全检测流程重、知识和工具分散的问题",
  },
];

const MICRO_ANALYSIS_RULES = [
  {
    id: "agent-industrialization",
    labels: ["智能体开始补齐执行闭环、记忆与工具编排", "AI 智能体的工业化与具身化"],
    prioritySignals: ["自主性", "工具调用", "多阶段编排", "执行闭环", "长周期记忆"],
    validation:
      "若项目具备 Agent、Workflow、MCP、Browser Use、Memory 等信号，必须明确指出它如何印证智能体工业化趋势。",
  },
  {
    id: "ai-coding",
    labels: ["AI 编程从单点辅助走向工程化工作流", "AI 编程增强与深度洞察"],
    prioritySignals: ["上下文管理", "RAG 检索增强", "代码架构理解", "仓库级索引", "工程接入"],
    validation:
      "若项目具备 AI Coding、Code Intelligence、RAG、MCP、Repo Automation 等信号，必须说明它如何支撑 AI 编程增强趋势。",
  },
  {
    id: "model-platform",
    labels: ["模型接入与推理基础设施继续平台化"],
    prioritySignals: ["模型接入层", "推理网关", "成本控制", "部署运维", "统一协议"],
    validation:
      "若项目具备 Model Infra、Provider Router、Inference、Self-Hosted 等信号，必须说明它如何支撑模型平台化趋势。",
  },
  {
    id: "multimodal-pipeline",
    labels: ["多模态内容生成正在产品化和流水线化"],
    prioritySignals: ["内容流水线", "多模态编排", "自动化生产", "渲染链路", "数据采集"],
    validation:
      "若项目具备 Multimodal、Video、Audio、Workflow 等信号，必须说明它如何印证内容生产流水线趋势。",
  },
  {
    id: "security-automation",
    labels: ["安全自动化与研究辅助工具持续获得关注"],
    prioritySignals: ["攻防自动化", "结构化技能", "评测验证", "标准框架映射", "研究效率"],
    validation:
      "若项目具备 安全、Evaluation、Research、Skills 等信号，必须说明它如何支撑 AI 安全或研究自动化趋势。",
  },
];

const TREND_RULE_MAP = new Map(TREND_RULES.map((rule) => [rule.id, rule]));

const PRIORITY_SIGNAL_HINTS = {
  自主性: ["autonomous", "agentic", "copilot", "planner"],
  工具调用: ["tool calling", "tool use", "browser use", "mcp", "gui agent"],
  多阶段编排: ["workflow", "orchestrator", "pipeline", "multi-agent"],
  执行闭环: ["execution", "automation", "runtime", "terminal"],
  长周期记忆: ["memory", "persistent", "knowledge base", "knowledge graph"],
  上下文管理: ["context", "codebase", "memory", "repo automation"],
  "RAG 检索增强": ["rag", "retrieval", "embedding", "vector", "knowledge graph"],
  代码架构理解: ["code intelligence", "software engineering", "architecture", "code search"],
  仓库级索引: ["repo automation", "codebase", "index", "workspace"],
  工程接入: ["cli", "ide", "terminal", "developer workflow", "mcp"],
  模型接入层: ["openai-compatible", "provider", "sdk", "api"],
  推理网关: ["router", "gateway", "serving", "inference"],
  成本控制: ["cost", "latency", "throughput", "cache"],
  部署运维: ["deploy", "self-hosted", "runtime", "observability"],
  统一协议: ["openai-compatible", "protocol", "provider", "router"],
  内容流水线: ["video production", "montage", "workflow", "pipeline"],
  多模态编排: ["multimodal", "video", "audio", "image", "avatar"],
  自动化生产: ["automation", "generation", "render", "publish"],
  渲染链路: ["render", "editing", "video", "audio"],
  数据采集: ["crawler", "scraper", "data collection", "extractor"],
  攻防自动化: ["security", "cybersecurity", "pentest", "vulnerability"],
  结构化技能: ["skills", "skill", "framework", "att&ck"],
  评测验证: ["evaluation", "benchmark", "judge", "grader"],
  标准框架映射: ["mitre", "att&ck", "framework", "taxonomy"],
  研究效率: ["research framework", "analysis system", "resume", "investment"],
};

const STOP_SENTENCES = [
  "license",
  "contributing",
  "installation",
  "quickstart",
  "getting started",
  "table of contents",
  "roadmap",
  "acknowledgement",
  "faq",
  "requirements",
  "usage",
];

const CJK_PATTERN = /[\u3400-\u9fff]/u;

function localDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseArgs(argv) {
  const options = {
    period: "all",
    outputDir: "./reports/github-trending",
    date: localDateString(),
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--period") {
      options.period = argv[index + 1] ?? "";
      index += 1;
      continue;
    }
    if (arg === "--output-dir") {
      options.outputDir = argv[index + 1] ?? "";
      index += 1;
      continue;
    }
    if (arg === "--date") {
      options.date = argv[index + 1] ?? "";
      index += 1;
      continue;
    }
    if (arg === "--help" || arg === "-h") {
      options.help = true;
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  if (options.period === "both") {
    options.period = "all";
  }

  if (![...PERIOD_ORDER, "all"].includes(options.period)) {
    throw new Error("--period must be one of: daily, weekly, monthly, all");
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(options.date)) {
    throw new Error("--date must use YYYY-MM-DD");
  }

  return options;
}

function usage() {
  return [
    "Usage:",
    "  node analyze-github-trending/scripts/run-analysis.mjs --period daily|weekly|monthly|all [--output-dir <dir>] [--date YYYY-MM-DD]",
    "",
    "Outputs:",
    "  <output-dir>/<date>-daily.md, <date>-weekly.md, <date>-monthly.md",
    "  <output-dir>/dashboard/index.html",
    "  <output-dir>/cache/<date>/*.json",
  ].join("\n");
}

async function fetchText(url, attempt = 1) {
  const response = await fetch(url, {
    headers: {
      "user-agent": USER_AGENT,
      accept: "text/html,application/xhtml+xml",
    },
  });

  if (!response.ok) {
    if (attempt < 3 && response.status >= 500) {
      return fetchText(url, attempt + 1);
    }
    throw new Error(`Request failed for ${url}: ${response.status} ${response.statusText}`);
  }

  return response.text();
}

async function writeUtf8File(filePath, text, withBom = false) {
  const content = withBom ? `\ufeff${text}` : text;
  await writeFile(filePath, content, "utf8");
}

function decodeHtmlEntities(text) {
  return text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, decimal) => String.fromCodePoint(Number.parseInt(decimal, 10)));
}

function normalizeWhitespace(text) {
  return String(text ?? "")
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function stripHtml(html) {
  const withBreaks = String(html ?? "")
    .replace(/<\s*br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|section|article|li|h1|h2|h3|h4|h5|h6|pre|blockquote)>/gi, "\n")
    .replace(/<li[^>]*>/gi, "- ")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "");

  return normalizeWhitespace(decodeHtmlEntities(withBreaks.replace(/<[^>]+>/g, " ")));
}

function trimToLength(text, maxLength) {
  if (!text || text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, maxLength - 3).trim()}...`;
}

function parseCount(text) {
  if (!text) {
    return 0;
  }
  return Number.parseInt(String(text).replace(/,/g, ""), 10) || 0;
}

function formatCount(value) {
  return new Intl.NumberFormat("en-US").format(value ?? 0);
}

function escapeRegex(text) {
  return String(text).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function keywordToRegex(keyword) {
  const escaped = escapeRegex(keyword.trim()).replace(/\\ /g, "\\s+");
  if (!escaped) {
    return null;
  }
  if (CJK_PATTERN.test(keyword)) {
    return new RegExp(escaped, "iu");
  }
  return new RegExp(`(?<![a-z0-9])${escaped}(?![a-z0-9])`, "iu");
}

function splitArticles(html) {
  return String(html)
    .split('<article class="Box-row">')
    .slice(1)
    .map((article) => article.split("</article>")[0])
    .filter(Boolean);
}

function parseTrendingHtml(html, period) {
  const config = PERIOD_CONFIG[period];
  if (!config) {
    throw new Error(`Unsupported period: ${period}`);
  }

  const articles = splitArticles(html);
  return articles.map((article, index) => {
    const repoMatch = article.match(/<h2[^>]*>[\s\S]*?<a[^>]*href="\/([^"/]+\/[^"/]+)"/i);
    if (!repoMatch) {
      throw new Error(`Could not parse repository path for ${period} article #${index + 1}`);
    }

    const repoPath = repoMatch[1].trim();
    const [owner, name] = repoPath.split("/");
    const descriptionMatch = article.match(
      /<p[^>]*class="[^"]*col-9[^"]*color-fg-muted[^"]*"[^>]*>([\s\S]*?)<\/p>/i,
    );
    const languageMatch = article.match(
      /<span[^>]*itemprop="programmingLanguage"[^>]*>([\s\S]*?)<\/span>/i,
    );
    const starsMatch = article.match(
      new RegExp(
        `href="/${escapeRegex(repoPath).replace("/", "\\/")}/stargazers"[\\s\\S]*?>\\s*([\\d,]+)\\s*<\\/a>`,
        "i",
      ),
    );
    const forksMatch = article.match(
      new RegExp(
        `href="/${escapeRegex(repoPath).replace("/", "\\/")}/forks"[\\s\\S]*?>\\s*([\\d,]+)\\s*<\\/a>`,
        "i",
      ),
    );
    const deltaMatch = stripHtml(article).match(/([\d,]+)\s+stars\s+(?:this\s+)?(week|month|today)/i);
    const contributorMatches = [
      ...article.matchAll(/href="\/([^"/?#]+)"[^>]*>\s*<img[^>]*class="[^"]*avatar-user[^"]*"[^>]*alt="@([^"]+)"/gi),
    ];
    const contributors = contributorMatches.map((match) => ({
      login: match[2]?.trim() || match[1]?.trim() || "",
      profile: `https://github.com/${match[1]?.trim() || match[2]?.trim() || ""}`,
    }));

    return {
      period,
      rank: index + 1,
      owner,
      name,
      fullName: repoPath,
      projectLink: `https://github.com/${repoPath}`,
      description: descriptionMatch ? trimToLength(stripHtml(descriptionMatch[1]), 220) : "",
      language: languageMatch ? stripHtml(languageMatch[1]) : "",
      stars: parseCount(starsMatch?.[1]),
      forks: parseCount(forksMatch?.[1]),
      deltaStars: parseCount(deltaMatch?.[1]),
      deltaLabel: config.deltaLabel,
      contributors,
      trendingSnippet: trimToLength(stripHtml(article), 1000),
    };
  });
}

function extractJsonArrayAfterKey(html, key) {
  const marker = `"${key}":`;
  const start = html.indexOf(marker);
  if (start === -1) {
    return null;
  }

  let cursor = start + marker.length;
  while (cursor < html.length && /\s/.test(html[cursor])) {
    cursor += 1;
  }
  if (html[cursor] !== "[") {
    return null;
  }

  let depth = 0;
  let inString = false;
  let escaping = false;

  for (let index = cursor; index < html.length; index += 1) {
    const char = html[index];
    if (escaping) {
      escaping = false;
      continue;
    }
    if (char === "\\") {
      escaping = true;
      continue;
    }
    if (char === '"') {
      inString = !inString;
      continue;
    }
    if (inString) {
      continue;
    }
    if (char === "[") {
      depth += 1;
      continue;
    }
    if (char === "]") {
      depth -= 1;
      if (depth === 0) {
        return html.slice(cursor, index + 1);
      }
    }
  }

  return null;
}

function splitIntoSentences(text) {
  return normalizeWhitespace(text)
    .split(/\n+|(?<=[。！？?!.])\s+/u)
    .map((line) => line.trim())
    .filter(Boolean);
}

function looksUsefulSentence(sentence) {
  if (!sentence || sentence.length < 18 || sentence.length > 220) {
    return false;
  }
  const lowered = sentence.toLowerCase();
  if (STOP_SENTENCES.some((stop) => lowered.includes(stop))) {
    return false;
  }
  if ((sentence.match(/\|/g) || []).length >= 2) {
    return false;
  }
  if (/^(npm|pnpm|yarn|pip|cargo|go)\s/i.test(lowered)) {
    return false;
  }
  if (/^(english|中文|español|français|deutsch|日本語)/iu.test(sentence)) {
    return false;
  }
  if (/[{}<>]{2,}/.test(sentence)) {
    return false;
  }
  return true;
}

function extractUsefulSentences(text, limit = 3) {
  const sentences = [];
  for (const sentence of splitIntoSentences(text || "")) {
    if (!looksUsefulSentence(sentence)) {
      continue;
    }
    sentences.push(sentence);
    if (sentences.length >= limit) {
      break;
    }
  }
  return sentences;
}

function pickReadmeHighlight(readmeText, description) {
  const normalizedDescription = normalizeWhitespace(description || "").toLowerCase();
  for (const sentence of extractUsefulSentences(readmeText, 5)) {
    if (normalizedDescription && sentence.toLowerCase() === normalizedDescription) {
      continue;
    }
    return trimToLength(sentence, 160);
  }
  return "";
}

function extractReadmeTextFromHtml(html) {
  const overviewFilesRaw = extractJsonArrayAfterKey(html, "overviewFiles");
  if (!overviewFilesRaw) {
    return {
      readmeText: "",
      readmeName: "",
      readmeHighlight: "",
      readmeSource: "missing-overview-files",
    };
  }

  let overviewFiles;
  try {
    overviewFiles = JSON.parse(overviewFilesRaw);
  } catch {
    return {
      readmeText: "",
      readmeName: "",
      readmeHighlight: "",
      readmeSource: "invalid-overview-files-json",
    };
  }

  const readmeFile = overviewFiles.find(
    (file) =>
      file?.preferredFileType === "readme" ||
      (typeof file?.displayName === "string" && /^readme/i.test(file.displayName)),
  );

  if (!readmeFile?.richText) {
    return {
      readmeText: "",
      readmeName: readmeFile?.displayName ?? "",
      readmeHighlight: "",
      readmeSource: "missing-richtext",
    };
  }

  const readmeText = trimToLength(stripHtml(readmeFile.richText), 12000);
  return {
    readmeText,
    readmeName: readmeFile.displayName ?? "",
    readmeHighlight: pickReadmeHighlight(readmeText, ""),
    readmeSource: "overview-files",
  };
}

function containsKeyword(text, keyword) {
  const regex = keywordToRegex(keyword);
  return regex ? regex.test(text) : false;
}

function keywordScore(text, keywords) {
  const lowered = text.toLowerCase();
  let score = 0;
  const matched = [];
  for (const keyword of keywords) {
    if (containsKeyword(lowered, keyword)) {
      matched.push(keyword);
      score += keyword.includes(" ") || keyword.length > 10 ? 2 : 1;
    }
  }
  return { score, matched };
}

function buildRepositorySignalText(repo) {
  return [
    repo.fullName,
    repo.description,
    repo.readmeHighlight,
    ...extractUsefulSentences(repo.readmeText, 3),
    repo.trendingSnippet,
    repo.language,
    ...(repo.contributors || []).map((contributor) => contributor.login).filter(Boolean),
  ]
    .filter(Boolean)
    .join("\n")
    .toLowerCase();
}

function techTagMinScore(rule) {
  return [
    "agent",
    "mcp",
    "rust",
    "video",
    "audio",
    "security",
    "frontend",
    "privacy",
    "research",
    "evaluation",
  ].includes(rule.id)
    ? 1
    : 2;
}

function classifyRepository(repo) {
  const sourceText = buildRepositorySignalText(repo);

  const focusMatches = FOCUS_RULES.map((rule) => {
    const result = keywordScore(sourceText, rule.keywords);
    return { ...rule, ...result };
  })
    .filter((rule) => rule.score >= 2)
    .sort(
      (left, right) =>
        (FOCUS_ORDER[left.label] ?? 99) - (FOCUS_ORDER[right.label] ?? 99) || right.score - left.score,
    );

  const themeMatches = THEME_RULES.map((rule) => {
    const result = keywordScore(sourceText, rule.keywords);
    return { ...rule, ...result };
  })
    .filter((rule) => rule.score >= 2)
    .sort((left, right) => right.score - left.score);

  const techTagMatches = TECH_TAG_RULES.map((rule) => {
    const result = keywordScore(sourceText, rule.keywords);
    return { ...rule, ...result };
  })
    .filter((rule) => rule.score >= techTagMinScore(rule))
    .sort((left, right) => right.score - left.score || left.label.localeCompare(right.label));

  return {
    ...repo,
    isFocus: focusMatches.length > 0,
    focusLabels: focusMatches.map((match) => match.label),
    focusReasonKeywords: [...new Set(focusMatches.flatMap((match) => match.matched))].slice(0, 8),
    themes: themeMatches.map((match) => match.label),
    themeNarratives: themeMatches.map((match) => match.narrative),
    techTags: [...new Set(techTagMatches.map((match) => match.label))],
    techTagKeywords: [...new Set(techTagMatches.flatMap((match) => match.matched))].slice(0, 12),
    signalText: sourceText,
  };
}

function topicLabel(repo) {
  return repo.focusLabels?.[0] || repo.themes?.[0] || "热门开源项目";
}

function extractProjectClue(repo) {
  const candidates = [
    repo.description,
    repo.readmeHighlight,
    ...extractUsefulSentences(repo.readmeText, 2),
  ].filter(Boolean);

  for (const candidate of candidates) {
    const normalized = normalizeWhitespace(candidate).replace(/^[-*]\s*/, "");
    if (normalized) {
      return trimToLength(normalized, 72);
    }
  }

  return `${repo.fullName} 在 GitHub Trending 中获得了明显社区关注`;
}

function inferIntentProfile(repo) {
  const source = [
    repo.fullName,
    repo.description,
    repo.readmeHighlight,
    ...(repo.focusLabels || []),
    ...(repo.themes || []),
  ]
    .filter(Boolean)
    .join("\n")
    .toLowerCase();

  for (const rule of INTENT_RULES) {
    if (rule.keywords.some((keyword) => containsKeyword(source, keyword))) {
      return rule;
    }
  }

  if (repo.isFocus) {
    return {
      what: `${topicLabel(repo)}相关能力`,
      why: `更快把${topicLabel(repo)}接入真实工作流`,
      problem: `${topicLabel(repo)}从概念走向落地时的工程化与执行问题`,
    };
  }

  return {
    what: `${topicLabel(repo)}能力`,
    why: "理解这一轮社区热度焦点",
    problem: "具体场景里的效率、协作或工程落地问题",
  };
}

function sentenceFromCandidates(candidates, fallback, maxLength = 96) {
  for (const candidate of candidates) {
    const normalized = trimToLength(normalizeWhitespace(candidate), maxLength);
    if (normalized) {
      return normalized.replace(/[。！？.!?]+$/u, "");
    }
  }

  return trimToLength(normalizeWhitespace(fallback), maxLength).replace(/[。！？.!?]+$/u, "");
}

function findMicroRuleForTrend(trend) {
  if (!trend) {
    return null;
  }

  return (
    MICRO_ANALYSIS_RULES.find((rule) => rule.labels.includes(trend.name)) ||
    MICRO_ANALYSIS_RULES.find((rule) =>
      (trend.routeLabels || []).some((label) => rule.labels.includes(label)),
    ) ||
    null
  );
}

function inferRepositorySignals(repo, microRule) {
  if (!microRule) {
    return [];
  }

  const source = buildRepositorySignalText(repo);
  return microRule.prioritySignals.filter((signal) =>
    (PRIORITY_SIGNAL_HINTS[signal] || []).some((keyword) => containsKeyword(source, keyword)),
  );
}

function buildTechnicalHighlight(repo, microRule) {
  const prioritySignals = inferRepositorySignals(repo, microRule);
  const topTags = (repo.techTags || []).slice(0, 3);
  const topThemes = (repo.themes || []).slice(0, 2);
  const clue = extractProjectClue(repo);

  if (prioritySignals.length > 0) {
    return `它的技术亮点集中在${prioritySignals.join("、")}，说明项目并不是单点包装，而是在补齐“${clue}”背后的关键能力链路`;
  }

  if (topTags.length > 0) {
    return `它把${topTags.join("、")}这些能力组织成更容易落地的方案，核心线索是“${clue}”`;
  }

  if (topThemes.length > 0) {
    return `它围绕${topThemes.join("、")}提供了更系统的实现路径，核心线索是“${clue}”`;
  }

  return `它的技术亮点在于把“${clue}”这类能力做成更容易传播和复用的项目形态`;
}

function buildWhyHot(repo, intent, microRule) {
  const growthSignal = `${repo.deltaLabel}${formatCount(repo.deltaStars)} Star`;
  const signalText = buildRepositorySignalText(repo);
  const focusLead = repo.isFocus ? "它同时命中重点关注方向，" : "";

  if (microRule) {
    const matched = inferRepositorySignals(repo, microRule);
    if (matched.length > 0) {
      return `${focusLead}它抓住了${matched.join("、")}这些高需求能力，并以${growthSignal}证明社区正在为这类落地能力持续投票`;
    }
  }

  if ((repo.techTags || []).length > 0) {
    return `${focusLead}它把${repo.techTags.slice(0, 2).join("、")}做成了更清晰的落地方案，并以${growthSignal}体现出社区关注度`;
  }

  if (containsKeyword(signalText, "open source") || containsKeyword(signalText, "self-hosted")) {
    return `${focusLead}它在开放性与可部署性上更贴近真实团队需求，因此在本期拿到${growthSignal}`;
  }

  return `${focusLead}它切中了“${intent.why}”这类现实需求，并在本期以${growthSignal}体现出社区关注度`;
}

function buildTrendValidation(repo, macroTrend, microRule) {
  if (!macroTrend || !microRule) {
    return "";
  }

  const signals = inferRepositorySignals(repo, microRule);
  if (signals.length === 0) {
    return "";
  }

  return `它直接印证了“${macroTrend.name}”这一趋势，因为项目把${signals.join("、")}这些能力做成了可用的工程组件。`;
}

function buildMacroTrendAlignment(repo, macroTrends) {
  const matches = (macroTrends || [])
    .map((trend) => {
      const match = trendMatchForRepository(repo, trend.rule || TREND_RULE_MAP.get(trend.id) || trend);
      return {
        trend,
        signalScore: match.signalScore,
      };
    })
    .filter((entry) => entry.signalScore > 0)
    .sort((left, right) => right.signalScore - left.signalScore || right.trend.totalDeltaStars - left.trend.totalDeltaStars);

  return matches[0]?.trend || null;
}

function buildRepositoryAnalysis(repo, macroTrend) {
  const intent = inferIntentProfile(repo);
  const microRule = findMicroRuleForTrend(macroTrend);
  const macroValidation = buildTrendValidation(repo, macroTrend, microRule);
  const projectIntro = sentenceFromCandidates(
    [
      `${repo.fullName} 是一个聚焦${intent.what}的开源项目`,
      repo.description,
      repo.readmeHighlight,
    ],
    `${repo.fullName} 是一个值得关注的趋势项目`,
  );
  const problemScenario = sentenceFromCandidates(
    [
      `它主要解决${intent.problem}`,
      repo.readmeHighlight ? `它把“${repo.readmeHighlight}”对应的使用场景做成了更易落地的产品能力` : "",
      (repo.themes || [])[0] ? `它主要解决${repo.themes[0]}落地时链路割裂和执行成本偏高的问题` : "",
    ],
    "它主要解决团队在新工具落地、能力协同和工程执行上的摩擦成本问题",
    120,
  );
  const technicalHighlight = sentenceFromCandidates(
    [buildTechnicalHighlight(repo, microRule)],
    "它把分散能力重新组织成更容易部署、复用和传播的工程化方案",
    140,
  );
  const whyHot = sentenceFromCandidates(
    [buildWhyHot(repo, intent, microRule)],
    `它在本期以${repo.deltaLabel}${formatCount(repo.deltaStars)} Star 体现出明确社区关注度`,
    140,
  );
  const insightBase = macroTrend
    ? `本期的时代背景是“${macroTrend.name}”。`
    : "本期榜单更关注可快速落地的工程化能力。";
  const insightText = sentenceFromCandidates(
    [
      `${insightBase}${macroValidation || "它更像是一个独立的高增长信号，说明社区对该类需求仍在持续升温。"}`,
      macroValidation,
    ],
    `${insightBase}它反映出社区正在为更真实、更可执行的工具链能力买单。`,
    180,
  );

  return {
    projectIntro,
    problemScenario,
    technicalHighlight,
    whyHot,
    insightText,
    macroTrendName: macroTrend?.name || "",
    microRuleId: microRule?.id || "",
    validatesTrend: Boolean(macroValidation),
  };
}

function buildSummary(repo) {
  const intent = inferIntentProfile(repo);
  const clue = extractProjectClue(repo);
  const focusNote = repo.isFocus ? "它同时命中重点关注方向，值得持续跟踪。" : "";
  return trimToLength(
    `是什么：${repo.fullName} 是一个${topicLabel(repo)}方向项目，核心线索是“${clue}”。` +
      `解决什么问题：它主要面向${intent.problem}。` +
      `为什么值得被记住：如果你想${intent.why}，它在本期以${repo.deltaLabel}${formatCount(
        repo.deltaStars,
      )} Star 体现出社区关注度。${focusNote}`,
    260,
  );
}

function summarizeRepository(repo) {
  const readmeHighlight = repo.readmeHighlight || pickReadmeHighlight(repo.readmeText, repo.description);
  return {
    ...repo,
    readmeHighlight,
    analysis: null,
    summary: buildSummary({ ...repo, readmeHighlight }),
  };
}

function topEntries(counts, limit = 3) {
  return Object.entries(counts)
    .filter(([, value]) => value > 0)
    .sort((left, right) => right[1] - left[1])
    .slice(0, limit);
}

function topLabels(entries, limit = 5) {
  return entries
    .slice(0, limit)
    .map(([label]) => label)
    .filter(Boolean);
}

function formatTrendRepresentative(repo) {
  return `${repo.fullName}（${repo.deltaLabel}${formatCount(repo.deltaStars)}）`;
}

function trendMatchForRepository(repo, rule) {
  const sourceText = repo.signalText || buildRepositorySignalText(repo);
  const keywordHits = rule.keywords.filter((keyword) => containsKeyword(sourceText, keyword));
  const tagHits = (repo.techTags || []).filter((label) => rule.tagLabels.includes(label));
  const themeHits = (repo.themes || []).filter((label) => rule.themeLabels.includes(label));
  const focusHits = (repo.focusLabels || []).filter((label) => rule.focusLabels.includes(label));
  const signalScore = keywordHits.length * 2 + tagHits.length * 2 + themeHits.length * 2 + focusHits.length * 2;

  return {
    repo,
    keywordHits,
    tagHits,
    themeHits,
    focusHits,
    signalScore,
  };
}

function aggregateTrendKeywords(matches) {
  const keywordCounts = {};

  for (const match of matches) {
    for (const label of match.tagHits) {
      keywordCounts[label] = (keywordCounts[label] ?? 0) + 2;
    }
    for (const label of match.repo.techTags || []) {
      keywordCounts[label] = (keywordCounts[label] ?? 0) + 1;
    }
    for (const label of match.repo.themes || []) {
      keywordCounts[label] = (keywordCounts[label] ?? 0) + 1;
    }
    if (match.repo.language) {
      keywordCounts[match.repo.language] = (keywordCounts[match.repo.language] ?? 0) + 1;
    }
  }

  return topLabels(topEntries(keywordCounts, 6), 5);
}

function buildTrendCandidate(rule, repos) {
  const matches = repos
    .map((repo) => trendMatchForRepository(repo, rule))
    .filter((match) => match.signalScore > 0)
    .sort((left, right) => right.repo.deltaStars - left.repo.deltaStars || right.signalScore - left.signalScore);

  if (matches.length === 0) {
    return null;
  }

  const totalDeltaAll = repos.reduce((sum, repo) => sum + repo.deltaStars, 0);
  const totalDeltaStars = matches.reduce((sum, match) => sum + match.repo.deltaStars, 0);
  const densityScore = matches.reduce((sum, match) => sum + match.signalScore, 0);
  const averageSignalScore = densityScore / Math.max(1, matches.length);
  const coverageShare = matches.length / Math.max(1, repos.length);
  const deltaShare = totalDeltaStars / Math.max(1, totalDeltaAll);
  const normalizedDensity = Math.min(averageSignalScore / 8, 1);
  const score = coverageShare * 45 + deltaShare * 35 + normalizedDensity * 20;

  return {
    id: rule.id,
    name: rule.name,
    score,
    rule,
    keywords: aggregateTrendKeywords(matches),
    representativeRepos: matches.slice(0, 3).map((match) => match.repo),
    repoCount: matches.length,
    totalDeltaStars,
    overview: rule.overview,
    what: rule.what,
    why: rule.why,
    how: rule.how,
    risk: rule.risk,
    routeLabels: rule.routeLabels || [],
    matchedRepoNames: matches.map((match) => match.repo.fullName),
  };
}

function overlapRatio(left, right) {
  const leftSet = new Set(left.matchedRepoNames);
  const rightSet = new Set(right.matchedRepoNames);
  let intersection = 0;

  for (const value of leftSet) {
    if (rightSet.has(value)) {
      intersection += 1;
    }
  }

  return intersection / Math.max(1, Math.min(leftSet.size, rightSet.size));
}

function buildFallbackTrend(repos) {
  const keywordCounts = {};
  const topRepos = [...repos].sort((left, right) => right.deltaStars - left.deltaStars).slice(0, 3);

  for (const repo of repos) {
    for (const label of repo.techTags || []) {
      keywordCounts[label] = (keywordCounts[label] ?? 0) + 1;
    }
    for (const label of repo.themes || []) {
      keywordCounts[label] = (keywordCounts[label] ?? 0) + 1;
    }
    if (repo.language) {
      keywordCounts[repo.language] = (keywordCounts[repo.language] ?? 0) + 1;
    }
  }

  return {
    id: "fallback-engineering-signal",
    name: "社区热度集中在可快速落地的工程化项目",
    score: 0,
    rule: null,
    keywords: topLabels(topEntries(keywordCounts, 6), 5),
    representativeRepos: topRepos,
    repoCount: repos.length,
    totalDeltaStars: repos.reduce((sum, repo) => sum + repo.deltaStars, 0),
    overview: "榜单热度并未集中在单一赛道，而是集中在那些能把能力快速转化为真实交付结果的工程化项目。",
    what: "高增长项目共同指向“可部署、可协作、可复用”的工程化演进方向。",
    why: "这说明社区比起概念展示，更关心能否把新能力接入真实业务、团队流程与交付链路。",
    how: "支撑这一方向的底层方法通常是标准接口、模块化组件、自动化流程和更低门槛的部署方式。",
    risk: "风险在于，工程化叙事容易掩盖真实能力边界，若缺少效果验证和长期维护，热度可能快于沉淀速度。",
    routeLabels: [],
    matchedRepoNames: repos.map((repo) => repo.fullName),
  };
}

function buildTrendAnalysisItems(repos, period) {
  const config = PERIOD_CONFIG[period];
  const candidates = TREND_RULES.map((rule) => buildTrendCandidate(rule, repos))
    .filter(Boolean)
    .sort((left, right) => right.score - left.score || right.totalDeltaStars - left.totalDeltaStars);

  const selected = [];
  for (const candidate of candidates) {
    if (selected.length >= 2) {
      break;
    }
    if (selected.some((existing) => overlapRatio(existing, candidate) >= 0.8)) {
      continue;
    }
    selected.push(candidate);
  }

  if (selected.length === 0 && repos.length > 0) {
    selected.push(buildFallbackTrend(repos));
  }

  const items = selected.map((trend) => ({
    ...trend,
    keywordLine: trend.keywords.join("、"),
    representativeLine: trend.representativeRepos.map((repo) => formatTrendRepresentative(repo)).join("、"),
    shortValueLine: trend.overview,
    valueLine: `${trend.overview} 本期该趋势覆盖 ${trend.repoCount} 个项目，合计 ${config.deltaLabel}${formatCount(
      trend.totalDeltaStars,
    )}。`,
  }));

  const lead = items[0];
  const overview = lead
    ? `${lead.overview} 这说明当前 GitHub Trending 的焦点，正在向“${lead.name}”这类更成体系的技术方向收敛。`
    : "当前 GitHub Trending 的焦点，集中在能快速落地、可复用、可工程化的技术方向。";
  const risk = items
    .map((trend) => trend.risk)
    .filter(Boolean)
    .slice(0, 2)
    .join(" ");

  return {
    overview,
    risk,
    items,
  };
}

function buildTrendAnalysisLines(repos, period) {
  return buildTrendAnalysisItems(repos, period).items.map(
    (trend, index) =>
      `趋势 ${index + 1}：${trend.name}。宏观 What：${trend.what}。宏观 Why：${trend.why}。宏观 How：${trend.how}。代表项目：${trend.representativeLine}。`,
  );
}

function buildTrendAnalysis(repos, period) {
  const analysis = buildTrendAnalysisItems(repos, period);

  return [
    "🔥 核心技术趋势洞察",
    analysis.overview,
    "",
    "📊 趋势拆解分析",
    analysis.items
      .map(
      (trend, index) =>
        [
          `${index + 1}. 🎯 宏观 What (演进方向)：${trend.name}`,
          `- 核心关键词：${trend.keywordLine}`,
          `- 💡 宏观 Why (核心驱动力)：${trend.why}`,
          `- ⚙️ 宏观 How (底层支撑)：${trend.how}`,
          `- 🏆 代表项目：${trend.representativeLine}`,
        ].join("\n"),
      )
      .join("\n\n"),
    "",
    "⚠️ 潜在风险与冷思考",
    analysis.risk || "当前趋势仍需警惕概念包装、工程化承诺过度和真实落地效果不足的问题。",
  ].join("\n");
}

function focusBadge(repo) {
  if (!repo.isFocus) {
    return "";
  }
  return ` 【重点关注：${repo.focusLabels.join("、")}】`;
}

function formatProjectTitle(repo) {
  return `${repo.rank}. [${repo.fullName}](${repo.projectLink})${focusBadge(repo)}`;
}

function renderRepositoryEntry(repo) {
  const analysis = repo.analysis || {};
  return [
    `### ${formatProjectTitle(repo)}`,
    `- 项目链接：${repo.projectLink}`,
    `- Star：${formatCount(repo.stars)}`,
    `- ${repo.deltaLabel}：${formatCount(repo.deltaStars)}`,
    `- 项目简介：${repo.summary}`,
    `- 解决场景：${analysis.problemScenario || "待补充"}`,
    `- 技术亮点：${analysis.technicalHighlight || "待补充"}`,
    `- 为什么会火：${analysis.whyHot || "待补充"}`,
    `- AI Insight：${analysis.insightText || "待补充"}`,
  ].join("\n");
}

function renderMarkdownReport({ period, date, repos }) {
  const config = PERIOD_CONFIG[period];
  return [
    `# ${config.titleLabel} | ${date}`,
    "",
    `> 数据来源：[GitHub Trending ${period}](https://github.com/trending?since=${period})`,
    "",
    "## 整体趋势分析",
    buildTrendAnalysis(repos, period),
    "",
    "## 项目清单",
    repos.map((repo) => renderRepositoryEntry(repo)).join("\n\n"),
    "",
  ].join("\n");
}

async function mapWithConcurrency(items, concurrency, handler) {
  const results = new Array(items.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      results[currentIndex] = await handler(items[currentIndex], currentIndex);
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

async function enrichRepository(repo) {
  try {
    const html = await fetchText(repo.projectLink);
    return {
      ...repo,
      ...extractReadmeTextFromHtml(html),
      fetchWarning: "",
    };
  } catch (error) {
    return {
      ...repo,
      readmeText: "",
      readmeName: "",
      readmeHighlight: "",
      readmeSource: "fetch-failed",
      fetchWarning: error.message,
    };
  }
}

function resolvePeriods(period) {
  if (period === "all") {
    return PERIOD_ORDER;
  }
  return [period];
}

async function writeDashboard({ outputDir, date, repos }) {
  const dashboardDir = path.join(outputDir, "dashboard");
  const assetSourceDir = path.join(SKILL_DIR, "assets", "dashboard");
  const assetOutputDir = path.join(dashboardDir, "assets");
  const stylesheet = await readFile(path.join(SKILL_DIR, "assets", "dashboard", "styles.css"), "utf8");
  const html = renderDashboardHtml(repos, date);

  await mkdir(assetOutputDir, { recursive: true });
  await writeUtf8File(path.join(dashboardDir, "index.html"), html);
  await writeUtf8File(path.join(dashboardDir, "styles.css"), stylesheet);

  for (const asset of await readdir(assetSourceDir)) {
    await copyFile(path.join(assetSourceDir, asset), path.join(assetOutputDir, asset));
  }

  return path.join(dashboardDir, "index.html");
}

async function runAnalysis(options) {
  const periods = resolvePeriods(options.period);
  const outputDir = path.resolve(options.outputDir);
  const cacheDir = path.join(outputDir, "cache", options.date);

  await mkdir(cacheDir, { recursive: true });

  const trendingByPeriod = {};
  for (const period of periods) {
    const html = await fetchText(`https://github.com/trending?since=${period}`);
    const parsed = parseTrendingHtml(html, period);
    trendingByPeriod[period] = parsed;
    await writeUtf8File(
      path.join(cacheDir, `trending-${period}.json`),
      `${JSON.stringify(parsed, null, 2)}\n`,
    );
  }

  const uniqueRepos = [];
  const seen = new Set();
  for (const period of periods) {
    for (const repo of trendingByPeriod[period]) {
      if (!seen.has(repo.fullName)) {
        seen.add(repo.fullName);
        uniqueRepos.push(repo);
      }
    }
  }

  const enrichedRepos = await mapWithConcurrency(uniqueRepos, 4, enrichRepository);
  const classifiedRepos = enrichedRepos.map((repo) => classifyRepository(repo));
  const enrichedMap = new Map(classifiedRepos.map((repo) => [repo.fullName, repo]));
  const reports = [];
  const dashboardRepos = [];

  for (const period of periods) {
    const periodRepos = trendingByPeriod[period]
      .map((repo) => summarizeRepository({ ...enrichedMap.get(repo.fullName), ...repo }))
      .sort((left, right) => left.rank - right.rank);
    const trendAnalysis = buildTrendAnalysisItems(periodRepos, period);
    const repos = periodRepos.map((repo) => ({
      ...repo,
      analysis: buildRepositoryAnalysis(repo, buildMacroTrendAlignment(repo, trendAnalysis.items)),
      trendAnalysis: {
        overview: trendAnalysis.overview,
        risk: trendAnalysis.risk,
        items: trendAnalysis.items,
      },
    }));

    const markdown = renderMarkdownReport({ period, date: options.date, repos });
    const markdownPath = path.join(outputDir, `${options.date}-${period}.md`);

    await writeUtf8File(markdownPath, markdown, true);

    dashboardRepos.push(...repos);
    reports.push({
      period,
      markdownPath,
      repoCount: repos.length,
      focusCount: repos.filter((repo) => repo.isFocus).length,
      warnings: repos.filter((repo) => repo.fetchWarning).map((repo) => ({
        repo: repo.fullName,
        warning: repo.fetchWarning,
      })),
    });
  }

  await writeUtf8File(
    path.join(cacheDir, "enriched-repositories.json"),
    `${JSON.stringify(dashboardRepos, null, 2)}\n`,
  );

  const dashboardPath = await writeDashboard({ outputDir, date: options.date, repos: dashboardRepos });

  return {
    reports,
    cacheDir,
    dashboardPath,
    uniqueRepoCount: uniqueRepos.length,
  };
}

export {
  buildTrendAnalysis,
  buildTrendAnalysisLines,
  classifyRepository,
  extractReadmeTextFromHtml,
  parseArgs,
  parseTrendingHtml,
  renderMarkdownReport,
  runAnalysis,
  summarizeRepository,
  usage,
};
