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

# AI sentiment
In an ever-increasing use and presence of AI in the programming landscape, we show how different ages, backgrounds, and working environments impact the sentiment towards the use of AI.

Below we show grouped distributions of answers from programmers when asked the question:
*How favorable is your stance on using AI tools as part of your development workflow?*

Depending on how the answers are grouped, we get some interesting results.
It is clear that amongst young developers the AI sentiment answers are more opinionated compared to older developers, where we see more uncertainty in the answers.

When looking at profession, it is clear that hobbyists are remarkably less favorable of the use of AI in the development workflow.

When looking at employment, we again see higher uncertainty in the answers for retired developers.
```js
import * as Inputs from "npm:@observablehq/inputs";
import { StackedSentimentPlot } from "./components/q1/q1.js"

const masterSentimentData = await FileAttachment("./data/ai_sentiment.json").json();
const options = Object.keys(masterSentimentData);
const selectedOption = view(Inputs.select(options, {label: "Group by", value: options[0]}));
```

```js
const options2 = ["Category", "Favorable", "Unfavorable"]
const selectedOption2 = view(Inputs.select(options2, {label: "Sort by", value: options2[0]}));
```

<div class="card" style="min-height: 500px;">${
  resize(width => StackedSentimentPlot(
    masterSentimentData[selectedOption][selectedOption2], 
    width, 
    selectedOption 
  ))
}</div>
When we rescale the answers to exclude uncertainty, we get the opinionated distribution of the answers.

When we group the answers by dominant programming language used, we see that a lot of the higher AI sentiment is present with the higher-level programming languages (Dart, Swift, TypeScript) and lower sentiment for the lower-level systems programming languages (Assembly, Rust, C, C++).

Again for hobbiest we see that we have an almost 50/50 split in sentiment when we look at the opionated results.
```js
import { DivergingSentimentPlot, DivergingStackedSentimentPlot, PolarizedDivergingPlot, RescaledDivergingPlot} from "./components/q1/b2b.js"

const masterDivergingSentimentData = await FileAttachment("./data/ai_sentiment1.json").json();
const DivergingOptions1 = Object.keys(masterDivergingSentimentData);
const selectedDivergingOption = view(Inputs.select(DivergingOptions1, {label: "Group by", value: DivergingOptions1[0]}));
```

```js
const DivergingOptions2 = ["PolarizedFour", "PolarizedFourFavorable", "PolarizedFourUnfavorable"]
const selectedDivergingOption2 = view(Inputs.select(DivergingOptions2, {label: "Sort by", value: options2[0]}));
```

<div class="card" style="min-height: 450px;">${
  resize(width => RescaledDivergingPlot(masterDivergingSentimentData[selectedDivergingOption][selectedDivergingOption2], width, selectedDivergingOption))
}</div>

<!-- <div class="card" style="min-height: 450px;">${
  resize(width => DivergingStackedSentimentPlot(masterDivergingSentimentData[selectedDivergingOption][selectedDivergingOption2], width, selectedDivergingOption))
}</div> -->

<!-- <div class="card" style="min-height: 450px;">${
  resize(width => PolarizedDivergingPlot(masterDivergingSentimentData[selectedDivergingOption][selectedDivergingOption2], width, selectedDivergingOption))
}</div> -->

<!-- # Q1.2 Waffle Chart

```js
import { WaffleChart } from "./components/q1/waffle.js"

const masterWaffleSentimentData2 = await FileAttachment("./data/ai_sentiment.json").json();
const waffleOptions1 = Object.keys(masterWaffleSentimentData2).filter(key => key !== "Language");
const selectedWaffleOption = view(Inputs.select(waffleOptions1, {label: "Group by", value: waffleOptions1[0]}));
```


<div class="card">${
  resize(width => WaffleChart(masterWaffleSentimentData2[selectedWaffleOption]["Category"], width, selectedWaffleOption))
}</div> -->


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
// import * as Inputs from "npm:@observablehq/inputs";
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