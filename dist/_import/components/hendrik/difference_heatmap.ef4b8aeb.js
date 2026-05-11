import * as Plot from "../../../_npm/@observablehq/plot@0.6.17/a96a6bbb.js";
import * as d3 from "../../../_npm/d3@7.9.0/66d82917.js";

export function buildDifferenceMatrix(data) {
  const names = Array.from(
    new Set(data.flatMap(d => [d.worked, d.want]))
  );

  const index = new Map(names.map((n, i) => [n, i]));

  // build raw matrix
  const mat = Array.from({ length: names.length }, () =>
    Array(names.length).fill(0)
  );

  for (const d of data) {
    const i = index.get(d.worked);
    const j = index.get(d.want);
    mat[i][j] += d.value;
  }

  // build difference matrix
  const diff = Array.from({ length: names.length }, () =>
    Array(names.length).fill(0)
  );

  for (let i = 0; i < names.length; i++) {
    for (let j = 0; j < names.length; j++) {
      diff[i][j] = mat[i][j] - mat[j][i];
    }
  }

  return { diff, names };
}

function matrixToFlat(diff, names) {
  const out = [];

  for (let i = 0; i < names.length; i++) {
    for (let j = 0; j < names.length; j++) {
      if (i === j) continue;

      out.push({
        worked: names[i],
        want: names[j],
        value: diff[i][j]
      });
    }
  }

  return out;
}

/* function matrixToLowerFlat(diff, names) {
  const out = [];

  for (let i = 0; i < names.length; i++) {
    for (let j = 0; j < i; j++) {
      if (i === j) continue;

      out.push({
        worked: names[i],
        want: names[j],
        value: diff[i][j]
      });
    }
  }

  return out;
} */

export function DifferenceHeatmap(data, width = 900) {
  const { diff, names } = buildDifferenceMatrix(data);
  const flat = matrixToFlat(diff, names);
  const maxAbs = d3.max(flat, d => Math.abs(d.value));

  //console.log(matrixToLowerFlat(diff, names));

  const plot = Plot.plot({
    width,
    height: width * 0.6,
    marginLeft: 100,
    marginBottom: 60,
    x: { domain: names },
    y: { domain: names },
    color: {
      type: "diverging",
      scheme: "RdBu",
      domain: [maxAbs, -maxAbs],
      legend: true
    },
    marks: [
      Plot.rect(flat, {
        x: "want",
        y: "worked",
        fill: "value",
        // No tip: true here — we handle it manually
      })
    ]
  });

  // --- Custom tooltip ---
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
     const el = document.elementFromPoint(event.clientX, event.clientY);
    const idx = el?.__data__;

    if (idx == null || typeof idx !== "number") {
      tooltip.style.display = "none";
      return;
    }

    const d = flat[idx];

    if (!d?.worked || !d?.want || d.worked === d.want) {
      tooltip.style.display = "none";
      return;
    }

    if (!d) { tooltip.style.display = "none"; return; }

    const v = d.value * 100;
    const abs = Math.abs(v).toFixed(2);
    let arrow, flowLine, color;

    if (v > 0) {
      arrow = "→";
      flowLine = `Net flow: <strong style="color:#ef4444">+${abs}%</strong>`;
      color = "#ef4444";
    } else if (v < 0) {
      arrow = "←";
      flowLine = `Net flow: <strong style="color:#3b82f6">−${abs}%</strong>`;
      color = "#3b82f6";
    } else {
      arrow = "↔";
      flowLine = `Net flow: <strong style="color:#86efac">0%</strong>`;
      color = "#22c55e";
    }

    tooltip.innerHTML = `
      <div style="font-size:13px;color:#94a3b8;margin-bottom:6px;letter-spacing:0.04em;text-transform:uppercase">Sector flow</div>
      <div style="font-size:16px;font-weight:700;margin-bottom:8px;color:#fff">
        ${d.worked} <span style="color:${color}">${arrow}</span> ${d.want}
      </div>
      <div style="border-top:1px solid rgba(255,255,255,0.1);padding-top:8px">
        ${flowLine}<br/>
        <span style="font-size:13px;color:#cbd5e1">
          ${v > 0
            ? `More moving <em>${d.worked} → ${d.want}</em>`
            : v < 0
            ? `More moving <em>${d.want} → ${d.worked}</em>`
            : `Balanced — equal flows both ways`}
        </span>
      </div>
    `;

    tooltip.style.display = "block";
    // Position with edge-clamping
    const tw = 280, th = 120;
    const vw = window.innerWidth, vh = window.innerHeight;
    const left = Math.min(event.clientX + 16, vw - tw - 8);
    const top  = Math.min(event.clientY + 16, vh - th - 8);
    tooltip.style.left = left + "px";
    tooltip.style.top  = top  + "px";
  });

  plot.addEventListener("pointerleave", () => {
    tooltip.style.display = "none";
  });

  return plot;
}