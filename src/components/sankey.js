import * as d3 from "npm:d3";
import { sankey, sankeyLinkHorizontal, sankeyJustify } from "npm:d3-sankey";

export function filterSankeyByNode(data, selected = "OpenAI") {
  const links = data.links.filter(
    l => l.source === selected && l.target !== selected
  );

  const nodeSet = new Set();

  for (const l of links) {
    nodeSet.add(l.source);
    nodeSet.add(l.target);
  }

  const nodes = Array.from(nodeSet).map(id => ({ id }));

  return { nodes, links };
}

export function buildNodes(data) {
  const nodeSet = new Set();

  for (const d of data) {
    nodeSet.add(d.worked);
    nodeSet.add(d.want);
  }

  return Array.from(nodeSet).map(id => ({ id }));
}

export function buildLinks(data) {
  return data.map(d => ({
    source: d.worked,
    target: d.worked === d.want ? `${d.want} (Stayed)` : d.want,
    value: d.value
  }));
}

export function toSankey(data) {
  const nodes = buildNodes(data);
  console.log("Nodes:", nodes);
  const links = buildLinks(data);
  console.log("Links:", links);
  data = { nodes, links };

  return filterSankeyByNode(data);
}

export function buildSankeyGraph(data, width = 800) {
  const height = 600;
  const margin = 10;

  const svg = d3.create("svg")
    .attr("viewBox", [0, 0, width, height])
    .attr("width", width)
    .attr("height", height)
    .attr("style", "max-width: 100%; height: auto; font-family: sans-serif;");

  const layout = sankey()
    .nodeId(d => d.id)
    .nodeAlign(sankeyJustify)
    .nodeWidth(15)
    .nodePadding(15)
    .extent([[margin, margin], [width - margin, height - margin]]);

  // D3-Sankey modifies the data in-place, so we pass a deep copy
  const graph = layout({
    nodes: data.nodes.map(d => ({...d})),
    links: data.links.map(d => ({...d}))
  });

  // Render Links
  svg.append("g")
    .attr("fill", "none")
    .attr("stroke-opacity", 0.3)
    .selectAll("path")
    .data(graph.links)
    .join("path")
      .attr("d", sankeyLinkHorizontal())
      .attr("stroke", "#cbd5e1")
      .attr("stroke-width", d => Math.max(1, d.width))
      .on("mouseover", function() { d3.select(this).attr("stroke-opacity", 0.7); }) // Interactivity!
      .on("mouseout", function() { d3.select(this).attr("stroke-opacity", 0.3); })
      .append("title")
      .text(d => `${d.source.id} → ${d.target.id}\n${(d.value * 100).toFixed(2)}%`);

  // Render Nodes
  const node = svg.append("g")
    .selectAll("g")
    .data(graph.nodes)
    .join("g");

  node.append("rect")
    .attr("x", d => d.x0)
    .attr("y", d => d.y0)
    .attr("height", d => d.y1 - d.y0)
    .attr("width", d => d.x1 - d.x0)
    .attr("fill", "#4f46e5")
    .append("title")
    .text(d => `${d.id}\nTotal: ${(d.value * 100).toFixed(2)}%`);

  // Render Labels
  node.append("text")
    .attr("x", d => d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6)
    .attr("y", d => (d.y1 + d.y0) / 2)
    .attr("dy", "0.35em")
    .attr("text-anchor", d => d.x0 < width / 2 ? "start" : "end")
    .attr("fill", "currentColor")
    .text(d => d.id)
    .style("font-size", "12px");

  return svg.node();
}