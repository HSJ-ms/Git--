import test from "node:test";
import assert from "node:assert/strict";

import {
  buildTrendAnalysis,
  classifyRepository,
  parseArgs,
  parseTrendingHtml,
  renderMarkdownReport,
  summarizeRepository,
} from "./analysis-core.mjs";

function makeRepo(overrides = {}) {
  return summarizeRepository(
    classifyRepository({
      fullName: "openai/codex",
      description: "Coding agent for software engineering workflows.",
      readmeText: "Codex CLI is a coding agent from OpenAI that runs locally on your computer.",
      readmeHighlight: "Codex CLI is a coding agent from OpenAI that runs locally on your computer.",
      trendingSnippet: "coding agent openai cli software engineering",
      deltaLabel: "今日新增",
      deltaStars: 1000,
      stars: 10000,
      projectLink: "https://github.com/openai/codex",
      language: "Rust",
      rank: 1,
      period: "daily",
      owner: "openai",
      name: "codex",
      ...overrides,
    }),
  );
}

test("parseArgs accepts daily and all periods", () => {
  assert.equal(parseArgs(["--period", "daily"]).period, "daily");
  assert.equal(parseArgs(["--period", "all"]).period, "all");
});

test("parseArgs rejects unsupported period values", () => {
  assert.throws(
    () => parseArgs(["--period", "yearly"]),
    /--period must be one of: daily, weekly, monthly, all/,
  );
});

test("parseTrendingHtml parses daily stars today growth label", () => {
  const html = `
    <article class="Box-row">
      <h2><a href="/acme/daily-agent">acme / daily-agent</a></h2>
      <p class="col-9 color-fg-muted my-1 pr-4">Agent workflow toolkit.</p>
      <span itemprop="programmingLanguage">TypeScript</span>
      <a href="/acme/daily-agent/stargazers">12,345</a>
      <a href="/acme/daily-agent/forks">678</a>
      <span>Built by
        <a href="/alice"><img class="avatar mb-1 avatar-user" alt="@alice" /></a>
        <a href="/bob"><img class="avatar mb-1 avatar-user" alt="@bob" /></a>
      </span>
      <span>1,234 stars today</span>
    </article>
  `;

  const [repo] = parseTrendingHtml(html, "daily");

  assert.equal(repo.fullName, "acme/daily-agent");
  assert.equal(repo.stars, 12345);
  assert.equal(repo.forks, 678);
  assert.equal(repo.deltaStars, 1234);
  assert.equal(repo.deltaLabel, "今日新增");
  assert.deepEqual(
    repo.contributors.map((contributor) => contributor.login),
    ["alice", "bob"],
  );
});

test("trend analysis summarizes repositories into one to two core trends", () => {
  const markdown = buildTrendAnalysis(
    [
      makeRepo({
        fullName: "openai/codex",
        description: "Coding agent for software engineering workflows.",
        readmeText: "Codex CLI is a coding agent with MCP and workflow support.",
        trendingSnippet: "coding agent mcp developer workflow",
        deltaStars: 2200,
        language: "Rust",
      }),
      makeRepo({
        fullName: "acme/agent-memory",
        description: "Persistent memory for multi-agent orchestration.",
        readmeText: "Agent memory and workflow orchestration for long-running tasks.",
        trendingSnippet: "agent memory workflow orchestrator",
        deltaStars: 1800,
        language: "TypeScript",
      }),
      makeRepo({
        fullName: "acme/model-router",
        description: "OpenAI-compatible model router for inference providers.",
        readmeText: "Model router and inference gateway for multi-provider AI stacks.",
        trendingSnippet: "openai-compatible inference provider model router",
        deltaStars: 900,
        language: "Go",
      }),
    ],
    "daily",
  );

  assert.match(markdown, /🔥 核心技术趋势洞察/);
  assert.match(markdown, /📊 趋势拆解分析/);
  assert.match(markdown, /1\. 🎯 宏观 What \(演进方向\)：/);
  assert.match(markdown, /- 核心关键词：/);
  assert.match(markdown, /- 💡 宏观 Why \(核心驱动力\)：/);
  assert.match(markdown, /- ⚙️ 宏观 How \(底层支撑\)：/);
  assert.match(markdown, /- 🏆 代表项目：/);
  assert.match(markdown, /⚠️ 潜在风险与冷思考/);
});

test("daily markdown report includes required publishable project fields", () => {
  const markdown = renderMarkdownReport({
    period: "daily",
    date: "2026-07-03",
    repos: [makeRepo()],
  });

  assert.match(markdown, /^# GitHub Trending 日报 \| 2026-07-03/m);
  assert.match(markdown, /https:\/\/github\.com\/trending\?since=daily/);
  assert.match(markdown, /## 整体趋势分析/);
  assert.match(markdown, /🔥 核心技术趋势洞察/);
  assert.match(markdown, /### 1\. \[openai\/codex\]/);
  assert.match(markdown, /- Star：10,000/);
  assert.match(markdown, /- 今日新增：1,000/);
  assert.match(markdown, /- 项目简介：/);
  assert.match(markdown, /- 解决场景：/);
  assert.match(markdown, /- 技术亮点：/);
  assert.match(markdown, /- 为什么会火：/);
  assert.match(markdown, /- AI Insight：/);
  assert.match(markdown, /【重点关注/);
});
