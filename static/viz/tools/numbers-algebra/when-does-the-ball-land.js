import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { dot, label } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { G, ballHeight, ballRoots } from './_quadratic-equations-math.js';

const state = { h0: 10, v0: 14, t: 1 };
const R = (s = state) => ballRoots(s.h0, s.v0);

createTool({
  state,
  label: 'Height against time for a ball thrown upward. The solid coral curve is the real flight from the throw until it lands. The dashed continuation shows the algebra\'s second answer, a negative time before the throw, which the ball never experiences. A marker rides the curve as you move the time slider.',
  setup: (stage, c) => createPlot(stage, { x: [-3, 8], y: [-20, 70], c }),
  draw(ctx, stage, c, plot) {
    const r = R();
    plot.axes({ xLabel: 't (s)', yLabel: 'h (m)' });
    const h = (t) => ballHeight(state.h0, state.v0, t);
    plot.fn(h, { color: c.grid, width: 3, dash: [6, 5], domain: [-3, 0] });
    plot.fn(h, { color: c.a, width: 4, domain: [0, r.late] });
    plot.fn(h, { color: c.grid, width: 3, dash: [6, 5], domain: [r.late, 8] });
    plot.point(r.late, 0, { fill: c.c, r: 8 });
    plot.point(r.early, 0, { fill: c.a, r: 7 });
    plot.text('lands', r.late, -7, { size: 11, patch: false });
    plot.text('rejected', r.early, -7, { size: 11, color: c.a, patch: false });
    const [px, py] = plot.toPx(state.t, h(state.t));
    dot(ctx, px, py, 9, c.b, c.ink);
  },
  controls: [
    { title: 'Throw the ball' },
    { key: 'h0', label: 'Height of the hand, h₀', min: 0, max: 30, step: 1, format: (n) => `${n} m` },
    { key: 'v0', label: 'Speed upward, v₀', min: 0, max: 30, step: 1, format: (n) => `${n} m/s` },
    { key: 't', label: 'Time, t', min: 0, max: 8, step: 0.1, format: (n) => `${n.toFixed(1)} s` },
    { readout: [
      ['Roots of h(t) = 0', (s) => `${fixed(R(s).early, 2)} s and ${fixed(R(s).late, 2)} s`],
      ['Lands at', (s) => ({ text: `${fixed(R(s).late, 2)} s`, good: true })],
      ['Rejected', (s) => ({ text: `${fixed(R(s).early, 2)} s (before the throw)`, good: false })],
      ['Height now', (s) => `${fixed(Math.max(ballHeight(s.h0, s.v0, s.t), 0), 2)} m`],
      ['Highest point', (s) => `${fixed(R(s).peak, 2)} m at ${fixed(R(s).top, 2)} s`],
    ] },
  ],
  tex: (s) => `h(t)=${s.h0}+${s.v0}t-4.9t^2=0\\ \\Rightarrow\\ t=\\dfrac{${s.v0}\\pm\\sqrt{${s.v0}^2+2(9.8)(${s.h0})}}{9.8}=${fixed(R(s).early, 2)},\\ ${fixed(R(s).late, 2)}`,
});
