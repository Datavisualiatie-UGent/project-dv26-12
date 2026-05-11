import * as Plot from "../../_npm/@observablehq/plot@0.6.17/a96a6bbb.js";

export function CompositionBarChart(items, width, { title } = {}) {
  const data = (items ?? []).map((d) => ({
    category: d.category,
    count: Number(d.count)
  }));

  const height = Math.min(520, Math.max(320, 18 * data.length));

  return Plot.plot({
    width,
    height,
    marginBottom: 80,
    marginLeft: 70,
    style: { display: "block" },
    title,
    x: {
      label: null,
      tickRotate: -45
    },
    y: {
      label: "Respondents"
    },
    marks: [
      Plot.ruleY([0]),
      Plot.gridY({ stroke: "#9aa0a6", strokeOpacity: 0.35, strokeDasharray: "2,4" }),
      Plot.barY(data, {
        x: "category",
        y: "count",
        fill: "steelblue",
        fillOpacity: 0.75,
        tip: true
      })
    ]
  });
}
