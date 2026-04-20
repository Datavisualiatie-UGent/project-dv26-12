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

# Q1. Stacked Bar Chart

```js
import * as Inputs from "npm:@observablehq/inputs";
import { StackedSentimentPlot } from "./components/q1/q1.js"

const masterSentimentData = await FileAttachment("./data/ai_sentiment.json").json();
const options = Object.keys(masterSentimentData);
const selectedOption = view(Inputs.select(options, {label: "Group by", value: options[0]}));
```

```js
const options2 = Object.keys(masterSentimentData[selectedOption]);
const selectedOption2 = view(Inputs.select(options2, {label: "Sort by", value: options2[0]}));
```

<div class="card" style="min-height: 500px;">${
  resize(width => StackedSentimentPlot(
    masterSentimentData[selectedOption][selectedOption2], 
    width, 
    selectedOption 
  ))
}</div>

# Q1.2 Waffle Chart

```js
import { WaffleChart } from "./components/q1/waffle.js"

const masterWaffleSentimentData2 = await FileAttachment("./data/ai_sentiment.json").json();
const waffleOptions1 = Object.keys(masterWaffleSentimentData2).filter(key => key !== "Language");
const selectedWaffleOption = view(Inputs.select(waffleOptions1, {label: "Group by", value: waffleOptions1[0]}));
```


<div class="card">${
  resize(width => WaffleChart(masterWaffleSentimentData2[selectedWaffleOption]["Category"], width, selectedWaffleOption))
}</div>

# Q1.3 Back-to-Back Bar Chart

```js
import { DivergingSentimentPlot, DivergingStackedSentimentPlot } from "./components/q1/b2b.js"

const masterDivergingSentimentData = await FileAttachment("./data/ai_sentiment.json").json();
const DivergingOptions1 = Object.keys(masterDivergingSentimentData);
const selectedDivergingOption = view(Inputs.select(DivergingOptions1, {label: "Group by", value: DivergingOptions1[0]}));
```

```js
const DivergingOptions2 = Object.keys(masterDivergingSentimentData[selectedDivergingOption]);
const selectedDivergingOption2 = view(Inputs.select(DivergingOptions2, {label: "Sory by", value: options2[0]}));
```


<div class="card" style="min-height: 450px;">${
  resize(width => DivergingStackedSentimentPlot(masterDivergingSentimentData[selectedDivergingOption][selectedDivergingOption2], width, selectedDivergingOption))
}</div>

# Difference Heatmap

```js
import { DifferenceHeatmap } from "./components/hendrik/difference_heatmap.js"
const normalised_data = await FileAttachment("./data/model_usage_normalised.json").json()
```

<div class="card" style="min-height: 500px;">${
  resize(width => DifferenceHeatmap(normalised_data, width))
}</div>

### The AI Migration Map: Analyzing Net User Flow Across Model Providers
This flow diagram visualizes the net migration preferences among users of major AI model providers. Each connection represents the percentage of users currently working with one company who express willingness to switch to another. OpenAI emerges as the strongest attractor across the ecosystem, drawing interest from 13-27% of users at competing platforms, with particularly high appeal among X (26.6%), Perplexity (25.3%), and Meta (23.8%) users. Google maintains the second-strongest pull, attracting 6-14% of users from other providers. The data reveals a clear hierarchy of perceived desirability, with more established players like OpenAI and Google drawing significantly more interest than they lose, while newer or smaller providers like Reka, Cohere, and Alibaba show substantial outflows toward the market leaders. Notably, some transitions show near-zero or even slightly negative flows—such as DeepSeek to Anthropic (-0.17%)—suggesting strong satisfaction or loyalty among certain user bases. The pattern indicates a market where users actively consider alternatives, with switching interest concentrated toward a few dominant platforms rather than distributed evenly across competitors.

# Radar Chart

