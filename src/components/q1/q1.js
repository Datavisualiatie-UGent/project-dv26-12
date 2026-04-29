import * as Plot from "npm:@observablehq/plot";

export function StackedSentimentPlot(data, width, categoryKey = "AgeGroup") {
  const sentimentOrder = [
    "Very favorable",
    "Favorable",
    "Indifferent",
    "Unsure",
    "Unfavorable",
    "Very unfavorable",
  ];

  const colorRange = ["#1a9850", "#91cf60", "#e0e0e0", "#f6e8c3", "#fc8d59", "#d73027"];
  const colorMap = Object.fromEntries(sentimentOrder.map((s, i) => [s, colorRange[i]]));

  const tidyData = data.flatMap(d =>
    sentimentOrder.map(sentiment => ({
      [categoryKey]: d[categoryKey],
      sentiment,
      value: Number(d[sentiment]),
    }))
  );

  const plot = Plot.plot({
    width,
    height: 400,
    marginLeft: 130,
    style: { display: "block", maxHeight: "400px" },
    x: { label: "Percentage (%)", domain: [0, 100] },
    y: { label: null, domain: data.map(d => d[categoryKey]) },
    color: { domain: sentimentOrder, range: colorRange, legend: true },
    marks: [
      Plot.barX(tidyData, {
        x: "value",
        y: categoryKey,
        fill: "sentiment",
        insetLeft: 1,
        insetRight: 1,
      }),
    ],
  });

  // --- Tag every bar rect with its sentiment via data attribute ---
  // Plot renders bars in tidyData order inside the [aria-label="bar"] group
  const barGroup = plot.querySelector("[aria-label='bar']");
  const barRects = barGroup ? Array.from(barGroup.querySelectorAll("rect")) : [];

  barRects.forEach((rect, i) => {
    const sentiment = tidyData[i]?.sentiment;
    if (sentiment) {
      rect.dataset.sentiment = sentiment;
      rect.style.transition = "opacity 0.15s ease";
    }
  });

  function focusSentiment(hoveredSentiment) {
    barRects.forEach(rect => {
      rect.style.opacity = rect.dataset.sentiment === hoveredSentiment ? "1" : "0.15";
    });
  }

  function clearFocus() {
    barRects.forEach(rect => { rect.style.opacity = "1"; });
  }

  // --- Tooltip element ---
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

  plot.addEventListener("pointermove", (event) => {
    const rect = plot.getBoundingClientRect();
    const py   = event.clientY - rect.top;

    // --- Which row? ---
    const yScale    = plot.scale("y");
    const yMin      = Math.min(...yScale.range);
    const bandwidth = Math.abs(yScale.range[1] - yScale.range[0]) / yScale.domain.length;
    const yIdx      = Math.floor((py - yMin) / bandwidth) - 1;

    if (yIdx < 0 || yIdx >= yScale.domain.length) {
      tooltip.style.display = "none";
      clearFocus();
      return;
    }

    const category = yScale.domain[yIdx];
    const row      = data.find(d => d[categoryKey] === category);
    if (!row) { tooltip.style.display = "none"; clearFocus(); return; }

    // --- Which segment? Use elementFromPoint to get the exact rect under cursor ---
    const target           = document.elementFromPoint(event.clientX, event.clientY);
    const hoveredSentiment = target?.dataset?.sentiment ?? null;

    hoveredSentiment ? focusSentiment(hoveredSentiment) : clearFocus();

    // --- Tooltip content ---
    const favTotal   = (Number(row["Very favorable"]) + Number(row["Favorable"])).toFixed(1);
    const unfavTotal = (Number(row["Very unfavorable"]) + Number(row["Unfavorable"])).toFixed(1);
    const net        = (parseFloat(favTotal) - parseFloat(unfavTotal)).toFixed(1);
    const netColor   = parseFloat(net) >= 0 ? "#1a9850" : "#d73027";
    const netSign    = parseFloat(net) >= 0 ? "+" : "";

    tooltip.innerHTML = `
      <div style="font-size:13px;color:#94a3b8;margin-bottom:6px;letter-spacing:.04em;text-transform:uppercase">Sentiment</div>
      <div style="font-size:16px;font-weight:700;margin-bottom:8px;color:#fff">${category}</div>
      <div style="border-top:1px solid rgba(255,255,255,.1);padding-top:8px">
        ${sentimentOrder.map(s => {
          const isActive = !hoveredSentiment || s === hoveredSentiment;
          return `<div style="opacity:${isActive ? 1 : 0.3}">
            <span style="color:${colorMap[s]}">■</span> ${s}: <strong>${Number(row[s]).toFixed(1)}%</strong>
          </div>`;
        }).join("")}
        <div style="border-top:1px solid rgba(255,255,255,.08);margin-top:8px;padding-top:8px;font-size:13px">
          Fav total: <strong style="color:#1a9850">${favTotal}%</strong> &nbsp;
          Unfav total: <strong style="color:#d73027">${unfavTotal}%</strong><br>
          Net: <strong style="color:${netColor}">${netSign}${net}%</strong>
        </div>
      </div>`;

    tooltip.style.display = "block";
    const tw = 280, th = 200;
    const vw = window.innerWidth, vh = window.innerHeight;
    tooltip.style.left = Math.min(event.clientX + 16, vw - tw - 8) + "px";
    tooltip.style.top  = Math.min(event.clientY + 16, vh - th - 8) + "px";
  });

  plot.addEventListener("pointerleave", () => {
    tooltip.style.display = "none";
    clearFocus();
  });

  return plot;
}