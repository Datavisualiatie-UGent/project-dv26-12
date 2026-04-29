---
toc: false
---

<link rel="stylesheet" href="./css/styles.css">

<div class="container">
  <div class="hero">
    <h1>AI usage among stack-overflow users</h1>
    <p>This project was made with data from the 2025 Stack Overflow Developer Survey.</p>
  </div>
</div>

---


<div class="container">

Each year, thousands of stack-overflow users participate in the annual developer survey, sharing insights about their backgrounds, preferences, and experiences in the programming world. In this project, we analyze the 2025 edition of the survey to explore how different demographics of programmers use AI tools in their development workflow. We investigate the composition of the dataset, examine sentiment towards AI, and analyze migration patterns among AI model providers. Through interactive visualizations, we aim to uncover trends and insights that shed light on the evolving relationship between developers and AI technologies.


# Dataset composition
Because the dataset is quite large and complex, we have normalized the data in the graphs below, so that the values are comparable across different demographic groups. Because this might obscure the actual distribution of the dataset, we also show the composition of the dataset across different demographic dimensions. This allows us to reason about the representativeness of the dataset and the potential biases that might be present in the data.

```js
import * as Inputs from "npm:@observablehq/inputs";
import { CompositionBarChart } from "./components/data_composition.js";

const compositionData = await FileAttachment("./data/data_composition.json").json();
const compositionOptions = ["age", "education", "employment", "language", "profession"];
const selectedComposition = view(
  Inputs.select(compositionOptions, { label: "Composition by", value: "age" })
);
```

<div class="card" style="min-height: 520px;">${
  resize((width) =>
    CompositionBarChart(compositionData[selectedComposition].items, width, {
      title: compositionData[selectedComposition].label
    })
  )
}</div>

As you can see in the graphs above, the dataset is mostly made up of younger developers, with a significant drop in representation for older age groups. The majority of respondents have a bachelor's degree, and most are employed full-time. In terms of programming languages, JavaScript is the most commonly used language among respondents, followed by Python and Java. The dataset also includes a mix of professionals, hobbyists, students, and retired developers, with professionals being the largest group.
</div>

<div class="container">

# AI sentiment
The first big question that we want to answer is: *how do different demographics of programmers feel about using AI tools in their development workflow?* 

To answer this question, we look at the distribution of answers to the question about AI sentiment across different demographic groups. We also look at the distribution of answers when we exclude the "uncertain" category, to get a better sense of the opinionated distribution of answers.

```js
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

Depending on how we group the answers, we can see some interesting patterns in the data. When we look at the distribution of answers across different age groups, we see that **developers between the ages of 24 and 54 are more likely to have a favorable opinion of AI tools compared to younger and older developers**. This could be because developers in this age range are more likely to be in the prime of their careers and may see AI tools as a way to improve their productivity and stay competitive in the job market. On the other hand, younger developers may be more skeptical of AI tools because they may not have as much experience with them, while older developers may be more resistant to change and may prefer traditional methods of programming.

When we look at the distribution of answers across different professions, we see that **hobbyists are less likely to have a favorable opinion of AI tools compared to professionals**. This could be because hobbyists feel less external pressure to adopt new tools and technologies for the sake of improving workflow efficiency, and may be more focused on the enjoyment of programming rather than optimizing for productivity.


In the graph below, we leave out the "indifferent" and "unsure" categories to get a better sense of the opinionated distribution of answers.

```js
import { DivergingSentimentPlot, DivergingStackedSentimentPlot, PolarizedDivergingPlot, RescaledDivergingPlot} from "./components/q1/b2b.js"

const masterDivergingSentimentData = await FileAttachment("./data/ai_sentiment.json").json();
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

The most notable pattern that emerges from the data is that hobbyists are very divided in their sentiment towards AI tools, with a significant portion expressing unfavorable opinions. With **only 50.4% of opinionated hobbyists expressing favorable sentiment**, this group stands out as the most polarized in their views on AI tools. This polarization could be attributed to a variety of factors, such as differing levels of familiarity with AI technologies, varying expectations for how AI should be integrated into their programming workflow, or a stronger emotional attachment to traditional programming methods among hobbyists compared to professionals who may prioritize efficiency and productivity.

