import * as Plot from "npm:@observablehq/plot";

function createTooltip() {
  const tooltip = document.createElement("div");
  Object.assign(tooltip.style, {
    position: "fixed",
    pointerEvents: "none",
    display: "none",
    background: "rgba(15, 23, 42, 0.92)",
    color: "#f1f5f9",
    borderRadius: "10px",
    padding: "14px 18px",
    fontSize: "14px",
    lineHeight: "1.7",
    boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
    border: "1px solid rgba(255,255,255,0.1)",
    backdropFilter: "blur(6px)",
    maxWidth: "280px",
    zIndex: 9999,
    fontFamily: "system-ui, sans-serif",
    transition: "opacity 0.15s ease",
  });
  document.body.appendChild(tooltip);
  return tooltip;
}

function positionTooltip(tooltip, event) {
  const tw = 280, th = 120;
  const vw = window.innerWidth, vh = window.innerHeight;
  tooltip.style.left = Math.min(event.clientX + 16, vw - tw - 8) + "px";
  tooltip.style.top  = Math.min(event.clientY + 16, vh - th - 8) + "px";
}

function attachHitDetection(plot, data, categoryKey, tooltip, onHit) {
  plot.addEventListener("pointermove", (event) => {
    const rect   = plot.getBoundingClientRect();
    const px     = event.clientX - rect.left;
    const py     = event.clientY - rect.top;

    const xScale = plot.scale("x");
    const yScale = plot.scale("y");

    const yRange    = yScale.range;
    const yMin      = Math.min(...yRange);
    const bandwidth = Math.abs(yRange[1] - yRange[0]) / yScale.domain.length;
    const yIdx      = Math.floor((py - yMin) / bandwidth) - 1;

    if (yIdx < 0 || yIdx >= yScale.domain.length) {
      tooltip.style.display = "none";
      return;
    }

    const category = yScale.domain[yIdx];
    const row      = data.find(d => d[categoryKey] === category);

    if (!row) { tooltip.style.display = "none"; return; }

    onHit(row, category, px, xScale, tooltip, event);
  });

  plot.addEventListener("pointerleave", () => {
    tooltip.style.display = "none";
  });
}

// ─── 1. DivergingSentimentPlot ────────────────────────────────────────────────

export function DivergingSentimentPlot(data, width, categoryKey = "AgeGroup") {
  const divergingData = data.flatMap(d => {
    const favorableSum   = Number(d["Very favorable"]) + Number(d["Favorable"]);
    const unfavorableSum = Number(d["Very unfavorable"]) + Number(d["Unfavorable"]);
    return [
      { [categoryKey]: d[categoryKey], sentiment: "Favorable",   value:  favorableSum },
      { [categoryKey]: d[categoryKey], sentiment: "Unfavorable", value: -unfavorableSum },
    ];
  });

  const plot = Plot.plot({
    width: width || 800,
    height: 400,
    marginLeft: 130,
    style: { display: "block", maxHeight: "400px" },
    x: { label: "Percentage (%)", domain: [-50, 100], tickFormat: Math.abs, grid: true },
    y: { label: null, domain: data.map(d => d[categoryKey]) },
    color: { domain: ["Favorable", "Unfavorable"], range: ["#28a05c", "#e63c33"], legend: true },
    marks: [
      Plot.ruleX([0], { strokeWidth: 2 }),
      Plot.barX(divergingData, {
        x: "value", y: categoryKey, fill: "sentiment",
        insetTop: 2, insetBottom: 2,
      }),
    ],
  });

  const tooltip = createTooltip();

  attachHitDetection(plot, data, categoryKey, tooltip, (row, category, _px, _xScale, tt, event) => {
    const fav   = Number(row["Very favorable"]) + Number(row["Favorable"]);
    const unfav = Number(row["Very unfavorable"]) + Number(row["Unfavorable"]);
    const net   = fav - unfav;
    const sign  = net >= 0 ? "+" : "−";
    const color = net >= 0 ? "#28a05c" : "#e63c33";

    tt.innerHTML = `
      <div style="font-size:13px;color:#94a3b8;margin-bottom:6px;letter-spacing:.04em;text-transform:uppercase">Sentiment</div>
      <div style="font-size:16px;font-weight:700;margin-bottom:8px;color:#fff">${category}</div>
      <div style="border-top:1px solid rgba(255,255,255,.1);padding-top:8px">
        <span style="color:#28a05c">■</span> Favorable: <strong>${fav.toFixed(1)}%</strong><br>
        <span style="color:#e63c33">■</span> Unfavorable: <strong>${unfav.toFixed(1)}%</strong><br>
        Net: <strong style="color:${color}">${sign}${Math.abs(net).toFixed(1)}%</strong>
      </div>`;
    tt.style.display = "block";
    positionTooltip(tt, event);
  });

  return plot;
}

