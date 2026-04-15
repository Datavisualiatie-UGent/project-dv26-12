import * as Plot from "npm:@observablehq/plot";

// Added categoryKey as the third parameter. 
// I gave it a default value of "AgeGroup" so your old code won't instantly break!
export function StackedSentimentPlot(data, width, categoryKey = "AgeGroup") {
  
  const sentimentOrder = [
    "Very favorable", 
    "Favorable", 
    "Indifferent", 
    "Unsure", 
    "Unfavorable", 
    "Very unfavorable"
  ];

  // 1. DYNAMIC KEY: Use bracket notation to assign the correct property
  const tidyData = data.flatMap(d => 
    sentimentOrder.map(sentiment => ({
      // We wrap [categoryKey] in brackets to create a dynamic object key
      [categoryKey]: d[categoryKey], 
      sentiment: sentiment,
      value: Number(d[sentiment])
    }))
  );

  const colorRange = [
    "#1a9850", 
    "#91cf60", 
    "#e0e0e0", 
    "#f6e8c3", 
    "#fc8d59", 
    "#d73027"  
  ];

  return Plot.plot({
    width,
    height: 400,
    marginLeft: 130, 
    
    style: {
      display: "block",
      maxHeight: "400px"
    },

    x: {
      label: "Percentage (%)",
      domain: [0, 100]
    },
    
    // 2. DYNAMIC DOMAIN: Map over the specific column passed in
    y: {
      label: null,
      domain: data.map(d => d[categoryKey]) 
    },
    
    color: {
      domain: sentimentOrder,
      range: colorRange,
      legend: true
    },
    
    marks: [
      Plot.barX(tidyData, {
        x: "value",
        // 3. DYNAMIC Y-AXIS: Tell Plot which column to use for the Y axis
        y: categoryKey,
        fill: "sentiment",
        insetLeft: 1, 
        insetRight: 1,
        tip: true 
      })
    ]
  });
}