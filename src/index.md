---
toc: false
---

<link rel="stylesheet" href="./css/styles.css">

```js
{
  const canvas = document.getElementById("particle-bg");
  const ctx = canvas.getContext("2d");

  let W, H, particles;

  const N = 250;
  const MAX_DIST = 200;

  function resize() {
    const hero = document.querySelector(".hero");
    const wrapper = document.getElementById("particle-wrapper");
    const containers = document.querySelectorAll(".container");
    const nextContainer = containers[1];
    const heroRect = hero.getBoundingClientRect();
    const nextContainerRect = nextContainer?.getBoundingClientRect();
    const stretchHeight = (nextContainerRect ? nextContainerRect.top - heroRect.top : heroRect.height) - 40;
    wrapper.style.height = `${stretchHeight}px`;
    const wrapperRect = wrapper.getBoundingClientRect();
    const padding = 60;

    W = canvas.width  = wrapperRect.width + padding * 2;
    H = canvas.height = stretchHeight + padding * 2;

    canvas.style.left = -padding + "px";
    canvas.style.top  = -padding + "px";
  }

  function initParticles() {
    particles = Array.from({ length: N }, () => ({
      x:  Math.random() * W,
      y:  Math.random() * H,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r:  Math.random() * 2 + 1,
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Draw connecting lines
    for (let i = 0; i < N; i++) {
      for (let j = i + 1; j < N; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MAX_DIST) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(99, 179, 237, ${1 - dist / MAX_DIST})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }

    // Draw dots
    for (const p of particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(99, 179, 237, 0.8)";
      ctx.fill();
    }
  }

  function update() {
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
    }
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  resize();
  initParticles();
  loop();

  window.addEventListener("resize", () => { resize(); initParticles(); });
}
```

<div class="container">
  <div class="hero">
    <div id="particle-wrapper">
      <canvas id="particle-bg"></canvas>
    </div>
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

<div class="card">${
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

Our next question is: *which model providers attract users from competitors, and which providers tend to lose them?*

To make the comparison readable, we group individual models by provider (for example, GPT-3.5, GPT-4, and ChatGPT are all counted under OpenAI).  
Each cell in the map shows a **net flow** between two providers:

**net flow (A → B) = % of A users who want B − % of B users who want A**

A positive value means B is a net winner in that pair; a negative value means A retains more users than it loses.

```js
import { DifferenceHeatmap } from "./components/hendrik/difference_heatmap.js"
const normalised_data = await FileAttachment("./data/model_usage_normalised.json").json()
```

<div class="card" style="min-height: 500px;">${
  resize(width => DifferenceHeatmap(normalised_data, width))
}</div>

The strongest pull is toward **OpenAI**: net inflows from every other provider are large (for example, +26.6 from X, +25.3 from Perplexity, and +23.8 from Meta). In other words, no matter where users start, OpenAI tends to win more users than it loses in pairwise comparisons. **Google** is the second main attractor, with consistent positive inflows from most providers (typically around +6 to +14 percentage points).

Below that top tier, **DeepSeek** and **Anthropic** show positive overall inflow as well, but with a smaller and more selective advantage. DeepSeek gains net users from many providers (including Microsoft, Amazon, Cohere, and Reka), while its flow with Anthropic is almost balanced (-0.17), indicating very similar two-way switching interest between those two ecosystems. This near-zero edge is useful because it shows that not all relationships are dominated by a single provider; some pairs are genuinely competitive.

The providers with mostly negative balances (such as Reka, Cohere, Amazon, Microsoft, Alibaba, and Perplexity) are not necessarily unpopular, but they are generally less preferred as a *next* destination when users compare options side by side. Taken together, the map suggests a market with a clear hierarchy: a small number of providers absorb most of the net migration, while the rest contribute more outbound interest than inbound interest. The key takeaway is that switching intent is active, but it is not evenly spread across the ecosystem.


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

<div class="container">

# Conclusion

This project shows that AI use in development is broad, but not uniform. The dataset is skewed toward younger and more active developers, so the visualizations should be read with that composition in mind. Even so, a clear pattern emerges: sentiment is generally favorable, especially among developers in the middle of their careers, while younger and hobbyist groups tend to be more divided.

When we move from opinion to behavior, the radar chart suggests that AI is already embedded in everyday workflows, with search, documentation, and code-related tasks all showing meaningful usage. Taken together, the three views point to the same conclusion: AI is no longer a niche experiment in this community, but a practical tool whose adoption depends on both demographic context and the kind of work people are doing.

</div>


<div style="text-align: center; padding: 3rem 1rem 1rem; opacity: 0.7; font-size: 0.875rem; border-top: 1px solid rgba(0, 0, 0, 0.1);">

**Authors:** Martijn Heeren, Hendrik De Coster, Thor De Roeck

</div>
