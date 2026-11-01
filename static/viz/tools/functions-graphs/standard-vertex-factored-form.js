import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';

// The line is stored as a, b, c. Editing the vertex (h, k) or the roots (r, s) recomputes them.
const state = { a: 1, b: -2, c: -3, h: 1, k: -4, r: -1, s: 3 };
let prev = { ...state };
const nz = (v) => (Math.abs(v) < 1e-9 ? 0 : v);
const disc = () => state.b * state.b - 4 * state.a * state.c;
const f = (x) => state.a * x * x + state.b * x + state.c;
const num = (v) => fixed(nz(v), 2);
const sgn = (v) => (v < 0 ? `-${fixed(-v, 2)}` : `+${fixed(v, 2)}`);

function sync(changed) {
  const { a } = state;
  if (changed === 'vertex') { state.b = -2 * a * state.h; state.c = a * state.h * state.h + state.k; }
  if (changed === 'roots') { state.b = -a * (state.r + state.s); state.c = a * state.r * state.s; }
  state.h = -state.b / (2 * a);
  state.k = state.c - (state.b * state.b) / (4 * a);
  if (disc() >= 0) { const d = Math.sqrt(disc()); state.r = (-state.b - d) / (2 * a); state.s = (-state.b + d) / (2 * a); }
}

createTool({
  state,
  label: 'A parabola written three ways: standard form, vertex form and factored form. Each form is controlled by its own sliders. Change any one of them and the other forms are recomputed and their sliders move, because they all describe the same graph. The factored form exists only while the parabola meets the x-axis.',
  setup: (stage, c) => createPlot(stage, { x: [-6, 8], y: [-10, 12], c, pad: 18 }),
  draw(ctx, stage, c, plot) {
    plot.axes();
    plot.fn(f, { color: c.a, width: 4 });
    plot.point(state.h, state.k, { fill: c.fillY, r: 8 });
    plot.point(0, state.c, { fill: c.b, r: 6 });
    if (disc() >= 0) { plot.point(state.r, 0, { fill: c.c, r: 7 }); plot.point(state.s, 0, { fill: c.c, r: 7 }); }
  },
  controls: [
    { title: 'Vertex form: a(x − h)² + k' },
    { key: 'h', label: 'h', min: -5, max: 6, step: 0.25 },
    { key: 'k', label: 'k', min: -9, max: 9, step: 0.25 },
    { title: 'Standard form: ax² + bx + c' },
    { key: 'a', label: 'a (all forms)', min: -3, max: 3, step: 0.5 },
    { key: 'b', label: 'b', min: -8, max: 8, step: 0.25 },
    { key: 'c', label: 'c', min: -8, max: 8, step: 0.25 },
    { title: 'Factored form: a(x − r)(x − s)' },
    { key: 'r', label: 'r', min: -6, max: 7, step: 0.25 },
    { key: 's', label: 's', min: -6, max: 7, step: 0.25 },
  ],
  onChange(s) {
    if (s.a === 0) s.a = 1;
    const was = prev;
    const changed = (was.h !== s.h || was.k !== s.k) ? 'vertex' : (was.r !== s.r || was.s !== s.s) ? 'roots' : 'standard';
    sync(changed);
    prev = { ...s };
  },
  tex: (s) => `\\begin{aligned}\\text{standard: }& ${num(s.a)}x^2${sgn(s.b)}x${sgn(s.c)}\\\\ \\text{vertex: }& ${num(s.a)}(x${sgn(-s.h)})^2${sgn(s.k)}\\\\ \\text{factored: }& ${disc() >= 0 ? `${num(s.a)}(x${sgn(-s.r)})(x${sgn(-s.s)})` : '\\text{no real roots}'}\\end{aligned}`,
});
