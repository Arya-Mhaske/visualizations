import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { cap, pF } from './_cap.js';

const state = { Q: 6, A: 100, d: 1 };
const C = (s) => cap(s.A, s.d);
const V = (s, Q = s.Q) => (Q * 1e-9) / C(s);

createTool({
  state,
  label: 'The voltage across a capacitor against the charge on it. It is a straight line through the origin, so doubling the charge doubles the voltage. The slope depends only on the plate area and the gap. A faint line shows a different geometry with a different slope.',
  setup: (stage, c) => createPlot(stage, { c, x: [0, 20], y: [0, 1200] }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'Q (nC)', yLabel: 'V (V)' });
    plot.fn((Q) => (Q * 1e-9) / cap(100, 1), { color: c.grid, width: 2, dash: [6, 5] });
    plot.fn((Q) => V(state, Q), { color: c.a });
    plot.segment(state.Q, 0, state.Q, V(state), { width: 2, dash: [4, 4] });
    plot.segment(0, V(state), state.Q, V(state), { width: 2, dash: [4, 4] });
    plot.point(state.Q, V(state), { fill: c.a });
    plot.point(2 * state.Q > 20 ? state.Q / 2 : 2 * state.Q, V(state, 2 * state.Q > 20 ? state.Q / 2 : 2 * state.Q), { fill: c.b, r: 5 });
  },
  controls: [
    { title: 'Charge a capacitor' },
    { key: 'Q', label: 'Charge Q (nC)', min: 1, max: 10, step: 1 },
    { key: 'A', label: 'Plate area A (cm²)', min: 25, max: 200, step: 25 },
    { key: 'd', label: 'Gap d (mm)', min: 0.5, max: 4, step: 0.5, format: (v) => v.toFixed(1) },
    { readout: [
      ['Voltage V', (s) => `${V(s).toFixed(0)} V`],
      ['Q ÷ V', (s) => `${pF(C(s)).toFixed(1)} pF`],
      ['At double Q', (s) => `${V(s, 2 * s.Q).toFixed(0)} V, same Q/V`],
    ] },
  ],
  tex: (s) => `C=\\dfrac{Q}{V}=\\dfrac{${s.Q}\\ \\mathrm{nC}}{${V(s).toFixed(0)}\\ \\mathrm{V}}=${pF(C(s)).toFixed(1)}\\ \\mathrm{pF}`,
});
