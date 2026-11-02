import { createTool } from '../../lib/tool.js';
import { fixed } from '../../lib/format.js';
import { apply2, bmat, rad, rot2 } from './_la-math.js';
import { plane, vec } from './_la-view.js';

// P projects onto the line at angle α. Project once and you are on the line; project again and nothing moves.
// The switch replaces P by a rotation: apply it twice and the vector keeps moving.
const state = { alpha: 30, phi: 110, len: 3, rotate: false };
const M = (s) => {
  const [c, d] = [Math.cos(rad(s.alpha)), Math.sin(rad(s.alpha))];
  return s.rotate ? rot2(rad(s.alpha)) : [[c * c, c * d], [c * d, d * d]];
};
const x = (s) => [s.len * Math.cos(rad(s.phi)), s.len * Math.sin(rad(s.phi))];

createTool({
  state,
  label: 'A vector x, its projection P x onto a line, and the projection of that, P squared x. The second projection lands exactly on the first because the point is already on the line. A switch replaces the projection by a rotation, and then applying it twice moves the vector again.',
  setup: (stage, c) => plane(stage, c, 4),
  draw(ctx, stage, c, plot) {
    const A = M(state);
    const [one, two] = [apply2(A, x(state)), apply2(A, apply2(A, x(state)))];
    plot.axes({ grid: false });
    if (!state.rotate) {
      const a = [Math.cos(rad(state.alpha)), Math.sin(rad(state.alpha))];
      plot.segment(-6 * a[0], -6 * a[1], 6 * a[0], 6 * a[1], { color: c.grid, width: 3 });
      plot.segment(x(state)[0], x(state)[1], one[0], one[1], { color: c.grid, width: 2, dash: [5, 4] });
    }
    vec(ctx, plot, c, [0, 0], x(state), { color: c.b, width: 4, text: 'x' });
    vec(ctx, plot, c, [0, 0], two, { color: c.d, width: 9, text: state.rotate ? 'R²x' : 'P²x', dx: 14, dy: 14 });
    vec(ctx, plot, c, [0, 0], one, { color: c.a, width: 5, text: state.rotate ? 'Rx' : 'Px' });
  },
  controls: [
    { title: 'Apply it twice' },
    { key: 'rotate', label: 'Use a rotation instead of a projection', toggle: true },
    { key: 'alpha', label: 'Line direction (or turn angle)', min: 0, max: 175, step: 5, format: (n) => `${n}°` },
    { key: 'phi', label: 'Direction of x', min: 0, max: 360, step: 5, format: (n) => `${n}°` },
    { key: 'len', label: 'Length of x', min: 1, max: 4, step: 0.5, format: (n) => fixed(n, 1) },
    { readout: [
      ['Px (or Rx)', (s) => `(${fixed(apply2(M(s), x(s))[0], 3)}, ${fixed(apply2(M(s), x(s))[1], 3)})`],
      ['P²x (or R²x)', (s) => `(${fixed(apply2(M(s), apply2(M(s), x(s)))[0], 3)}, ${fixed(apply2(M(s), apply2(M(s), x(s)))[1], 3)})`],
      ['Second step moved it by', (s) => { const a = apply2(M(s), x(s)); const b = apply2(M(s), a); const d = Math.hypot(a[0] - b[0], a[1] - b[1]); return { text: fixed(d, 4), good: d < 1e-9 }; }],
    ] },
  ],
  tex: (s) => `${s.rotate ? 'R' : 'P'}=${bmat(M(s), (v) => fixed(v, 3))}`,
});
