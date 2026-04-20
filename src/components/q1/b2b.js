import * as Plot from "npm:@observablehq/plot";

export function DivergingSentimentPlot(data, width, categoryKey = "AgeGroup") {
  
  // 1. DATA TRANSFORMATION: Combine the values and create the negative side
  const divergingData = data.flatMap(d => {
    // Sum the positives
    const favorableSum = Number(d["Very favorable"]) + Number(d["Favorable"]);
    // Sum the negatives
    const unfavorableSum = Number(d["Very unfavorable"]) + Number(d["Unfavorable"]);
    
    return [
      {
        [categoryKey]: d[categoryKey],
        sentiment: "Favorable",
        value: favorableSum
      },
      {
        [categoryKey]: d[categoryKey],
        sentiment: "Unfavorable",
        value: -unfavorableSum 
      }
    ];
  });

  return Plot.plot({
    width: width || 800,
    height: 400,
    marginLeft: 130, 

    style: {
      display: "block",
      maxHeight: "400px"
    },
    
    x: {
      label: "Percentage (%)",
      // 👇 ADD THIS LINE: Locks the scale from -100 (left) to 100 (right)
      domain: [-50, 100], 
      
      tickFormat: Math.abs,
      grid: true 
    },
    
    y: {
      label: null,
      domain: data.map(d => d[categoryKey])
    },
    
    color: {
      domain: ["Favorable", "Unfavorable"],
      // Green for Favorable, Red for Unfavorable
      range: ["#28a05c", "#e63c33"], 
      legend: true
    },
    
    marks: [
      // 3. Draw a bold vertical line exactly at 0 to separate the two sides
      Plot.ruleX([0], { strokeWidth: 2 }),
      
      Plot.barX(divergingData, {
        x: "value",
        y: categoryKey,
        fill: "sentiment",
        insetTop: 2,     // Adds a tiny gap between rows for readability
        insetBottom: 2,
        
        // 4. Custom tooltips so the user doesn't see a negative number when hovering
        channels: { 
          Percentage: { value: d => Math.abs(d.value).toFixed(1) + "%" } 
        },
        tip: {
          format: {
            x: false, // Hide the default negative x value
            Percentage: true
          }
        }
      })
    ]
  });
}

export function DivergingStackedSentimentPlot(data, width, categoryKey = "AgeGroup") {
  
  // 1. Define the exact order of colors (from the far left negative to far right positive)
  const sentimentOrder = [
    "Unfavorable",       // Stacks from 0 outwards to the left
    "Very unfavorable",  // Stacks onto the end of Unfavorable (far left)
    "Favorable",         // Stacks from 0 outwards to the right
    "Very favorable"     // Stacks onto the end of Favorable (far right)
  ];

  // 2. DATA TRANSFORMATION: Keep all 4 categories separate
// 2. DATA TRANSFORMATION: Calculate the combined totals and attach them!
  const divergingData = data.flatMap(d => {
    // Pre-calculate the cumulative totals for this specific row
    const favTotal = Number(d["Very favorable"]) + Number(d["Favorable"]);
    const unfavTotal = Number(d["Very unfavorable"]) + Number(d["Unfavorable"]);

    return [
      {
        [categoryKey]: d[categoryKey],
        sentiment: "Very favorable",
        value: Number(d["Very favorable"]), 
        combined: favTotal // Attach the positive total
      },
      {
        [categoryKey]: d[categoryKey],
        sentiment: "Favorable",
        value: Number(d["Favorable"]), 
        combined: favTotal // Attach the positive total
      },
      {
        [categoryKey]: d[categoryKey],
        sentiment: "Unfavorable",
        value: -Number(d["Unfavorable"]), 
        combined: unfavTotal // Attach the negative total
      },
      {
        [categoryKey]: d[categoryKey],
        sentiment: "Very unfavorable",
        value: -Number(d["Very unfavorable"]), 
        combined: unfavTotal // Attach the negative total
      }
    ]
  });

  // 3. Match the colors to our sentimentOrder array
  const colorRange = [
    "#fc8d59", // Unfavorable (Light red)
    "#d73027", // Very unfavorable (Dark red)
    "#91cf60", // Favorable (Light green)
    "#1a9850"  // Very favorable (Dark green)
  ];

  return Plot.plot({
    width: width || 800,
    height: 400,
    marginLeft: 130, 

    style: {
      display: "block",
      maxHeight: "400px"
    },
    
    x: {
      label: "Percentage (%)",
      domain: [-50, 100],
      tickFormat: Math.abs,
      grid: true 
    },
    
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
      Plot.ruleX([0], { strokeWidth: 2 }),
      
      Plot.barX(divergingData, {
        x: "value",
        y: categoryKey,
        fill: "sentiment",
        order: sentimentOrder, 
        insetTop: 2,     
        insetBottom: 2,
        
        // ADD YOUR NEW CHANNEL HERE 👇
        channels: { 
          Percentage: { value: d => Math.abs(d.value).toFixed(1) + "%" },
          "Side Total": { value: d => d.combined.toFixed(1) + "%" }
        },
        
        tip: {
          format: {
            x: false, 
            Percentage: true,
            "Side Total": true // Enable the new channel in the hover!
          }
        }
      })
    ]
  });
}

