import { createTool } from '../../lib/tool.js';
import { dot, line, label } from '../../lib/draw.js';
import { pairEnergy } from './_potential.js';

// Three charges in µC. Distances in cm. U = sum over pairs of 0.9 q_i q_j / r (joules).
const state = { q1: 2, q2: -2, q3: 2, a: 10, shape: 'tri', order: 0 };
const ORDERS = [[0, 1, 2], [2, 1, 0], [1, 0, 2]];
const pos = (s) => (s.shape === 'tri' ? [[0, 0], [s.a, 0], [s.a / 2, (s.a * Math.sqrt(3)) / 2]] : [[0, 0], [s.a, 0], [2 * s.a, 0]]);
const q = (s) => [s.q1, s.q2, s.q3];
const dist = (s, i, j) => Math.hypot(pos(s)[i][0] - pos(s)[j][0], pos(s)[i][1] - pos(s)[j][1]);
const pairs = (s) => [[0, 1], [0, 2], [1, 2]].map(([i, j]) => ({ i, j, u: pairEnergy(q(s)[i], q(s)[j], dist(s, i, j)) }));
const total = (s) => pairs(s).reduce((p, t) => p + t.u, 0);
// work to bring charges in one at a time in the chosen order
const steps = (s) => { const o = ORDERS[s.order]; return o.map((k, n) => o.slice(0, n).reduce((p, m) => p + pairEnergy(q(s)[k], q(s)[m], dist(s, k, m)), 0)); };

createTool({
  state,
  label: 'Three charges at the corners of a triangle or along a line, with a line drawn between each pair and the energy of that pair written on it. The total energy is the sum of the three pair energies. The readouts show the same total built up by bringing the charges in one by one in different orders.',
  draw(ctx, stage, c) {
    const [W, H] = [stage.w, stage.h];
    const P = pos(state);
    const ext = state.shape === 'tri' ? state.a : 2 * state.a;
    const s = Math.min(W * 0.7 / ext, (H * 0.6) / (state.shape === 'tri' ? state.a * 0.87 : 1));
    const px = ([x, y]) => [W * 0.15 + x * s, H * 0.7 - y * s];
    pairs(state).forEach((t) => {
      const [a, b] = [px(P[t.i]), px(P[t.j])];
      line(ctx, ...a, ...b, { color: c.grid, width: 2 });
      label(ctx, `${t.u.toFixed(2)} J`, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2 - (t.i === 0 && t.j === 2 ? 10 : -12), c, { size: 11, bounds: stage, patch: false });
    });
    P.forEach((p, i) => { const [x, y] = px(p); dot(ctx, x, y, 14, q(state)[i] >= 0 ? c.a : c.b, c.ink); label(ctx, `${q(state)[i] > 0 ? '+' : ''}${q(state)[i]}`, x, y, c, { size: 11, patch: false }); });
    label(ctx, `U = ${total(state).toFixed(2)} J`, W * 0.5, H * 0.08, c, { size: 14, bounds: stage, patch: false });
  },
  controls: [
    { title: 'Assemble three charges' },
    { key: 'shape', label: 'Arrangement', options: [['tri', 'Triangle'], ['line', 'Line']] },
    { key: 'a', label: 'Spacing a (cm)', min: 5, max: 20, step: 5 },
    { key: 'q1', label: 'Charge 1 (µC)', min: -4, max: 4, step: 1 },
    { key: 'q2', label: 'Charge 2 (µC)', min: -4, max: 4, step: 1 },
    { key: 'q3', label: 'Charge 3 (µC)', min: -4, max: 4, step: 1 },
    { key: 'order', label: 'Bring them in order', options: [[0, '1,2,3'], [1, '3,2,1'], [2, '2,1,3']] },
    { readout: [
      ['Work for 1st, 2nd, 3rd', (s) => steps(s).map((w) => w.toFixed(2)).join(', ') + ' J'],
      ['Sum of the three', (s) => `${steps(s).reduce((p, w) => p + w, 0).toFixed(2)} J`],
      ['Pairs total U', (s) => `${total(s).toFixed(2)} J`],
    ] },
  ],
  tex: (s) => `U=k\\sum_{i<j}\\dfrac{q_iq_j}{r_{ij}}=${pairs(s).map((t) => t.u.toFixed(2)).join('+')}=${total(s).toFixed(2)}\\ \\mathrm{J}`,
});