// ─── 2. DivergingStackedSentimentPlot ────────────────────────────────────────

export function DivergingStackedSentimentPlot(data, width, categoryKey = "AgeGroup") {
  const sentimentOrder = ["Unfavorable", "Very unfavorable", "Favorable", "Very favorable"];
  const colorRange = ["#fc8d59", "#d73027", "#91cf60", "#1a9850"];
  const colorMap = Object.fromEntries(sentimentOrder.map((s, i) => [s, colorRange[i]]));

  const divergingData = data.flatMap(d => {
    const favTotal   = Number(d["Very favorable"]) + Number(d["Favorable"]);
    const unfavTotal = Number(d["Very unfavorable"]) + Number(d["Unfavorable"]);
    return [
      { [categoryKey]: d[categoryKey], sentiment: "Very favorable",   value:  Number(d["Very favorable"]),   combined: favTotal },
      { [categoryKey]: d[categoryKey], sentiment: "Favorable",        value:  Number(d["Favorable"]),        combined: favTotal },
      { [categoryKey]: d[categoryKey], sentiment: "Unfavorable",      value: -Number(d["Unfavorable"]),      combined: unfavTotal },
      { [categoryKey]: d[categoryKey], sentiment: "Very unfavorable", value: -Number(d["Very unfavorable"]), combined: unfavTotal },
    ];
  });

  const plot = Plot.plot({
    width: width || 800,
    height: 400,
    marginLeft: 130,
    style: { display: "block", maxHeight: "400px" },
    x: { label: "Percentage (%)", domain: [-50, 100], tickFormat: Math.abs, grid: true },
    y: { label: null, domain: data.map(d => d[categoryKey]) },
    color: { domain: sentimentOrder, range: colorRange, legend: true },
    marks: [
      Plot.ruleX([0], { strokeWidth: 2 }),
      Plot.barX(divergingData, { x: "value", y: categoryKey, fill: "sentiment", order: sentimentOrder, insetTop: 2, insetBottom: 2 }),
    ],
  });

  const tooltip = createTooltip();

  attachHitDetection(plot, data, categoryKey, tooltip, (row, category, _px, _xScale, tt, event) => {
    const vf    = Number(row["Very favorable"]);
    const f     = Number(row["Favorable"]);
    const u     = Number(row["Unfavorable"]);
    const vu    = Number(row["Very unfavorable"]);
    const fav   = vf + f;
    const unfav = u + vu;
    const net   = fav - unfav;
    const sign  = net >= 0 ? "+" : "−";
    const color = net >= 0 ? "#1a9850" : "#d73027";

    const swatch = s => `<span style="color:${colorMap[s]}">■</span>`;

    tt.innerHTML = `
      <div style="font-size:13px;color:#94a3b8;margin-bottom:6px;letter-spacing:.04em;text-transform:uppercase">Sentiment breakdown</div>
      <div style="font-size:16px;font-weight:700;margin-bottom:8px;color:#fff">${category}</div>
      <div style="border-top:1px solid rgba(255,255,255,.1);padding-top:8px">
        ${swatch("Very favorable")} Very favorable: <strong>${vf.toFixed(1)}%</strong><br>
        ${swatch("Favorable")} Favorable: <strong>${f.toFixed(1)}%</strong><br>
        ${swatch("Unfavorable")} Unfavorable: <strong>${u.toFixed(1)}%</strong><br>
        ${swatch("Very unfavorable")} Very unfavorable: <strong>${vu.toFixed(1)}%</strong><br>
        <span style="font-size:13px;margin-top:6px;display:inline-block">
          Fav total: <strong style="color:#1a9850">${fav.toFixed(1)}%</strong> &nbsp;
          Unfav total: <strong style="color:#d73027">${unfav.toFixed(1)}%</strong><br>
          Net: <strong style="color:${color}">${sign}${Math.abs(net).toFixed(1)}%</strong>
        </span>
      </div>`;
    tt.style.display = "block";
    positionTooltip(tt, event);
  });

  return plot;
}

