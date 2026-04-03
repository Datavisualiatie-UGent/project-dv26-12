import * as d3 from "npm:d3";
import { sankey, sankeyLinkHorizontal, sankeyJustify, sankeyCenter } from "npm:d3-sankey";

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

export function toSankey(data, selected) {
  const nodes = buildNodes(data);
  console.log("Nodes:", nodes);

  const links = buildLinks(data);
  console.log("Links:", links);

  console.log("Selected company", selected);

  selected = selected || "OpenAI"; // default to first node if none selected
  return filterSankeyByNode({nodes, links}, selected);
}

export function buildSankeyGraph(data, width = 800) {
  const height = 500;
  const margin = 10;

  const svg = createSvg(width, height);
  const graph = createLayout(data, width, height, margin);
  const color = d3.scaleOrdinal(d3.schemeTableau10);

  renderLinks(svg, graph.links, color);
  renderNodes(svg, graph.nodes, width);

  return svg.node();
}

function createSvg(width, height) {
  return d3.create("svg")
    .attr("viewBox", [0, 0, width, height])
    .attr("width", width)
    .attr("height", height)
    .attr(
      "style",
      "max-width: 100%; height: auto; font-family: sans-serif; display: block; margin: auto;"
    );
}

function createLayout(data, width, height, margin) {
  const layout = sankey()
    .nodeId(d => d.id)
    .nodeAlign(sankeyCenter)
    .nodeWidth(15)
    .nodePadding(15)
    .extent([[margin, margin], [width - margin, height - margin]]);

  return layout({
    nodes: data.nodes.map(d => ({ ...d })),
    links: data.links.map(d => ({ ...d }))
  });
}

function renderLinks(svg, links, color) {
  const link = svg.append("g")
    .attr("fill", "none")
    .selectAll("path")
    .data(links)
    .join("path")
    .attr("d", sankeyLinkHorizontal())
    .attr("stroke", d => d3.color(color(d.source.id)).copy({ opacity: 0.35 }))
    .attr("stroke-width", d => Math.max(1, d.width))
    .style("mix-blend-mode", "multiply")
    .style("transition", "stroke-opacity 150ms");

  link
    .on("mouseover", (event, d) => {
      svg.selectAll("path")
        .attr("stroke-opacity", l => (l === d ? 0.85 : 0.08));
    })
    .on("mouseout", () => {
      svg.selectAll("path").attr("stroke-opacity", 1);
    });

  link.append("title")
    .text(d => `${d.source.id} → ${d.target.id}\n${formatPct(d.value)}`);
}

function renderNodes(svg, nodes, width) {
  const node = svg.append("g")
    .selectAll("g")
    .data(nodes)
    .join("g");

  node.append("rect")
    .attr("x", d => d.x0)
    .attr("y", d => d.y0)
    .attr("height", d => d.y1 - d.y0)
    .attr("width", d => d.x1 - d.x0)
    .attr("fill", "#4f46e5")
    .append("title")
    .text(d => `${d.id}\nTotal: ${formatPct(d.value)}`);

  node.append("text")
    .attr("x", d => d.x0 < width / 2 ? d.x1 + 8 : d.x0 - 8)
    .attr("y", d => (d.y1 + d.y0) / 2)
    .attr("dy", "0.35em")
    .attr("text-anchor", d => d.x0 < width / 2 ? "start" : "end")
    .text(d => d.id)
    .style("font-size", "12px")
    .style("font-weight", 500)
    .style("fill", "currentColor")
    .style("pointer-events", "none");
}

function formatPct(v) {
  return `${(v * 100).toFixed(2)}%`;
}