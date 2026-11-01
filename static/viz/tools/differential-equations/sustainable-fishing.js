import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { solve, harvest, harvestRoots } from './_de-math.js';

// Made-up fishery: r = 0.5 per year, carrying capacity K = 1000 (in thousand tonnes).
const R = 0.5;
const K = 1000;
const state = { view: 'phase', H: 80, P0: 800 };
const g = (p) => R * p * (1 - p / K);
const limit = () => (R * K) / 4;
function run(s) {
  const rows = solve(harvest(R, K, s.H), [s.P0], 0, 60, 600);
  const out = [];
  for (const [t, p] of rows) {
    if (p <= 0) { out.push([t, 0]); break; }
    out.push([t, p]);
  }
  return out;
}
const fate = (s) => {
  const roots = harvestRoots(R, K, s.H);
  if (!roots.length || s.P0 < roots[0]) return { text: 'collapse', good: false };
  return { text: `settles near ${fixed(roots[1], 0)}`, good: true };
};

createTool({
  state,
  label: 'A fish population with a constant yearly catch H. In the phase view the natural growth curve is drawn with the catch as a horizontal line. Where they cross the population is steady. If the catch is above the top of the growth curve they never cross and the stock collapses. The time view shows the population year by year.',
  setup: (stage, c) => createPlot(stage, { x: [0, 1000], y: [-50, 150], c, pad: 30 }),
  draw(ctx, stage, c, plot) {
    if (state.view === 'phase') {
      plot.setRange([0, K], [-60, 150]);
      plot.axes({ xLabel: 'P', yLabel: 'rate' });
      plot.segment(0, limit(), K, limit(), { color: c.c, width: 2, dash: [6, 5] });
      plot.text('highest sustainable catch', 500, limit() + 12, { size: 10, color: c.c, patch: false });
      plot.fn(g, { color: c.b, width: 4 });
      plot.segment(0, state.H, K, state.H, { color: c.a, width: 4 });
      for (const r of harvestRoots(R, K, state.H)) plot.point(r, state.H, { fill: c.fillY, r: 8 });
    } else {
      plot.setRange([0, 60], [0, K * 1.1]);
      plot.axes({ xLabel: 'years', yLabel: 'P' });
      const rows = run(state);
      for (let k = 1; k < rows.length; k++) plot.segment(...rows[k - 1], ...rows[k], { color: c.a, width: 4 });
      plot.point(0, state.P0, { fill: c.fillY, r: 8 });
    }
  },
  controls: [
    { title: 'Set the catch' },
    { key: 'view', label: 'Show', options: [['phase', 'Rate curves'], ['time', 'Over time']] },
    { key: 'H', label: 'Catch per year, H', min: 0, max: 200, step: 5 },
    { key: 'P0', label: 'Starting stock', min: 50, max: 1000, step: 50 },
    { readout: [
      ['Highest safe catch, rK/4', () => `${limit()}`],
      ['Steady stocks', (s) => { const r = harvestRoots(R, K, s.H); return r.length ? r.map((v) => fixed(v, 0)).join(' and ') : 'none'; }],
      ['Outcome', (s) => fate(s)],
    ] },
  ],
  tex: (s) => String.raw`\dfrac{dP}{dt}=rP\left(1-\dfrac PK\right)-H,\quad H_{\max}=\dfrac{rK}{4}=${limit()}`,
});
