import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { DISTS, dist, mean, ex2, variance, spreadAbout, fr } from './_rv.js';

// E[(X − m)²] = E(X²) − 2m E(X) + m². Put m = μ and it collapses to E(X²) − μ². For any other m the answer
// is larger by exactly (m − μ)², so μ is the centre that makes the spread smallest.
const state = { d: 'sum2', m: 3 };

const tool = createTool({
  state,
  label: 'Top: for each value of X a vertical bar of height probability times squared distance from the trial centre. Bottom: a graph of the total spread about a centre m, a parabola whose lowest point sits at the mean, where its height is the variance. A coral dot shows your trial centre.',
  setup: (stage, c) => ({
    top: createPlot(stage, { x: [0, 13], y: [0, 3], c, pad: 24, box: (g) => ({ x: 0, y: 0, w: g.w, h: g.h * 0.48 }) }),
    bottom: createPlot(stage, { x: [0, 13], y: [0, 20], c, pad: 24, box: (g) => ({ x: 0, y: g.h * 0.5, w: g.w, h: g.h * 0.5 }) }),
  }),
  draw(ctx, stage, c, { top, bottom }) {
    const d = dist(state.d);
    const tallest = Math.max(...d.xs.map((x, i) => (x - state.m) ** 2 * d.ps[i]));
    top.setRange([0, 13], [0, Math.max(0.5, tallest * 1.2)]);
    top.axes({ xLabel: 'x', yLabel: '(x − m)² p' });
    d.xs.forEach((x, i) => top.segment(x, 0, x, (x - state.m) ** 2 * d.ps[i], { color: c.a, width: 8 }));
    top.segment(state.m, 0, state.m, Math.max(0.5, tallest * 1.2), { color: c.b, width: 2, dash: [5, 4] });
    const top2 = spreadAbout(d, 0) * 1.05;
    bottom.setRange([0, 13], [0, top2]);
    bottom.axes({ xLabel: 'centre m', yLabel: 'E[(X − m)²]' });
    bottom.fn((m) => spreadAbout(d, m), { color: c.b });
    bottom.point(mean(d), variance(d), { fill: c.c, r: 6 });
    bottom.point(state.m, spreadAbout(d, state.m), { fill: c.a, r: 7 });
  },
  controls: () => [
    { title: 'Measure the spread about a centre' },
    { key: 'd', label: 'Distribution', options: Object.entries(DISTS).map(([k, v]) => [k, v.name]) },
    { key: 'm', label: 'Trial centre m', min: 0, max: 13, step: 0.1, format: (v) => fixed(v, 1) },
    { row: [{ button: 'Centre at the mean', onClick: () => { state.m = Math.round(mean(dist(state.d)) * 10) / 10; tool.update(); } }] },
    { readout: [
      ['E(X) = μ', (s) => fixed(mean(dist(s.d)), 3)],
      ['E(X²)', (s) => fixed(ex2(dist(s.d)), 3)],
      ['E[(X − m)²]', (s) => fixed(spreadAbout(dist(s.d), s.m), 3)],
      ['E(X²) − 2m·μ + m²', (s) => fixed(ex2(dist(s.d)) - 2 * s.m * mean(dist(s.d)) + s.m * s.m, 3)],
      ['Var(X) = E(X²) − μ²', (s) => `${fixed(variance(dist(s.d)), 3)}  (${fr(variance(dist(s.d)))})`],
    ] },
  ],
  tex: (s) => `E[(X-m)^2]=E(X^2)-2m\\mu+m^2\\ \\xrightarrow{m=\\mu}\\ E(X^2)-\\mu^2=${fixed(ex2(dist(s.d)), 3)}-${fixed(mean(dist(s.d)) ** 2, 3)}`,
});

tool.update();
