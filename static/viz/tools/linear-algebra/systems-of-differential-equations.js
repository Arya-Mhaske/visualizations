import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { apply2, bmat, eig2, expm2 } from './_la-math.js';

// du/dt = A u, solved by u(t) = e^{At} u(0). With real eigenvalues, e^{At}u0 = c1 e^{λ1 t} v1 + c2 e^{λ2 t} v2.
const PRESETS = {
  sink: { name: 'Both decay', A: [[-2, 1], [1, -2]] },
  saddle: { name: 'Saddle', A: [[1, 2], [2, 1]] },
  source: { name: 'Both grow', A: [[2, 1], [1, 2]] },
  spiral: { name: 'Spiral in', A: [[-0.3, -1], [1, -0.3]] },
  centre: { name: 'Circle round', A: [[0, -1], [1, 0]] },
};
const state = { which: 'saddle', x: 1, y: 0.5, t: 1 };
const A = (s) => PRESETS[s.which].A;
const at = (s, t) => apply2(expm2(A(s), t), [s.x, s.y]);

createTool({
  state,
  label: 'A phase plane showing the path of the solution of du by dt equals A u from a chosen starting point. The dashed lines are the eigenvector directions. Along an eigenvector the solution just grows or shrinks as e to the lambda t. A moving marker shows the solution at time t.',
  setup: (stage, c) => createPlot(stage, { x: [-4, 4], y: [-4, 4], c, pad: 14 }),
  draw(ctx, stage, c, plot) {
    const e = eig2(A(state));
    plot.axes({ grid: false });
    if (e.real) e.v.forEach((v) => { if (v) plot.segment(-9 * v[0], -9 * v[1], 9 * v[0], 9 * v[1], { color: c.grid, width: 2, dash: [6, 5] }); });
    for (let i = 0; i < 120; i++) {
      const t0 = -3 + (i * (3 + state.t)) / 120;
      const t1 = -3 + ((i + 1) * (3 + state.t)) / 120;
      const [p, q] = [at(state, t0), at(state, t1)];
      plot.segment(p[0], p[1], q[0], q[1], { color: t0 < 0 ? c.grid : c.a, width: t0 < 0 ? 2 : 4 });
    }
    plot.point(state.x, state.y, { fill: c.fillB, r: 6 });
    const now = at(state, state.t);
    plot.point(now[0], now[1], { fill: c.fillY, r: 8 });
  },
  controls: [
    { title: 'Let the system run' },
    { key: 't', label: 'Time t', min: 0, max: 5, step: 0.1, format: (n) => fixed(n, 1) },
    { key: 'which', label: 'System', options: Object.entries(PRESETS).map(([key, v]) => [key, v.name]) },
    { key: 'x', label: 'Start: u₁(0)', min: -3, max: 3, step: 0.5, format: (n) => fixed(n, 1) },
    { key: 'y', label: 'Start: u₂(0)', min: -3, max: 3, step: 0.5, format: (n) => fixed(n, 1) },
    { readout: [
      ['Eigenvalues', (s) => { const e = eig2(A(s)); return e.real ? e.l.map((v) => fixed(v, 3)).join(', ') : `${fixed(e.re, 2)} ± ${fixed(e.im, 2)}i`; }],
      ['u(t)', (s) => `(${fixed(at(s, s.t)[0], 3)}, ${fixed(at(s, s.t)[1], 3)})`],
      ['Behaviour', (s) => { const e = eig2(A(s)); const re = e.real ? Math.max(...e.l) : e.re; const lo = e.real ? Math.min(...e.l) : e.re; return re < -1e-9 ? 'decays to 0' : lo > 1e-9 ? 'grows' : e.real && re > 1e-9 && lo < -1e-9 ? 'grows along one line, shrinks along the other' : 'circles without growing'; }],
    ] },
  ],
  tex: (s) => `\\dfrac{d\\mathbf u}{dt}=${bmat(A(s), (v) => fixed(v, 1))}\\mathbf u,\\quad \\mathbf u(t)=e^{At}\\mathbf u(0)`,
});