Another interesting pattern is that **the sentiment towards AI tools tends to be more favorable among developers who use higher-level programming languages, such as Dart, Swift, and TypeScript, compared to those who use lower-level systems programming languages like Assembly, Rust, C, and C++**. This could be because developers working with higher-level languages may find AI tools more beneficial for tasks like code generation, debugging, and documentation, while those working with lower-level languages may have more complex and performance-critical code that they feel is less suited for AI assistance.

</div>


<div class="container">

# The AI Migration Map: Analyzing Net User Flow Across Model Providers

Our next question is: *which LLM models for AI tools have you used for development work in the past year, and which would you like to use next year?*

Because there are so many models out there, we have grouped models based on the company that provides them. For example, we have grouped all models provided by OpenAI (such as GPT-3.5, GPT-4, and ChatGPT) under the umbrella of "OpenAI". This allows us to analyze the net migration patterns between different companies rather than individual models, which can provide insights into brand loyalty and overall market dynamics.



This flow diagram visualizes the net migration preferences among users of major AI model providers. Each connection represents the net difference in switching interest between two companies, calculated as the percentage of users of one company willing to switch to the other minus the percentage of users in the opposite direction. 

```js
import { DifferenceHeatmap } from "./components/hendrik/difference_heatmap.js"
const normalised_data = await FileAttachment("./data/model_usage_normalised.json").json()
```

<div class="card" style="min-height: 500px;">${
  resize(width => DifferenceHeatmap(normalised_data, width))
}</div>

OpenAI emerges as the strongest attractor across the ecosystem, drawing interest from 13-27% of users at competing platforms, with particularly high appeal among X (26.6%), Perplexity (25.3%), and Meta (23.8%) users. Google maintains the second-strongest pull, attracting 6-14% of users from other providers. The data reveals a clear hierarchy of perceived desirability, with more established players like OpenAI and Google drawing significantly more interest than they lose, while newer or smaller providers like Reka, Cohere, and Alibaba show substantial outflows toward the market leaders. Notably, some transitions show near-zero or even slightly negative flows—such as DeepSeek to Anthropic (-0.17%)—suggesting strong satisfaction or loyalty among certain user bases. The pattern indicates a market where users actively consider alternatives, with switching interest concentrated toward a few dominant platforms rather than distributed evenly across competitors.


</div>

<div class="container">

# AI usage in development workflow

Our final question is: *which parts of your development workflow are you currently integrating into AI or using AI tools to accomplish or plan to use AI to accomplish over the next 3 - 5 years?*

Since we have now established that sentiment towards AI tools varies across different demographic groups, we want to take a closer look at how the actual usage of AI tools varies across different demographic groups. The radar chart below shows the distribution of AI usage across different tasks for different age groups. This allows us to see which tasks are more commonly associated with AI usage among different age demographics, and whether there are any notable differences in the types of tasks that younger versus older developers are using AI for.

```js
import { prepareAiRadarData, AiRadarPlot } from "./components/ai_radar.js";

const rawAiRadarData = await FileAttachment("./data/radar_data.json").json();
const radar = prepareAiRadarData(rawAiRadarData);

const ages = radar.ages;
const colorScale = radar.colorScale;
```

```js
// Mutable reactive value — only "All" selected by default
const selectedAges = Mutable(["All"]);
const setSelectedAges = (v) => { selectedAges.value = v; };
```

```js
// filteredData is handled inside AiRadarPlot
```




<div class="card" style="min-height: 600px; display: flex; align-items: flex-start; gap: 1rem;">
  <div style="flex: 1;">
    ${resize((width) => AiRadarPlot(radar, width, selectedAges))}
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

On average, we can see that **the main usage of AI is 'Search for answers'**, with nearly 15% of all AI-users using AI for this purpose. 
This tells us that many users are using AI as a search engine. Another interesting insight follows when comparing the younger generation (18-24) to the old guard (65+). The most notable difference here is that **older developers (65+) are more likely to use AI for 'Writing code', while younger developers (18-24) are more likely to use AI for 'Creating or maintaining documentation' and 'Generating content or synthetic data'**. 

For all other tasks, the distribution of AI usage is relatively similar across different age groups. This could suggest that while there are some differences in the specific tasks that different age groups use AI for, there is a general trend towards using AI across a wide range of development tasks regardless of age. It may also indicate that the adoption of AI tools is becoming more widespread and integrated into various aspects of the development workflow across all demographics.

</div>