export function PolarizedDivergingPlot(data, width, categoryKey = "AgeGroup") {
  
  // 1. Only two categories now!
  const sentimentOrder = [
    "Unfavorable (Rescaled %)", 
    "Favorable (Rescaled %)"     
  ];

  // 2. DATA TRANSFORMATION: Map the exact column names from our Python script
  const divergingData = data.flatMap(d => [
    {
      [categoryKey]: d[categoryKey],
      sentiment: "Favorable (Rescaled %)",
      value: Number(d["Favorable (Rescaled %)"]) // Draws to the right
    },
    {
      [categoryKey]: d[categoryKey],
      sentiment: "Unfavorable (Rescaled %)",
      value: -Number(d["Unfavorable (Rescaled %)"]) // Draws to the left
    }
  ]);

  // 3. Match the colors (Using the custom mixed colors we created earlier!)
  const colorRange = [
    "#ea5f40", // Unfavorable Mix (Red)
    "#56b458"  // Favorable Mix (Green)
  ];

  return Plot.plot({
    width: width || 800,
    height: 400,
    marginLeft: 130, 

    style: {
      display: "block",
      maxHeight: "400px"
    },
    
    x: {
      label: "Percentage (%)",
      domain: [-50, 100], // Perfect -100 to 100 balance
      tickFormat: Math.abs, 
      grid: true 
    },
    
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
      Plot.ruleX([0], { strokeWidth: 2 }),
      
      Plot.barX(divergingData, {
        x: "value",
        y: categoryKey,
        fill: "sentiment",
        order: sentimentOrder, 
        insetTop: 2,     
        insetBottom: 2,
        
        // Much simpler tooltip: just show the clean absolute percentage!
        channels: { 
          Percentage: { value: d => Math.abs(d.value).toFixed(1) + "%" }
        },
        
        tip: {
          format: {
            x: false, 
            Percentage: true
          }
        }
      })
    ]
  });
}

export function RescaledDivergingPlot(data, width, categoryKey = "AgeGroup") {
  
  // 1. Define the stack order (closest to zero line outwards)
  // We use the exact column names generated by your Python script!
  const sentimentOrder = [
    "Unfavorable (Rescaled %)",       
    "Very unfavorable (Rescaled %)",  
    "Favorable (Rescaled %)",         
    "Very favorable (Rescaled %)"     
  ];

  // 2. DATA TRANSFORMATION: Make the unfavorable categories negative
  const divergingData = data.flatMap(d => [
    {
      [categoryKey]: d[categoryKey],
      sentiment: "Very favorable (Rescaled %)",
      value: Number(d["Very favorable (Rescaled %)"]) 
    },
    {
      [categoryKey]: d[categoryKey],
      sentiment: "Favorable (Rescaled %)",
      value: Number(d["Favorable (Rescaled %)"]) 
    },
    {
      [categoryKey]: d[categoryKey],
      sentiment: "Unfavorable (Rescaled %)",
      value: -Number(d["Unfavorable (Rescaled %)"]) // Negative (Left side)
    },
    {
      [categoryKey]: d[categoryKey],
      sentiment: "Very unfavorable (Rescaled %)",
      value: -Number(d["Very unfavorable (Rescaled %)"]) // Negative (Far left)
    }
  ]);

  // 3. Match the colors to our sentimentOrder array
  const colorRange = [
    "#fc8d59", // Unfavorable (Light red)
    "#d73027", // Very unfavorable (Dark red)
    "#91cf60", // Favorable (Light green)
    "#1a9850"  // Very favorable (Dark green)
  ];

  return Plot.plot({
    width: width || 800,
    height: 400,
    marginLeft: 130, 

    style: {
      display: "block",
      maxHeight: "400px"
    },
    
    x: {
      label: "Percentage (%)",
      domain: [-50, 100], // Keeps the zero-line perfectly centered
      tickFormat: Math.abs, // Hides the negative signs on the axis
      grid: true 
    },
    
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
      Plot.ruleX([0], { strokeWidth: 2 }),
      
      Plot.barX(divergingData, {
        x: "value",
        y: categoryKey,
        fill: "sentiment",
        order: sentimentOrder, 
        insetTop: 2,     
        insetBottom: 2,
        
        // Clean up the tooltip to show absolute percentages
        channels: { 
          Percentage: { value: d => Math.abs(d.value).toFixed(1) + "%" }
        },
        
        tip: {
          format: {
            x: false, 
            Percentage: true
          }
        }
      })
    ]
  });
}