import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';

// Charges on the x axis, k = 1. V(x) along the axis, and E_x = −dV/dx.
const SETS = {
  single: [[0, 1]],
  dipole: [[-2, 1], [2, -1]],
  pair: [[-2, 1], [2, 1]],
};
const state = { set: 'dipole', x: 0.5, show: true };
const V = (s, x) => SETS[s.set].reduce((p, [cx, q]) => p + q / Math.abs(x - cx), 0);
const Ex = (s, x) => SETS[s.set].reduce((p, [cx, q]) => p + (q * (x - cx)) / Math.abs(x - cx) ** 3, 0);
const slope = (s, x) => (V(s, x + 1e-4) - V(s, x - 1e-4)) / 2e-4;
const fine = (s) => SETS[s.set].every(([cx]) => Math.abs(state.x - cx) > 0.3);

createTool({
  state,
  label: 'The potential along a line through some charges, drawn as a landscape. A ball sits at the chosen point with a short tangent line showing the slope. The field is minus the slope, so a positive charge is pushed downhill. The slope found from the graph matches the field from Coulomb sums.',
  setup: (stage, c) => createPlot(stage, { c, x: [-5, 5], y: [-3, 3] }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'x', yLabel: 'V' });
    plot.fn((x) => V(state, x), { color: c.b });
    for (const [cx, q] of SETS[state.set]) plot.point(cx, 0, { fill: q > 0 ? c.a : c.b, r: 6 });
    if (!fine(state)) return;
    const [y0, m] = [V(state, state.x), slope(state, state.x)];
    plot.segment(state.x - 1, y0 - m, state.x + 1, y0 + m, { color: c.ink, width: 2 });
    plot.point(state.x, y0, { fill: c.c, r: 8 });
    if (state.show) {
      const [bx, by] = plot.toPx(state.x, y0);
      const [ax, ay] = plot.toPx(state.x - Math.sign(m) * Math.min(1.5, Math.abs(m) * 0.5 + 0.3), y0 - Math.sign(m) * 0);
      void bx; void by; void ax; void ay;
      plot.segment(state.x, -2.6, state.x - Math.sign(m) * Math.min(1.5, Math.abs(m) * 0.5), -2.6, { color: c.a, width: 5 });
      plot.text('push on a + charge', state.x, -2.2, { size: 11, patch: false });
    }
  },
  controls: [
    { title: 'Roll a charge' },
    { key: 'set', label: 'Charges', options: [['single', 'One +'], ['dipole', '+ and −'], ['pair', '+ and +']] },
    { key: 'x', label: 'Position x', min: -4.5, max: 4.5, step: 0.25, format: (v) => v.toFixed(2) },
    { key: 'show', label: 'Show the push', toggle: true },
    { readout: [
      ['V', (s) => (fine(s) ? V(s, s.x).toFixed(3) : 'too close')],
      ['Slope dV/dx', (s) => (fine(s) ? slope(s, s.x).toFixed(3) : '—')],
      ['E from Coulomb', (s) => (fine(s) ? Ex(s, s.x).toFixed(3) : '—')],
      ['−dV/dx', (s) => (fine(s) ? (-slope(s, s.x)).toFixed(3) : '—')],
    ] },
  ],
  tex: (s) => (fine(s) ? `E_x=-\\dfrac{dV}{dx}=-(${slope(s, s.x).toFixed(3)})=${(-slope(s, s.x)).toFixed(3)}` : 'E=-\\dfrac{dV}{dx}'),
});