// ─── 3. PolarizedDivergingPlot ───────────────────────────────────────────────

export function PolarizedDivergingPlot(data, width, categoryKey = "AgeGroup") {
  const sentimentOrder = ["Unfavorable (Rescaled %)", "Favorable (Rescaled %)"];
  const colorRange     = ["#ea5f40", "#56b458"];

  const divergingData = data.flatMap(d => [
    { [categoryKey]: d[categoryKey], sentiment: "Favorable (Rescaled %)",   value:  Number(d["Favorable (Rescaled %)"]) },
    { [categoryKey]: d[categoryKey], sentiment: "Unfavorable (Rescaled %)", value: -Number(d["Unfavorable (Rescaled %)"]) },
  ]);

  const plot = Plot.plot({
    width: width || 800,
    height: 400,
    marginLeft: 130,
    style: { display: "block", maxHeight: "400px" },
    x: { label: "Percentage (%)", domain: [-50, 100], tickFormat: Math.abs, grid: true },
    y: { label: null, domain: data.map(d => d[categoryKey]) },
    color: { domain: sentimentOrder, range: colorRange, legend: true },
    marks: [
      Plot.ruleX([0], { strokeWidth: 2 }),
      Plot.barX(divergingData, { x: "value", y: categoryKey, fill: "sentiment", order: sentimentOrder, insetTop: 2, insetBottom: 2 }),
    ],
  });

  const tooltip = createTooltip();

  attachHitDetection(plot, data, categoryKey, tooltip, (row, category, _px, _xScale, tt, event) => {
    const fav   = Number(row["Favorable (Rescaled %)"]);
    const unfav = Number(row["Unfavorable (Rescaled %)"]);
    const net   = fav - unfav;
    const sign  = net >= 0 ? "+" : "−";
    const color = net >= 0 ? "#56b458" : "#ea5f40";

    tt.innerHTML = `
      <div style="font-size:13px;color:#94a3b8;margin-bottom:6px;letter-spacing:.04em;text-transform:uppercase">Polarized sentiment</div>
      <div style="font-size:16px;font-weight:700;margin-bottom:8px;color:#fff">${category}</div>
      <div style="border-top:1px solid rgba(255,255,255,.1);padding-top:8px">
        <span style="color:#56b458">■</span> Favorable (rescaled): <strong>${fav.toFixed(1)}%</strong><br>
        <span style="color:#ea5f40">■</span> Unfavorable (rescaled): <strong>${unfav.toFixed(1)}%</strong><br>
        Net: <strong style="color:${color}">${sign}${Math.abs(net).toFixed(1)}%</strong>
      </div>`;
    tt.style.display = "block";
    positionTooltip(tt, event);
  });

  return plot;
}

// ─── 4. RescaledDivergingPlot ─────────────────────────────────────────────────

