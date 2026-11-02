import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';

// Field of a point (1/r²) or a line (1/r), in units where kQ = 1. Potential at r is the area under E from r out to a far limit L.
const state = { r: 1, logL: 1, kind: 'point' };
const L = (s) => 10 ** s.logL;
const E = (s) => (s.kind === 'point' ? (x) => 1 / (x * x) : (x) => 1 / x);
const area = (s) => (s.kind === 'point' ? 1 / s.r - 1 / L(s) : Math.log(L(s) / s.r));

createTool({
  state,
  label: 'The field plotted against distance, with the area under it shaded from the chosen point r out to a far limit. For a point charge the field falls as one over r squared and the area settles to one over r however far out you go. For a line charge the field falls as one over r and the area keeps growing.',
  setup: (stage, c) => createPlot(stage, { c, x: [0, 10], y: [0, 2.5] }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'r', yLabel: 'E' });
    const to = Math.min(10, L(state));
    plot.shade(E(state), null, state.r, to, c.fillA);
    plot.fn(E(state), { color: c.ink, domain: [0.4, 10] });
    plot.point(state.r, E(state)(state.r), { fill: c.a });
    plot.segment(to, 0, to, E(state)(to), { color: c.b, width: 3, dash: [4, 4] });
    plot.text(L(state) > 10 ? 'limit far off to the right →' : `limit ${L(state).toFixed(0)}`, 7, 2.2, { size: 11, patch: false });
  },
  controls: [
    { title: 'Bring a charge in from far away' },
    { key: 'kind', label: 'Field of', options: [['point', 'Point: 1/r²'], ['line', 'Line: 1/r']] },
    { key: 'r', label: 'Where you stop, r', min: 0.5, max: 5, step: 0.5, format: (v) => v.toFixed(1) },
    { key: 'logL', label: 'Start at distance 10^x', min: 0.5, max: 4, step: 0.5, format: (v) => `${(10 ** v).toFixed(0)}` },
    { readout: [
      ['Area (work per unit charge)', (s) => area(s).toFixed(3)],
      ['If started at infinity', (s) => (s.kind === 'point' ? (1 / s.r).toFixed(3) : 'no limit: it keeps growing')],
    ] },
  ],
  tex: (s) => (s.kind === 'point'
    ? `V(r)=\\int_r^{\\infty}\\dfrac{kQ}{x^{2}}\\,dx=\\dfrac{kQ}{r}=${(1 / s.r).toFixed(3)}`
    : `\\int_r^{L}\\dfrac{k\\lambda'}{x}\\,dx=k\\lambda'\\ln\\dfrac{L}{r}=${area(s).toFixed(3)}\\ \\to\\ \\infty`),
});
