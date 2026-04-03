import * as d3 from "npm:d3";

/**
 * Build node index
 */
function buildNodes(data) {
  const names = Array.from(
    new Set(data.flatMap(d => [d.worked, d.want]))
  );

  const index = new Map(names.map((n, i) => [n, i]));

  return { names, index };
}

/**
 * Convert to directed links (no matrix needed anymore)
 */
function buildLinks(data, index) {
  return data.map(d => ({
    source: index.get(d.worked),
    target: index.get(d.want),
    value: d.value
  }));
}

/**
 * Preference Migration Diagram (Chord-Sankey hybrid)
 */
export function buildPreferenceMigration(data, width = 700) {
  const height = width;

  const radius = width / 2 - 70;

  const { names, index } = buildNodes(data);
  const links = buildLinks(data, index);

  // Build hierarchy for chord-like grouping
  const nodes = names.map((name, i) => ({
    name,
    index: i
  }));

  const svg = d3.create("svg")
    .attr("viewBox", [-width / 2, -height / 2, width, height])
    .attr("width", width)
    .attr("height", height)
    .attr("style", "max-width:100%; height:auto; display:block; margin:auto; font-family:sans-serif;");

  // =========================
  // LAYOUT (circular sankey)
  // =========================
  const chord = d3.chordDirected()
    .padAngle(0.04)
    .sortSubgroups(d3.descending);

  // convert to adjacency matrix for chord layout only
  const matrix = Array.from({ length: names.length }, () =>
    Array(names.length).fill(0)
  );

  for (const l of links) {
    matrix[l.source][l.target] += l.value;
  }

  const chords = chord(matrix);

  // =========================
  // GEOMETRY
  // =========================
  const arc = d3.arc()
    .innerRadius(radius - 18)
    .outerRadius(radius);

  const ribbon = d3.ribbonArrow()
    .radius(radius - 18)
    .padAngle(1 / radius);

  const color = d3.scaleOrdinal()
    .domain(names)
    .range(d3.schemeTableau10.concat(d3.schemeSet3));

  // =========================
  // GROUPS
  // =========================
  const group = svg.append("g")
    .selectAll("g")
    .data(chords.groups)
    .join("g");

  group.append("path")
    .attr("d", arc)
    .attr("fill", d => color(names[d.index]))
    .attr("stroke", "#111");

  group.append("text")
    .each(d => d.angle = (d.startAngle + d.endAngle) / 2)
    .attr("dy", "0.35em")
    .attr("transform", d => `
      rotate(${(d.angle * 180 / Math.PI - 90)})
      translate(${radius + 14})
      ${d.angle > Math.PI ? "rotate(180)" : ""}
    `)
    .attr("text-anchor", d => d.angle > Math.PI ? "end" : "start")
    .style("font-size", "11px")
    .text(d => names[d.index]);

  // =========================
  // RIBBONS (MIGRATION FLOWS)
  // =========================
  const ribbons = svg.append("g")
    .attr("fill-opacity", 0.75)
    .selectAll("path")
    .data(chords)
    .join("path")
    .attr("d", ribbon)
    .attr("fill", d => color(names[d.source.index]))
    .attr("stroke", "#111");

  // =========================
  // NET FLOW COMPUTATION
  // =========================
  function getReverseValue(a, b) {
    return matrix[b][a];
  }

  // =========================
  // TOOLTIP (migration-aware)
  // =========================
  ribbons.append("title")
    .text(d => {
      const a = names[d.source.index];
      const b = names[d.target.index];

      const forward = d.source.value;
      const reverse = getReverseValue(d.source.index, d.target.index);

      const net = forward - reverse;

      return `
${a} ↔ ${b}

${a} → ${b}: ${(forward * 100).toFixed(2)}%
${b} → ${a}: ${(reverse * 100).toFixed(2)}%

Net migration: ${(net * 100).toFixed(2)}%
Dominant direction: ${net >= 0 ? a + " → " + b : b + " → " + a}
      `;
    });

  // =========================
  // INTERACTION (migration focus)
  // =========================
  ribbons
    .on("mouseover", (_, d) => {
      const a = d.source.index;
      const b = d.target.index;

      ribbons.attr("opacity", r =>
        (r.source.index === a && r.target.index === b) ||
        (r.source.index === b && r.target.index === a)
          ? 1
          : 0.1
      );

      group.attr("opacity", g =>
        g.index === a || g.index === b ? 1 : 0.25
      );
    })
    .on("mouseout", () => {
      ribbons.attr("opacity", 0.75);
      group.attr("opacity", 1);
    });

  return svg.node();
}