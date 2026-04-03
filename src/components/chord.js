import * as d3 from "npm:d3";

/**
 * Build adjacency matrix (directed, raw values preserved)
 */
export function buildMatrix(data) {
  const names = Array.from(
    new Set(data.flatMap(d => [d.worked, d.want]))
  );

  const index = new Map(names.map((n, i) => [n, i]));

  const matrix = Array.from({ length: names.length }, () =>
    Array(names.length).fill(0)
  );

  for (const d of data) {
    const i = index.get(d.worked);
    const j = index.get(d.want);
    matrix[i][j] += d.value;
  }

  return { matrix, names };
}

/**
 * Optional: normalize outgoing flows per node (keeps percentages meaningful)
 */
function normalizeRows(matrix) {
  for (let i = 0; i < matrix.length; i++) {
    const sum = d3.sum(matrix[i]);
    if (sum > 0) {
      for (let j = 0; j < matrix.length; j++) {
        matrix[i][j] /= sum;
      }
    }
  }
}

/**
 * Main chord diagram
 */
export function buildChordGraph(data, width = 700) {
  const height = width;
  const outerRadius = width / 2 - 60;
  const innerRadius = outerRadius - 18;

  const { matrix, names } = buildMatrix(data);

  // OPTIONAL (uncomment if you want per-source percentages)
  // normalizeRows(matrix);

  const svg = d3.create("svg")
    .attr("viewBox", [-width / 2, -height / 2, width, height])
    .attr("width", width)
    .attr("height", height)
    .attr("style", "max-width: 100%; height: auto; display: block; margin: auto; font-family: sans-serif;");

  // More stable ordering for readability
  const chord = d3.chordDirected()
    .padAngle(0.03)
    .sortSubgroups(d3.descending)
    .sortChords(d3.descending);

  const chords = chord(matrix);

  const arc = d3.arc()
    .innerRadius(innerRadius)
    .outerRadius(outerRadius);

  const ribbon = d3.ribbonArrow()
    .radius(innerRadius)
    .padAngle(1 / innerRadius);

  // Vibrant stable palette (better than rainbow)
  const color = d3.scaleOrdinal()
    .domain(names)
    .range(d3.schemeTableau10.concat(d3.schemeSet3));

  // =========================
  // GROUPS (outer arcs)
  // =========================
  const group = svg.append("g")
    .selectAll("g")
    .data(chords.groups)
    .join("g");

  group.append("path")
    .attr("d", arc)
    .attr("fill", d => color(names[d.index]))
    .attr("stroke", "#111")
    .attr("stroke-width", 1.2);

  // Cleaner labels (only outer side, no clutter)
  group.append("text")
    .each(d => {
      d.angle = (d.startAngle + d.endAngle) / 2;
    })
    .attr("dy", "0.35em")
    .attr("transform", d => `
      rotate(${(d.angle * 180 / Math.PI - 90)})
      translate(${outerRadius + 12})
      ${d.angle > Math.PI ? "rotate(180)" : ""}
    `)
    .attr("text-anchor", d => d.angle > Math.PI ? "end" : "start")
    .style("font-size", "11px")
    .style("fill", "#ffffff")
    .text(d => names[d.index]);

  // Group totals (incoming + outgoing)
  group.append("title")
    .text(d => {
      const total =
        d3.sum(matrix[d.index]) +
        d3.sum(matrix.map(row => row[d.index]));

      return `${names[d.index]}\nTotal flow: ${(total * 100).toFixed(2)}%`;
    });

  // =========================
  // RIBBONS (flows)
  // =========================
  const ribbons = svg.append("g")
    .attr("fill-opacity", 0.75)
    .selectAll("path")
    .data(chords)
    .join("path")
    .attr("d", ribbon)
    .attr("fill", d => color(names[d.source.index]))
    .attr("stroke", "#111")
    .attr("stroke-width", 0.5);

  // =========================
  // TOOLTIP (bidirectional truth)
  // =========================
  ribbons.append("title")
    .text(d => {
      const s = names[d.source.index];
      const t = names[d.target.index];

      const forward = d.source.value;
      const reverse = matrix[d.target.index][d.source.index];

      const net = forward - reverse;

      return (
` ${s} ↔ ${t}
 ${s} → ${t}: ${(forward * 100).toFixed(2)}%
 ${t} → ${s}: ${(reverse * 100).toFixed(2)}%
 Net: ${(net * 100).toFixed(2)}%`
      );
    });

  // =========================
  // INTERACTION (clean hover)
  // =========================
  ribbons
    .on("mouseover", (_, d) => {
      ribbons.attr("opacity", r =>
        (r.source.index === d.source.index ||
         r.target.index === d.target.index) ? 1 : 0.08
      );

      group.attr("opacity", g =>
        g.index === d.source.index || g.index === d.target.index ? 1 : 0.2
      );
    })
    .on("mouseout", () => {
      ribbons.attr("opacity", 0.75);
      group.attr("opacity", 1);
    });

  return svg.node();
}