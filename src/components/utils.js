function normalizeRows(data) {
  const totals = new Map();

  for (const d of data) {
    totals.set(d.worked, (totals.get(d.worked) || 0) + d.value);
  }

  return data.map(d => ({
    ...d,
    value: d.value / totals.get(d.worked)
  }));
}

export function normalizeByWorked(data) {
  const totals = new Map();

  // compute totals per worked model
  for (const d of data) {
    totals.set(d.worked, (totals.get(d.worked) || 0) + d.value);
  }

  // normalize
  return data.map(d => ({
    worked: d.worked,
    want: d.want,
    value: d.value / totals.get(d.worked)
  }));
}