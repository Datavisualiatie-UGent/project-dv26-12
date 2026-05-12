import * as Plot from "npm:@observablehq/plot";

export function CompositionBarChart(items, width, { title } = {}) {
  const data = (items ?? []).map((d) => ({
    category: d.category,
    count: Number(d.count)
  }));
  const height = Math.min(520, Math.max(320, 18 * data.length));

  // Compute an adaptive bottom margin so long x-axis labels don't get clipped
  const maxLabelLen = data.reduce((m, d) => Math.max(m, String(d.category).length), 0);
  const marginBottom = Math.max(0, Math.min(220, 10 + Math.round(maxLabelLen * 5)));

  return Plot.plot({
    width,
    height,
    marginBottom,
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
