import { createTool } from '../../lib/tool.js';
import { arrow, dot, label } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { solve } from './_la-math.js';

// Four nodes, five edges. Edge e goes from node a to node b, so the incidence matrix has −1 at a and +1 at b.
// A battery holds node 0 at V volts and node 3 at 0. Each edge has a resistance. Currents follow Ohm's law, i = (u_a − u_b)/R.
const EDGES = [[0, 1], [0, 2], [1, 2], [1, 3], [2, 3]];
const POS = [[0.12, 0.5], [0.5, 0.18], [0.5, 0.82], [0.88, 0.5]];
const state = { V: 6, r3: 1, r1: 1 };
const R = (s) => [s.r1, 1, s.r3, 1, 1];
function potentials(s) {
  const g = R(s).map((r) => 1 / r);
  const u0 = s.V;
  const u3 = 0;
  // unknowns u1, u2:  node 1: g1(u0−u1) = g3(u1−u2) + g4(u1−u3);  node 2: g2(u0−u2) + g3(u1−u2) = g5(u2−u3)
  const A = [[g[0] + g[2] + g[3], -g[2]], [-g[2], g[1] + g[2] + g[4]]];
  const b = [g[0] * u0 + g[3] * u3, g[1] * u0 + g[4] * u3];
  const [u1, u2] = solve(A, b);
  return [u0, u1, u2, u3];
}
const currents = (s) => { const u = potentials(s); return EDGES.map(([a, b], e) => (u[a] - u[b]) / R(s)[e]); };

createTool({
  state,
  label: 'A small network of four nodes joined by five resistors, with a battery across the left and right nodes. Each node shows its voltage. Each edge shows its current, drawn thicker for a bigger current. The currents flowing into any node equal the currents flowing out. They come from the incidence matrix and the equation A transpose C A u equals f.',
  draw(ctx, stage, c) {
    const u = potentials(state);
    const cur = currents(state);
    const at = (i) => [POS[i][0] * stage.w, POS[i][1] * stage.h];
    EDGES.forEach(([a, b], e) => {
      const [p, q] = [at(a), at(b)];
      const forward = cur[e] >= 0;
      const [from, to] = forward ? [p, q] : [q, p];
      const mid = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
      const k = 0.22;
      arrow(ctx, from[0] + (to[0] - from[0]) * (0.5 - k), from[1] + (to[1] - from[1]) * (0.5 - k), from[0] + (to[0] - from[0]) * (0.5 + k), from[1] + (to[1] - from[1]) * (0.5 + k), { color: c.a, width: 2 + Math.abs(cur[e]) * 2.2, head: 10 });
      ctx.save();
      ctx.strokeStyle = c.grid;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(...p);
      ctx.lineTo(...q);
      ctx.stroke();
      ctx.restore();
      label(ctx, `${fixed(Math.abs(cur[e]), 2)} A`, mid[0] + (a === 0 && b === 1 ? -26 : a === 0 ? -26 : b === 3 ? 26 : 0), mid[1] + (e === 2 ? 0 : a === 0 ? (b === 1 ? -14 : 14) : (b === 3 ? (a === 1 ? -14 : 14) : 0)), c, { size: 11, bounds: stage });
    });
    u.forEach((v, i) => {
      const [x, y] = at(i);
      dot(ctx, x, y, 17, i === 0 ? c.fillA : i === 3 ? c.fillB : c.fillY, c.ink);
      label(ctx, `${fixed(v, 2)}`, x, y, c, { size: 11, patch: false, bounds: stage });
    });
  },
  controls: [
    { title: 'Build the circuit' },
    { key: 'V', label: 'Battery', min: 1, max: 12, step: 1, format: (n) => `${n} V` },
    { key: 'r3', label: 'Resistor between the middle nodes', min: 0.5, max: 8, step: 0.5, format: (n) => `${fixed(n, 1)} Ω` },
    { key: 'r1', label: 'Resistor on the top-left edge', min: 0.5, max: 8, step: 0.5, format: (n) => `${fixed(n, 1)} Ω` },
    { readout: [
      ['Current from the battery', (s) => `${fixed(currents(s)[0] + currents(s)[1], 3)} A`],
      ['Into node 1 − out of node 1', (s) => ({ text: fixed(currents(s)[0] - currents(s)[2] - currents(s)[3], 6), good: true })],
      ['Into node 2 − out of node 2', (s) => ({ text: fixed(currents(s)[1] + currents(s)[2] - currents(s)[4], 6), good: true })],
      ['Voltages u₁, u₂', (s) => `${fixed(potentials(s)[1], 3)}, ${fixed(potentials(s)[2], 3)}`],
    ] },
  ],
  tex: () => 'A^{\\mathsf T}CA\\,\\mathbf u=\\mathbf f,\\qquad \\mathbf i=C A\\mathbf u',
});
