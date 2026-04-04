import * as d3 from "npm:d3";
import * as Plot from "npm:@observablehq/plot";

export function computeOrders(data) {
  const workedOrder = Array.from(
    d3.rollup(
      data,
      v => d3.sum(v, d => d.value),  // total count per worked model
      d => d.worked
    )
  )
  .sort((a, b) => d3.descending(a[1], b[1]))
  .map(d => d[0]);

  const wantOrder = Array.from(
    d3.rollup(
      data,
      v => d3.sum(v, d => d.value),  // total count per want model
      d => d.want
    )
  )
  .sort((a, b) => d3.descending(a[1], b[1]))
  .map(d => d[0]);

  return { workedOrder, wantOrder };
}

export function Heatmap(data, workedOrder, wantOrder, width = 900) {
  return Plot.plot({
    width,
    height: width * 0.6,
    marginLeft: 100,
    marginBottom: 60,
    x: { domain: wantOrder },
    y: { domain: workedOrder },
    color: {
        type: "linear",
        scheme: "blues",
        domain: [0, d3.max(data, d => d.value)],
        legend: true
    },
    /* color: {
        type: "quantile",
        scheme: "blues",
        n: 6,
        legend: true
        }, */
    marks: [
      Plot.rect(data, {
        x: "want",
        y: "worked",
        fill: "value",
        title: d =>
        `${d.worked} → ${d.want}
        ${(d.value * 100).toFixed(2)}%`
      })
    ]
  });
}