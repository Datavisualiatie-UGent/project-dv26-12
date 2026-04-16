import * as Plot from "npm:@observablehq/plot";

// 1. Added categoryKey parameter (defaulting to "AgeGroup")
export function WaffleChart(data, width, categoryKey = "AgeGroup") {
    console.log("DataLLL", data);
    
  const sentimentOrder = [
    "Very favorable", 
    "Favorable", 
    "Indifferent", 
    "Unsure", 
    "Unfavorable", 
    "Very unfavorable"
  ];

  const waffleData = data.flatMap(d => {
    let blocks = [];
    let currentIdx = 0;
    
    let cumulativeTarget = 0;
    let cumulativeActual = 0;
    
    for (const sentiment of sentimentOrder) {
      cumulativeTarget += Number(d[sentiment]);
      const targetBlocks = Math.round(cumulativeTarget) - cumulativeActual;
      
      for (let i = 0; i < targetBlocks; i++) {
        blocks.push({
          // 2. DYNAMIC KEY: Use bracket notation to assign the right column
          [categoryKey]: d[categoryKey], 
          sentiment: sentiment,
          x: currentIdx % 10,
          y: Math.floor(currentIdx / 10)
        });
        currentIdx++;
      }
      cumulativeActual += targetBlocks;
    }
    return blocks;
  });

  const colorRange = [
    "#1a9850", "#91cf60", "#e0e0e0", "#f6e8c3", "#fc8d59", "#d73027"  
  ];

  // --- KEEP YOUR waffleData and colorRange CODE ABOVE THIS EXACTLY THE SAME ---

  // 1. Figure out how many unique categories we are drawing (e.g., 7 Age Groups)
  const numCategories = new Set(data.map(d => d[categoryKey])).size;
  
  // 2. Calculate the perfect height to make squares! 
  // (Total width / number of charts) + 40px of extra room for the labels on top
  const perfectHeight = (width / numCategories) + 40;

  return Plot.plot({
    width: width || 800,
    
    // 3. Swap the hardcoded 250 for our mathematically perfect height
    height: perfectHeight,         
    
    padding: 0.05,       
    
    x: { axis: null },
    y: { axis: null },
    
    fx: {
      domain: data.map(d => d[categoryKey]),
      label: null,
      tickFormat: d => d 
    },
    
    color: {
      domain: sentimentOrder,
      range: colorRange,
      legend: true
    },
    
    marks: [
      Plot.cell(waffleData, {
        x: "x",
        y: "y",
        fx: categoryKey, 
        fill: "sentiment",
        inset: 1,       
        tip: true       
      })
    ]
  });
}