import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';

// y'' + 3y' + 2y = f(x). Homogeneous roots -1 and -2.
const P = 3;
const Q = 2;
const state = { kind: 'exp', A: 4, k: 1, C1: 0, C2: 0 };
// [y, y', y''] of a particular solution, and the forcing f(x).
function parts(s) {
  const { kind, A, k } = s;
  if (kind === 'const') return { yp: () => A / Q, y1: () => 0, y2: () => 0, f: () => A, rule: `try y = constant: ${Q}y = ${A}` };
  if (kind === 'exp') {
    const B = A / (k * k + P * k + Q);
    return { yp: (x) => B * Math.exp(k * x), y1: (x) => k * B * Math.exp(k * x), y2: (x) => k * k * B * Math.exp(k * x), f: (x) => A * Math.exp(k * x), rule: `try y = B e^(${k}x): B = ${fixed(B, 4)}` };
  }
  const w = k;
  const D = (Q - w * w) ** 2 + (P * w) ** 2;
  const S = (A * (Q - w * w)) / D;
  const T = (-A * P * w) / D;
  return {
    yp: (x) => S * Math.sin(w * x) + T * Math.cos(w * x),
    y1: (x) => w * (S * Math.cos(w * x) - T * Math.sin(w * x)),
    y2: (x) => -w * w * (S * Math.sin(w * x) + T * Math.cos(w * x)),
    f: (x) => A * Math.sin(w * x),
    rule: `try y = a sin ${w}x + b cos ${w}x: a = ${fixed(S, 3)}, b = ${fixed(T, 3)}`,
  };
}
const y = (s, x) => parts(s).yp(x) + s.C1 * Math.exp(-x) + s.C2 * Math.exp(-2 * x);
const leftover = (s) => {
  const p = parts(s);
  let worst = 0;
  for (let i = 0; i <= 100; i++) {
    const x = i * 0.05;
    const y0 = p.yp(x) + s.C1 * Math.exp(-x) + s.C2 * Math.exp(-2 * x);
    const y1 = p.y1(x) - s.C1 * Math.exp(-x) - 2 * s.C2 * Math.exp(-2 * x);
    const y2 = p.y2(x) + s.C1 * Math.exp(-x) + 4 * s.C2 * Math.exp(-2 * x);
    worst = Math.max(worst, Math.abs(y2 + P * y1 + Q * y0 - p.f(x)));
  }
  return worst;
};

createTool({
  state,
  label: 'The equation y double prime plus 3 y prime plus 2 y equals a forcing term. A particular solution found by undetermined coefficients is drawn in coral. Adding any amounts of the two homogeneous solutions, e to the minus x and e to the minus 2x, gives the blue general solution, which still solves the equation. A leftover check confirms it.',
  setup: (stage, c) => createPlot(stage, { x: [0, 6], y: [-3, 6], c }),
  draw(ctx, stage, c, plot) {
    const p = parts(state);
    const vals = Array.from({ length: 61 }, (_, i) => y(state, i * 0.1));
    const top = Math.max(1.5, ...vals.map(Math.abs)) * 1.2;
    plot.setRange([0, 6], [-top, top]);
    plot.axes({ xLabel: 'x', yLabel: 'y' });
    plot.fn(p.yp, { color: c.a, width: 3 });
    plot.fn((x) => y(state, x), { color: c.b, width: 4, dash: state.C1 || state.C2 ? [] : [6, 5] });
  },
  controls: [
    { title: 'Find a particular solution' },
    { key: 'kind', label: 'Forcing term f(x)', options: [['const', 'A'], ['exp', 'A eᵏˣ'], ['sin', 'A sin kx']] },
    { key: 'A', label: 'A', min: 1, max: 10, step: 1 },
    { key: 'k', label: 'k', min: 0.5, max: 3, step: 0.5, format: (v) => fixed(v, 1) },
    { key: 'C1', label: 'Add C₁e⁻ˣ', min: -3, max: 3, step: 0.5, format: (v) => fixed(v, 1) },
    { key: 'C2', label: 'Add C₂e⁻²ˣ', min: -3, max: 3, step: 0.5, format: (v) => fixed(v, 1) },
    { readout: [
      ['Guess and result', (s) => parts(s).rule],
      ['Left over in the equation', (s) => ({ text: leftover(s).toExponential(1), good: leftover(s) < 1e-9 })],
    ] },
  ],
  tex: () => String.raw`y=y_p+C_1e^{-x}+C_2e^{-2x}\ \text{solves}\ y''+3y'+2y=f(x)`,
});
