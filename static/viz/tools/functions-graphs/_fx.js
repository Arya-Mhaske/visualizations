// Small helpers shared by the function-graph tools.
//   grab(tool, state, xKey, yKey, { lo, hi, step })  a draggable integer-or-snapped point for handles(), reading tool.extra (a createPlot)
//   line(plot, a, b, c)  plot.segment-free helper: the points of a x + b y + c = 0 across a window, for vertical lines too
//   fmt(v, n)  fixed() that keeps a plain minus for TeX
import { fixed } from '../../lib/format.js';

export function grab(tool, state, xKey, yKey, { lo = -7, hi = 7, step = 1 } = {}) {
  return {
    at: () => tool.extra.toPx(state[xKey], state[yKey]),
    move(px, py) {
      const [x, y] = tool.extra.toWorld(px, py);
      state[xKey] = Math.max(lo, Math.min(hi, Math.round(x / step) * step));
      state[yKey] = Math.max(lo, Math.min(hi, Math.round(y / step) * step));
    },
    get keyStep() { return (Math.abs(tool.extra.toPx(1, 0)[0] - tool.extra.toPx(0, 0)[0])) * step; },
  };
}
export const fmt = (v, n = 2) => fixed(v, n).replace('−', '-');
// Signed term for TeX: sgn(3) = "+3", sgn(-3) = "-3"
export const sgn = (v, n = 2) => (v < 0 ? `-${fmt(Math.abs(v), n)}` : `+${fmt(v, n)}`);
export const PARENTS = [
  { name: 'x²', f: (x) => x * x, tex: 'x^2', view: [[-6, 6], [-2, 10]] },
  { name: '|x|', f: Math.abs, tex: '|x|', view: [[-6, 6], [-2, 8]] },
  { name: 'x³', f: (x) => x ** 3, tex: 'x^3', view: [[-4, 4], [-8, 8]] },
  { name: '√x', f: (x) => (x < 0 ? NaN : Math.sqrt(x)), tex: '\\sqrt{x}', view: [[-2, 10], [-2, 5]] },
  { name: 'sin x', f: Math.sin, tex: '\\sin x', view: [[-7, 7], [-3, 3]] },
];