```js
// Load the raw data
const rawAiRadarData = await FileAttachment("./data/radar_data.json").json();

const excludedTasks = [
  "other",
  "deployment and monitoring",
  "predictive analytics",
  "committing and reviewing"
];

const aiRadarData = rawAiRadarData.filter(d => {
  const taskName = d.task.toLowerCase();
  const ageName = d.Age ? d.Age.toLowerCase() : "";
  const hasExcludedTask = excludedTasks.some(word => taskName.includes(word));
  const hasExcludedAge = ageName.includes("prefer not to say");
  return !hasExcludedTask && !hasExcludedAge;
});

const tasks = Array.from(new Set(aiRadarData.map(d => d.task)));

const ages = Array.from(new Set(aiRadarData.map(d => d.Age)))
  .sort((a, b) => {
    if (a === "All") return -1;
    if (b === "All") return 1;
    return a.localeCompare(b);
  });

const longitude = d3.scalePoint(tasks, [0, 360 - 360 / tasks.length]);
const maxScore = d3.max(aiRadarData, d => d.normalized_score);
const radiusScale = d3.scaleLinear([0, maxScore], [0, 0.5]);
const scoreTicks = radiusScale.ticks(5);

const colorScale = d3.scaleOrdinal(d3.schemeTableau10).domain(ages);
```

```js
// Mutable reactive value — only "All" selected by default
const selectedAges = Mutable(["All"]);
const setSelectedAges = (v) => { selectedAges.value = v; };
```

```js
const filteredData = aiRadarData.filter(d => selectedAges.includes(d.Age));
```
The following Radar Chart tells us something about which tasks AI is used for between different age-demographics. On average, we can see that the main usage of AI is 'Search for answers', with nearly 15% of all AI-users using AI for this purpose. This tells us that AI is mostly used as a glorified search engine. 
Another interesting insight follows when comparing the younger generation (18-24) to the old guard (65+). The most notable difference here are for the tasks: 'Writing code', 'Creating or maintaining documentation', 'Generating content orsynthetic data



<div class="card" style="min-height: 600px; display: flex; align-items: flex-start; gap: 1rem;">
  <div style="flex: 1;">
    ${resize((width) => Plot.plot({
      width,
      projection: {
        type: "azimuthal-equidistant",
        rotate: [0, -90],
        domain: d3.geoCircle().center([0, 90]).radius(0.65)()
      },
      color: { legend: false, scheme: "Tableau10", domain: ages },
      marks: [
        Plot.geo(scoreTicks.map(radiusScale), { geometry: (r) => d3.geoCircle().center([0, 90]).radius(r)(), stroke: "currentColor", fill: "currentColor", strokeOpacity: 0.3, fillOpacity: 0.03, strokeWidth: 0.5 }),
        Plot.link(tasks, { x1: (d) => longitude(d), y1: 90 - 0.57, x2: 0, y2: 90, stroke: "currentColor", strokeOpacity: 0.2, strokeWidth: 1.5 }),
        Plot.text(scoreTicks.filter(d => d > 0), { x: 180, y: (d) => 90 - radiusScale(d), dx: 2, textAnchor: "start", text: (d) => `${d.toFixed(0)}%`, fill: "currentColor", stroke: "var(--theme-background-alt)", strokeWidth: 3, fontSize: 10 }),
        Plot.text(tasks, { x: (d) => longitude(d), y: 90 - 0.60, text: (d) => d, lineWidth: 12, fontSize: 11 }),
        Plot.area(filteredData, { x1: (d) => longitude(d.task), y1: (d) => 90 - radiusScale(d.normalized_score), x2: 0, y2: 90, fill: "Age", stroke: "Age", curve: "cardinal-closed", fillOpacity: 0.2 }),
        Plot.dot(filteredData, { x: (d) => longitude(d.task), y: (d) => 90 - radiusScale(d.normalized_score), fill: "Age", stroke: "var(--theme-background-alt)", r: 4 })
      ]
    }))}
  </div>

  <div style="display: flex; flex-direction: column; gap: 0.5rem; padding-top: 1rem; min-width: 160px;">
    <span style="font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; opacity: 0.6; margin-bottom: 0.25rem;">Age Group</span>
    ${ages.map(age => {
      const active = selectedAges.includes(age);
      const color = colorScale(age);
      const btn = html`<button style="
        display: block;
        width: 100%;
        padding: 0.4rem 0.75rem;
        border-radius: 6px;
        border: 2px solid ${color};
        background: ${active ? color : "transparent"};
        color: ${active ? "#fff" : "currentColor"};
        font-size: 0.8rem;
        font-weight: 500;
        cursor: pointer;
        text-align: left;
        transition: background 0.15s, color 0.15s;
      ">${age}</button>`;
      btn.addEventListener("click", () => {
        const current = selectedAges.includes(age)
          ? selectedAges.filter(a => a !== age)
          : [...selectedAges, age];
        setSelectedAges(current);
      });
      return btn;
    })}
  </div>
</div>