import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { solve, lotkaVolterra } from './_de-math.js';

const [a, b, c0, d] = [1, 0.1, 1.5, 0.075];
const state = { x0: 30, y0: 10, t: 4 };
const rows = (s) => solve(lotkaVolterra(a, b, c0, d), [s.x0, s.y0], 0, 30, 3000);
const peaks = (data, col) => {
  const out = [];
  for (let i = 1; i < data.length - 1; i++) if (data[i][col] > data[i - 1][col] && data[i][col] >= data[i + 1][col]) out.push(data[i][0]);
  return out;
};
const stats = (s) => {
  const R = rows(s);
  const px = peaks(R, 1);
  const py = peaks(R, 2);
  const x1 = px[0];
  const y1 = py.find((t) => t > (x1 ?? 0));
  return { x1, y1, lag: x1 != null && y1 != null ? y1 - x1 : null, period: px.length > 1 ? px[1] - px[0] : null };
};

createTool({
  state,
  label: 'The prey and predator populations drawn against time. The prey curve in blue peaks first and the predator curve in coral peaks a little later, about a quarter of a cycle behind. Predators only increase while there is plenty of prey, so their peak comes after the prey have already begun to fall.',
  setup: (stage, c) => createPlot(stage, { x: [0, 30], y: [0, 80], c, pad: 30 }),
  draw(ctx, stage, c, plot) {
    const R = rows(state);
    const top = Math.max(...R.map((r) => Math.max(r[1], r[2]))) * 1.1;
    plot.setRange([0, 30], [0, top]);
    plot.axes({ xLabel: 'time', yLabel: 'population' });
    for (let k = 1; k < R.length; k += 1) {
      plot.segment(R[k - 1][0], R[k - 1][1], R[k][0], R[k][1], { color: c.b, width: 3 });
      plot.segment(R[k - 1][0], R[k - 1][2], R[k][0], R[k][2], { color: c.a, width: 3 });
    }
    const st = stats(state);
    if (st.x1 != null) plot.segment(st.x1, 0, st.x1, top, { color: c.b, width: 2, dash: [5, 4] });
    if (st.y1 != null) plot.segment(st.y1, 0, st.y1, top, { color: c.a, width: 2, dash: [5, 4] });
    const i = Math.round(state.t * 100);
    plot.point(R[i][0], R[i][1], { fill: c.b, r: 7 });
    plot.point(R[i][0], R[i][2], { fill: c.a, r: 7 });
  },
  controls: [
    { title: 'Start the populations' },
    { key: 'x0', label: 'Prey at the start', min: 10, max: 60, step: 1 },
    { key: 'y0', label: 'Predators at the start', min: 3, max: 30, step: 1 },
    { key: 't', label: 'Time marker', min: 0, max: 30, step: 0.1, format: (v) => fixed(v, 1) },
    { readout: [
      ['Prey peak', (s) => { const t = stats(s).x1; return t == null ? '—' : fixed(t, 2); }],
      ['Predator peak', (s) => { const t = stats(s).y1; return t == null ? '—' : fixed(t, 2); }],
      ['Predators lag by', (s) => { const l = stats(s).lag; return l == null ? '—' : { text: fixed(l, 2), good: true }; }],
      ['Fraction of a cycle', (s) => { const v = stats(s); return v.lag != null && v.period ? fixed(v.lag / v.period, 2) : '—'; }],
    ] },
  ],
  tex: (s) => String.raw`\text{prey}\ (${s.x0})\ \text{peaks first, predators follow}`,
});
