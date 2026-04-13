---
toc: false
---

<link rel="stylesheet" href="./css/styles.css">

<div class="hero">
  <h1>Datavisualisatie Project</h1>
  <h2>Welcome to your new app! Edit&nbsp;<code style="font-size: 90%;">src/index.md</code> to change this page.</h2>
  <a href="https://observablehq.com/framework/getting-started">Get started<span style="display: inline-block; margin-left: 0.25rem;">↗︎</span></a>
</div>

<div class="grid grid-cols-2" style="grid-auto-rows: 504px;">
  
</div>

---

# Heatmap

```js
import { computeOrders, Heatmap } from "./components/hendrik/heatmap.js"
import { normalizeByWorked } from "./components/utils.js"

const raw = await FileAttachment("./data/heatmap.json").json()
const data = normalizeByWorked(raw)
const dataNoSelf = data.filter(d => d.worked !== d.want);

const { workedOrder, wantOrder } = computeOrders(raw)
```

<div class="card">${
  resize(width => Heatmap(data, workedOrder, wantOrder, width))
}</div>

# Sankey Diagram
```js
// Import the select input
import * as Inputs from "npm:@observablehq/inputs";
import { toSankey, buildSankeyGraph, filterSankeyByNode } from "./components/hendrik/sankey.js"

const normalised_data = await FileAttachment("./data/model_usage_normalised.json").json()

const companies = Array.from(new Set(normalised_data.map(d => d.worked))).sort();
```

```js
const companyInput = Inputs.select(companies, {label: "Select", value: "OpenAI"});
const selectedCompany = view(companyInput);
```

```js
const sankeyData = toSankey(normalised_data, selectedCompany);
```

<div class="card" style="min-height: 500px;">${
  resize(width => buildSankeyGraph(sankeyData, width))
}</div>

# Difference Heatmap

```js
import { DifferenceHeatmap } from "./components/hendrik/difference_heatmap.js"
```

<div class="card" style="min-height: 500px;">${
  resize(width => DifferenceHeatmap(normalised_data, width))
}</div>


# Radar Chart
```js
// Load the raw data
const rawAiRadarData = await FileAttachment("./data/radar_data.json").json();

// Define the phrases to remove from the tasks because they are almost equal across age groups
const excludedTasks = [
  "other",
  "deployment and monitoring",
  "predictive analytics",
  "committing and reviewing"
];

// Filter the data: remove excluded tasks AND the "prefer not to say" age group
const aiRadarData = rawAiRadarData.filter(d => {
  const taskName = d.task.toLowerCase();
  const ageName = d.Age ? d.Age.toLowerCase() : "";
  
  const hasExcludedTask = excludedTasks.some(word => taskName.includes(word));
  const hasExcludedAge = ageName.includes("prefer not to say");
  
  return !hasExcludedTask && !hasExcludedAge;
});

// Setup the scales and inputs using the newly cleaned data
const tasks = Array.from(new Set(aiRadarData.map(d => d.task)));
const ages = Array.from(new Set(aiRadarData.map(d => d.Age))).sort();
const longitude = d3.scalePoint(tasks, [0, 360 - 360 / tasks.length]);

const maxScore = d3.max(aiRadarData, d => d.normalized_score);
const radiusScale = d3.scaleLinear([0, maxScore], [0, 0.5]);
const scoreTicks = radiusScale.ticks(5);

// Create the interactive checkbox
const selectedAges = view(Inputs.checkbox(ages, {label: "Select Age Groups:", value: ages}));
```

```js
// Filter the data based on checkbox selection
const filteredData = aiRadarData.filter(d => selectedAges.includes(d.Age));
```

<div class="card" style="min-height: 600px;">${
  resize((width) => Plot.plot({
    width,
    projection: {
      type: "azimuthal-equidistant",
      rotate: [0, -90],
      domain: d3.geoCircle().center([0, 90]).radius(0.65)()
    },
    color: { legend: true, scheme: "Tableau10", domain: ages },
    marks: [
      Plot.geo(scoreTicks.map(radiusScale), { geometry: (r) => d3.geoCircle().center([0, 90]).radius(r)(), stroke: "currentColor", fill: "currentColor", strokeOpacity: 0.3, fillOpacity: 0.03, strokeWidth: 0.5 }),
      Plot.link(tasks, { x1: (d) => longitude(d), y1: 90 - 0.57, x2: 0, y2: 90, stroke: "currentColor", strokeOpacity: 0.2, strokeWidth: 1.5 }),
      Plot.text(scoreTicks.filter(d => d > 0), { x: 180, y: (d) => 90 - radiusScale(d), dx: 2, textAnchor: "start", text: (d) => `${d.toFixed(0)}%`, fill: "currentColor", stroke: "var(--theme-background-alt)", strokeWidth: 3, fontSize: 10 }),
      Plot.text(tasks, { x: (d) => longitude(d), y: 90 - 0.60, text: (d) => d, lineWidth: 12, fontSize: 11 }),
      Plot.area(filteredData, { x1: (d) => longitude(d.task), y1: (d) => 90 - radiusScale(d.normalized_score), x2: 0, y2: 90, fill: "Age", stroke: "Age", curve: "cardinal-closed", fillOpacity: 0.2 }),
      Plot.dot(filteredData, { x: (d) => longitude(d.task), y: (d) => 90 - radiusScale(d.normalized_score), fill: "Age", stroke: "var(--theme-background-alt)", r: 4 })
    ]
  }))
}</div>