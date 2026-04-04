import * as d3 from "npm:d3";
import * as Plot from "npm:@observablehq/plot";

export function buildDifferenceMatrix(data) {
  const names = Array.from(
    new Set(data.flatMap(d => [d.worked, d.want]))
  );

  const index = new Map(names.map((n, i) => [n, i]));

  // build raw matrix
  const mat = Array.from({ length: names.length }, () =>
    Array(names.length).fill(0)
  );

  for (const d of data) {
    const i = index.get(d.worked);
    const j = index.get(d.want);
    mat[i][j] += d.value;
  }

  // build difference matrix
  const diff = Array.from({ length: names.length }, () =>
    Array(names.length).fill(0)
  );

  for (let i = 0; i < names.length; i++) {
    for (let j = 0; j < names.length; j++) {
      diff[i][j] = mat[i][j] - mat[j][i];
    }
  }

  return { diff, names };
}

function matrixToFlat(diff, names) {
  const out = [];

  for (let i = 0; i < names.length; i++) {
    for (let j = 0; j < names.length; j++) {
      if (i === j) continue;

      out.push({
        worked: names[i],
        want: names[j],
        value: diff[i][j]
      });
    }
  }

  return out;
}

export function DifferenceHeatmap(data, width = 900) {
  const { diff, names } = buildDifferenceMatrix(data);
  const flat = matrixToFlat(diff, names);

  const maxAbs = d3.max(flat, d => Math.abs(d.value));

  return Plot.plot({
    width,
    height: width * 0.6,
    marginLeft: 100,
    marginBottom: 60,

    x: { domain: names },
    y: { domain: names },

    color: {
      type: "diverging",
      scheme: "RdBu",
      domain: [-maxAbs, maxAbs],
      legend: true
    },

    marks: [
      Plot.rect(flat, {
            x: "want",
            y: "worked",
            fill: "value",
            title: d => {
                    const v = d.value * 100;
                    const abs = Math.abs(v);

                    if (v > 0) {
                        return `${d.worked} → ${d.want}
Net flow: +${abs.toFixed(2)}%
People are moving from ${d.worked} → ${d.want}`;
}

if (v < 0) {
    return `${d.worked} → ${d.want}
Net flow: -${abs.toFixed(2)}%
People are moving from ${d.want} → ${d.worked}`;
}

return `${d.worked} → ${d.want}
Balanced flow (0%)`;
                }
            }
        )]
  });
}