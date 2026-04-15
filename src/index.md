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
  <div class="card">${
    resize((width) => Plot.plot({
      title: "Your awesomeness over time 🚀",
      subtitle: "Up and to the right!",
      width,
      y: {grid: true, label: "Awesomeness"},
      marks: [
        Plot.ruleY([0]),
        Plot.lineY(aapl, {x: "Date", y: "Close", tip: true})
      ]
    }))
  }</div>
  <div class="card">${
    resize((width) => Plot.plot({
      title: "How big are penguins, anyway? 🐧",
      width,
      grid: true,
      x: {label: "Body mass (g)"},
      y: {label: "Flipper length (mm)"},
      color: {legend: true},
      marks: [
        Plot.linearRegressionY(penguins, {x: "body_mass_g", y: "flipper_length_mm", stroke: "species"}),
        Plot.dot(penguins, {x: "body_mass_g", y: "flipper_length_mm", stroke: "species", tip: true})
      ]
    }))
  }</div>
</div>

---

# Q1.2

```js
import * as Inputs from "npm:@observablehq/inputs";
import { StackedSentimentPlot } from "./components/q1/q1.js"

const masterSentimentData = await FileAttachment("./data/ai_sentiment.json").json();
const options = Object.keys(masterSentimentData);
const selectedOption = view(Inputs.select(options, {label: "Category 1", value: options[0]}));
```

```js
const options2 = Object.keys(masterSentimentData[selectedOption]);
const selectedOption2 = view(Inputs.select(options2, {label: "Category 2", value: options2[0]}));
```

<div class="card" style="min-height: 500px;">${
  resize(width => StackedSentimentPlot(
    masterSentimentData[selectedOption][selectedOption2], 
    width, 
    selectedOption 
  ))
}</div>

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