export function RescaledDivergingPlot(data, width, categoryKey = "AgeGroup") {
  const sentimentOrder = [
    "Unfavorable (Rescaled %)",
    "Very unfavorable (Rescaled %)",
    "Favorable (Rescaled %)",
    "Very favorable (Rescaled %)",
  ];
  const colorRange = ["#fc8d59", "#d73027", "#91cf60", "#1a9850"];
  const colorMap   = Object.fromEntries(sentimentOrder.map((s, i) => [s, colorRange[i]]));

  const divergingData = data.flatMap(d => [
    { [categoryKey]: d[categoryKey], sentiment: "Very favorable (Rescaled %)",   value:  Number(d["Very favorable (Rescaled %)"])   },
    { [categoryKey]: d[categoryKey], sentiment: "Favorable (Rescaled %)",        value:  Number(d["Favorable (Rescaled %)"])        },
    { [categoryKey]: d[categoryKey], sentiment: "Unfavorable (Rescaled %)",      value: -Number(d["Unfavorable (Rescaled %)"])      },
    { [categoryKey]: d[categoryKey], sentiment: "Very unfavorable (Rescaled %)", value: -Number(d["Very unfavorable (Rescaled %)"]) },
  ]);

  const plot = Plot.plot({
    width: width || 800,
    height: 400,
    marginLeft: 130,
    style: { display: "block", maxHeight: "400px" },
    x: { label: "Percentage (%)", domain: [-50, 100], tickFormat: Math.abs, grid: true },
    y: { label: null, domain: data.map(d => d[categoryKey]) },
    color: { domain: sentimentOrder, range: colorRange, legend: true },
    marks: [
      Plot.ruleX([0], { strokeWidth: 2 }),
      Plot.barX(divergingData, { x: "value", y: categoryKey, fill: "sentiment", order: sentimentOrder, insetTop: 2, insetBottom: 2 }),
    ],
  });

  const tooltip = createTooltip();

  attachHitDetection(plot, data, categoryKey, tooltip, (row, category, _px, _xScale, tt, event) => {
    const vf    = Number(row["Very favorable (Rescaled %)"]);
    const f     = Number(row["Favorable (Rescaled %)"]);
    const u     = Number(row["Unfavorable (Rescaled %)"]);
    const vu    = Number(row["Very unfavorable (Rescaled %)"]);
    const fav   = vf + f;
    const unfav = u + vu;
    const net   = fav - unfav;
    const sign  = net >= 0 ? "+" : "−";
    const color = net >= 0 ? "#1a9850" : "#d73027";

    const swatch = s => `<span style="color:${colorMap[s]}">■</span>`;

    tt.innerHTML = `
      <div style="font-size:13px;color:#94a3b8;margin-bottom:6px;letter-spacing:.04em;text-transform:uppercase">Rescaled sentiment</div>
      <div style="font-size:16px;font-weight:700;margin-bottom:8px;color:#fff">${category}</div>
      <div style="border-top:1px solid rgba(255,255,255,.1);padding-top:8px">
        ${swatch("Very favorable (Rescaled %)")} Very favorable: <strong>${vf.toFixed(1)}%</strong><br>
        ${swatch("Favorable (Rescaled %)")} Favorable: <strong>${f.toFixed(1)}%</strong><br>
        ${swatch("Unfavorable (Rescaled %)")} Unfavorable: <strong>${u.toFixed(1)}%</strong><br>
        ${swatch("Very unfavorable (Rescaled %)")} Very unfavorable: <strong>${vu.toFixed(1)}%</strong><br>
        <span style="font-size:13px;margin-top:6px;display:inline-block">
          Fav total: <strong style="color:#1a9850">${fav.toFixed(1)}%</strong> &nbsp;
          Unfav total: <strong style="color:#d73027">${unfav.toFixed(1)}%</strong><br>
          Net: <strong style="color:${color}">${sign}${Math.abs(net).toFixed(1)}%</strong>
        </span>
      </div>`;
    tt.style.display = "block";
    positionTooltip(tt, event);
  });

  return plot;
}