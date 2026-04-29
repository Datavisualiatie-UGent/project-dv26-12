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
        // tip: true removed — replaced by custom tooltip
      }),
    ],
  });

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

    const yScale    = plot.scale("y");
    const yMin      = Math.min(...yScale.range);
    const bandwidth = Math.abs(yScale.range[1] - yScale.range[0]) / yScale.domain.length;
    const yIdx      = Math.floor((py - yMin) / bandwidth) - 1;

    if (yIdx < 0 || yIdx >= yScale.domain.length) {
      tooltip.style.display = "none";
      return;
    }

    const category = yScale.domain[yIdx];
    const row      = data.find(d => d[categoryKey] === category);
    if (!row) { tooltip.style.display = "none"; return; }

    const swatch = s => `<span style="color:${colorMap[s]}">■</span>`;

    const favTotal   = (Number(row["Very favorable"]) + Number(row["Favorable"])).toFixed(1);
    const unfavTotal = (Number(row["Very unfavorable"]) + Number(row["Unfavorable"])).toFixed(1);
    const net        = (parseFloat(favTotal) - parseFloat(unfavTotal)).toFixed(1);
    const netColor   = net >= 0 ? "#1a9850" : "#d73027";
    const netSign    = net >= 0 ? "+" : "";

    tooltip.innerHTML = `
      <div style="font-size:13px;color:#94a3b8;margin-bottom:6px;letter-spacing:.04em;text-transform:uppercase">Sentiment</div>
      <div style="font-size:16px;font-weight:700;margin-bottom:8px;color:#fff">${category}</div>
      <div style="border-top:1px solid rgba(255,255,255,.1);padding-top:8px">
        ${sentimentOrder.map(s =>
          `${swatch(s)} ${s}: <strong>${Number(row[s]).toFixed(1)}%</strong>`
        ).join("<br>")}
        <div style="border-top:1px solid rgba(255,255,255,.08);margin-top:8px;padding-top:8px;font-size:13px">
          Fav total: <strong style="color:#1a9850">${favTotal}%</strong> &nbsp;
          Unfav total: <strong style="color:#d73027">${unfavTotal}%</strong><br>
          Net: <strong style="color:${netColor}">${netSign}${net}%</strong>
        </div>
      </div>`;

    tooltip.style.display = "block";

    const tw = 280, th = 160;
    const vw = window.innerWidth, vh = window.innerHeight;
    tooltip.style.left = Math.min(event.clientX + 16, vw - tw - 8) + "px";
    tooltip.style.top  = Math.min(event.clientY + 16, vh - th - 8) + "px";
  });

  plot.addEventListener("pointerleave", () => {
    tooltip.style.display = "none";
  });

  return plot;
}