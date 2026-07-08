import { buildDashboardModel, formatCompactNumber } from "./dashboard-data.mjs";

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderBulletList(items) {
  return items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
}

function renderMetaItems(items) {
  return items
    .map(
      (item) => `
              <div class="meta-pill">
                <span class="meta-label">${escapeHtml(item.label)}</span>
                <strong class="meta-value">${escapeHtml(item.value)}</strong>
              </div>
      `,
    )
    .join("");
}

function renderTrendHighlights(items) {
  if (!items || items.length === 0) {
    return "";
  }

  return `
      <section class="trend-analysis panel">
        <div class="section-head">
          <h3>整体趋势分析</h3>
          <span>从项目共性归纳当前技术趋势</span>
        </div>
        <div class="trend-list">
          ${items
            .map(
              (item, index) => `
                <article class="trend-card">
                  <span class="trend-index">趋势 ${index + 1}</span>
                  <h4>${escapeHtml(item.title)}</h4>
                  <p><strong>核心关键词：</strong>${escapeHtml(item.keywordLine)}</p>
                  <p><strong>宏观 What：</strong>${escapeHtml(item.whatLine || item.title)}</p>
                  <p><strong>宏观 Why：</strong>${escapeHtml(item.whyLine || "")}</p>
                  <p><strong>宏观 How：</strong>${escapeHtml(item.howLine || "")}</p>
                  <p><strong>代表项目：</strong>${escapeHtml(item.representativeLine)}</p>
                  <p><strong>潜在风险：</strong>${escapeHtml(item.riskLine || "")}</p>
                </article>
              `,
            )
            .join("")}
        </div>
      </section>
  `;
}

function renderDeepDive(period) {
  return period.deepDive
    .map(
      (repository) => `
        <article class="deep-card">
          <div class="card-heading">
            <div class="title-wrap">
              <img src="./assets/repo-icon.svg" alt="" aria-hidden="true" class="icon icon-repo">
              <h3><a href="${escapeHtml(repository.projectLink)}" target="_blank" rel="noreferrer">${escapeHtml(repository.fullName)}</a></h3>
            </div>
            <span class="chip">${escapeHtml(repository.categoryChip)}</span>
          </div>
          <div class="insight-panel">
            <div class="insight-title">
              <img src="./assets/spark-icon.svg" alt="" aria-hidden="true" class="icon icon-spark">
              <span>${escapeHtml(repository.insightLabel)}</span>
            </div>
            <p>${escapeHtml(repository.insightText)}</p>
            <div class="meta-row">
              ${renderMetaItems(repository.metaItems)}
            </div>
          </div>
          <div class="core-value-panel">
            <span class="core-value-label">核心价值</span>
            <ul class="bullet-list">
              ${renderBulletList(repository.coreValueLines)}
            </ul>
          </div>
        </article>
      `,
    )
    .join("");
}

function renderPeriodSection(periodKey, period, active = false) {
  return `
    <section class="period-panel${active ? " is-active" : ""}" data-period-panel="${escapeHtml(periodKey)}">
      <div class="hero-card">
        <div class="hero-visual">
          <img src="./assets/hero-background-281466.png" alt="" aria-hidden="true">
        </div>
        <div class="hero-copy">
          <span class="eyebrow">${escapeHtml(period.hero.eyebrow)}</span>
          <h2>${escapeHtml(period.hero.title)}</h2>
          <p>${escapeHtml(period.hero.description)}</p>
        </div>
      </div>

      ${renderTrendHighlights(period.trendHighlights)}

      <section class="deep-dive-section panel">
        <div class="section-head">
          <h3>Deep Dive Analysis</h3>
          <span>${escapeHtml(period.label)}趋势解构</span>
        </div>
        ${period.trendOverview ? `<p class="trend-overview">${escapeHtml(period.trendOverview)}</p>` : ""}
        <div class="deep-list">
          ${renderDeepDive(period)}
        </div>
      </section>
    </section>
  `;
}

function renderDashboardHtml(repositories, generatedAt) {
  const model = buildDashboardModel(repositories, generatedAt);
  if (model.periodOrder.length === 0) {
    throw new Error("Dashboard requires at least one repository with a supported period");
  }

  const defaultPeriod = model.periodOrder[0];
  const periodTabs = model.periodOrder
    .map(
      (periodKey) => `
        <button class="nav-link${periodKey === defaultPeriod ? " is-active" : ""}" type="button" data-period-tab="${escapeHtml(periodKey)}">
          ${escapeHtml(model.periods[periodKey].label)}
        </button>
      `,
    )
    .join("");

  const sections = model.periodOrder
    .map((periodKey) =>
      renderPeriodSection(periodKey, model.periods[periodKey], periodKey === defaultPeriod),
    )
    .join("");

  const initialPeriod = model.periods[defaultPeriod];

  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>GitHub Trending Dashboard</title>
  <link rel="stylesheet" href="./styles.css">
</head>
<body>
  <div class="app-shell">
    <header class="topbar">
      <div class="topbar-inner">
        <nav class="period-nav" aria-label="趋势周期切换">
          ${periodTabs}
        </nav>
        <span class="generated-at">Snapshot · ${escapeHtml(model.generatedAt)}</span>
      </div>
    </header>

    <main class="page">
      <section class="page-heading">
        <div>
          <span class="section-kicker">Trend Insights</span>
          <h1>GitHub Trending Dashboard</h1>
        </div>
        <div class="headline-callout">
          <span class="callout-label">Current Lead</span>
          <strong>${escapeHtml(initialPeriod.fastestMover.fullName)}</strong>
          <span>${escapeHtml(formatCompactNumber(initialPeriod.fastestMover.deltaStars))} stars this ${escapeHtml(
            initialPeriod.meta.starsPeriodLabel,
          )}</span>
        </div>
      </section>

      ${sections}
    </main>
  </div>

  <script>
    const tabs = Array.from(document.querySelectorAll("[data-period-tab]"));
    const panels = Array.from(document.querySelectorAll("[data-period-panel]"));

    function setActivePeriod(period) {
      tabs.forEach((tab) => {
        tab.classList.toggle("is-active", tab.dataset.periodTab === period);
      });

      panels.forEach((panel) => {
        panel.classList.toggle("is-active", panel.dataset.periodPanel === period);
      });
    }

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => setActivePeriod(tab.dataset.periodTab));
    });
  </script>
</body>
</html>`;
}

export { renderDashboardHtml };
