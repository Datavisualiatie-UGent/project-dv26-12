import * as d3 from "npm:d3";
import * as Plot from "npm:@observablehq/plot";

const DEFAULT_EXCLUDED_TASK_SUBSTRINGS = [
  "other",
  "deployment and monitoring",
  "predictive analytics",
  "committing and reviewing"
];

export function prepareAiRadarData(
  rawAiRadarData,
  { excludedTaskSubstrings = DEFAULT_EXCLUDED_TASK_SUBSTRINGS } = {}
) {
  const aiRadarData = (rawAiRadarData ?? []).filter((d) => {
    const taskName = String(d.task ?? "").toLowerCase();
    const ageName = String(d.Age ?? "").toLowerCase();

    const hasExcludedTask = excludedTaskSubstrings.some((word) =>
      taskName.includes(word)
    );
    const hasExcludedAge = ageName.includes("prefer not to say");

    return !hasExcludedTask && !hasExcludedAge;
  });

  const tasks = Array.from(new Set(aiRadarData.map((d) => d.task)));

  const ages = Array.from(new Set(aiRadarData.map((d) => d.Age))).sort((a, b) => {
    if (a === "All") return -1;
    if (b === "All") return 1;
    return String(a).localeCompare(String(b));
  });

  const longitude = d3.scalePoint(tasks, [0, 360 - 360 / tasks.length]);
  const maxScore = d3.max(aiRadarData, (d) => Number(d.normalized_score));
  const radiusScale = d3.scaleLinear([0, maxScore ?? 0], [0, 0.5]);
  const scoreTicks = radiusScale.ticks(5);

  const colorScale = d3.scaleOrdinal(d3.schemeTableau10).domain(ages);

  return {
    aiRadarData,
    tasks,
    ages,
    longitude,
    radiusScale,
    scoreTicks,
    colorScale
  };
}

export function AiRadarPlot(prepared, width, selectedAges) {
  const { aiRadarData, tasks, ages, longitude, radiusScale, scoreTicks } = prepared;

  const selected = Array.isArray(selectedAges) ? selectedAges : ["All"];
  const filteredData = aiRadarData.filter((d) => selected.includes(d.Age));

  return Plot.plot({
    width,
    projection: {
      type: "azimuthal-equidistant",
      rotate: [0, -90],
      domain: d3.geoCircle().center([0, 90]).radius(0.65)()
    },
    color: { legend: false, scheme: "Tableau10", domain: ages },
    marks: [
      Plot.geo(scoreTicks.map(radiusScale), {
        geometry: (r) => d3.geoCircle().center([0, 90]).radius(r)(),
        stroke: "currentColor",
        fill: "currentColor",
        strokeOpacity: 0.3,
        fillOpacity: 0.03,
        strokeWidth: 0.5
      }),
      Plot.link(tasks, {
        x1: (d) => longitude(d),
        y1: 90 - 0.57,
        x2: 0,
        y2: 90,
        stroke: "currentColor",
        strokeOpacity: 0.2,
        strokeWidth: 1.5
      }),
      Plot.text(scoreTicks.filter((d) => d > 0), {
        x: 180,
        y: (d) => 90 - radiusScale(d),
        dx: 2,
        textAnchor: "start",
        text: (d) => `${d.toFixed(0)}%`,
        fill: "currentColor",
        stroke: "var(--theme-background-alt)",
        strokeWidth: 3,
        fontSize: 10
      }),
      Plot.text(tasks, {
        x: (d) => longitude(d),
        y: 90 - 0.6,
        text: (d) => d,
        lineWidth: 12,
        fontSize: 11
      }),
      Plot.area(filteredData, {
        x1: (d) => longitude(d.task),
        y1: (d) => 90 - radiusScale(Number(d.normalized_score)),
        x2: 0,
        y2: 90,
        fill: "Age",
        stroke: "Age",
        curve: "cardinal-closed",
        fillOpacity: 0.2
      }),
      Plot.dot(filteredData, {
        x: (d) => longitude(d.task),
        y: (d) => 90 - radiusScale(Number(d.normalized_score)),
        fill: "Age",
        stroke: "var(--theme-background-alt)",
        r: 4
      })
    ]
  });
}
