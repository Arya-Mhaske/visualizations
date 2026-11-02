import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';

// Both problems share one shape: split a fixed total between two or three parts to get the best total, subject to a constraint.
// At the best split, the marginal gain of every part is the same number λ (the Lagrange multiplier).
// ROCKET: two stages with exhaust speeds c1, c2 (km/s) and structure fraction ε. Stage i adds Δv_i; the payload fraction left is
//   (e^(−Δv_i/c_i) − ε)/(1 − ε). Constraint: Δv1 + Δv2 = required Δv. Maximise the product.
// TURBINES: made-up power curves P_i(Q) = a_i Q − b_i Q² (MW, Q in m³/s), total flow fixed.
const state = { mode: 'rocket', dv: 9, share: 0.5, c1: 3, c2: 3.5, eps: 0.1, q1: 40, q2: 30 };
export const payload = (dv, c, eps) => (Math.exp(-dv / c) - eps) / (1 - eps);
export const total = (s, share) => payload(s.dv * share, s.c1, s.eps) * payload(s.dv * (1 - share), s.c2, s.eps);
const marg = (s, share) => {
  const h = 1e-5;
  const d = (i, dv, c) => (Math.log(Math.max(payload(dv + h, c, s.eps), 1e-12)) - Math.log(Math.max(payload(dv - h, c, s.eps), 1e-12))) / (2 * h);
  return [d(1, s.dv * share, s.c1), d(2, s.dv * (1 - share), s.c2)];
};
export function bestShare(s) {
  let best = { v: -1, share: 0 };
  for (let i = 1; i < 1000; i++) { const share = i / 1000; const v = total(s, share); if (v > best.v) best = { v, share }; }
  return best;
}
const TURB = [{ a: 3.0, b: 0.020 }, { a: 2.6, b: 0.012 }, { a: 2.2, b: 0.008 }];
const QT = 100;
const power = (i, q) => TURB[i].a * q - TURB[i].b * q * q;
const dpower = (i, q) => TURB[i].a - 2 * TURB[i].b * q;
export function optimalFlows() {
  // dP_i/dQ_i = λ for all i, ΣQ_i = QT: Q_i = (a_i − λ)/(2 b_i)
  const sa = TURB.reduce((s, t) => s + t.a / (2 * t.b), 0);
  const sb = TURB.reduce((s, t) => s + 1 / (2 * t.b), 0);
  const lambda = (sa - QT) / sb;
  return { lambda, q: TURB.map((t) => (t.a - lambda) / (2 * t.b)) };
}
const flows = (s) => [s.q1, s.q2, QT - s.q1 - s.q2];

createTool({
  state,
  label: 'Rocket mode plots the payload fraction against how the required speed change is split between two stages, with the best split marked. Turbine mode shows the power of three turbines for the flow you give each, and how close their marginal powers are.',
  setup: (stage, c) => createPlot(stage, { x: [0, 1], y: [0, 0.08], c }),
  draw(ctx, stage, c, plot) {
    if (state.mode === 'rocket') {
      plot.setRange([0, 1], [0, Math.max(bestShare(state).v * 1.2, 0.001)]);
      plot.axes({ xLabel: 'share of Δv in stage 1', yLabel: 'payload fraction' });
      plot.fn((x) => Math.max(total(state, x), 0), { color: c.a, domain: [0.001, 0.999] });
      plot.point(state.share, total(state, state.share));
      plot.point(bestShare(state).share, bestShare(state).v, { fill: c.fillC });
    } else {
      plot.setRange([0, 100], [0, 120]);
      plot.axes({ xLabel: 'flow Q (m³/s)', yLabel: 'power (MW)' });
      TURB.forEach((_, i) => plot.fn((q) => power(i, q), { color: [c.a, c.b, c.c][i], domain: [0, 100] }));
      flows(state).forEach((q, i) => { if (q >= 0) plot.point(q, power(i, q), { fill: [c.a, c.b, c.c][i] }); });
    }
  },
  controls: [
    { title: 'Split it' },
    { key: 'mode', label: 'Problem', options: [['rocket', 'Rocket stages'], ['turbine', 'Hydro-turbines']] },
    { key: 'dv', label: 'Rocket: required Δv (km/s)', min: 4, max: 12, step: 0.5 },
    { key: 'share', label: 'Rocket: share of Δv in stage 1', min: 0.05, max: 0.95, step: 0.01, format: (v) => `${(v * 100).toFixed(0)}%` },
    { key: 'c1', label: 'Rocket: exhaust speed, stage 1 (km/s)', min: 2.5, max: 4.5, step: 0.1, format: (v) => v.toFixed(1) },
    { key: 'c2', label: 'Rocket: exhaust speed, stage 2 (km/s)', min: 2.5, max: 4.5, step: 0.1, format: (v) => v.toFixed(1) },
    { key: 'q1', label: 'Turbine 1 flow (of 100 m³/s)', min: 0, max: 100, step: 1 },
    { key: 'q2', label: 'Turbine 2 flow', min: 0, max: 100, step: 1 },
    { readout: [
      ['Payload fraction / total power', (s) => (s.mode === 'rocket' ? `${(total(s, s.share) * 100).toFixed(2)} %` : `${flows(s).reduce((t, q, i) => t + (q >= 0 ? power(i, q) : 0), 0).toFixed(1)} MW`)],
      ['Best split', (s) => (s.mode === 'rocket' ? `${(bestShare(s).share * 100).toFixed(1)} % in stage 1` : optimalFlows().q.map((q) => q.toFixed(1)).join(', '))],
      ['Marginal gains (equal at the best)', (s) => (s.mode === 'rocket' ? marg(s, s.share).map((v) => v.toFixed(3)).join(' | ') : flows(s).map((q, i) => dpower(i, q).toFixed(3)).join(' | '))],
      ['Flow to turbine 3', (s) => (s.mode === 'turbine' ? `${flows(s)[2].toFixed(0)} (must be ≥ 0)` : 'n/a')],
    ] },
  ],
  tex: () => '\\nabla f=\\lambda\\nabla g\\ \\Rightarrow\\ \\text{equal marginal gains}',
});
