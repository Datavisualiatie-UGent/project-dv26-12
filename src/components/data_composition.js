import * as Plot from "npm:@observablehq/plot";

export function CompositionBarChart(items, width, { title } = {}) {
  const data = (items ?? []).map((d) => ({
    category: d.category,
    count: Number(d.count)
  }));

  const height = Math.min(520, Math.max(320, 18 * data.length));

  return Plot.plot({
    width,
    height,
    marginBottom: 110,
    marginLeft: 60,
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
