import { createTool } from '../../lib/tool.js';
import { arrow, dot, label, line, arc, TAU } from '../../lib/draw.js';
import { fact, num } from './_is.js';

// Put x = iθ in the eˣ series. Powers of i go 1, i, −1, −i, so the terms turn a quarter each step:
// the real parts add to cos θ and the imaginary parts to sin θ. Draw the terms nose to tail.
const state = { theta: 1.5, N: 6 };
const I = [[1, 0], [0, 1], [-1, 0], [0, -1]];
const termAt = (k) => { const m = state.theta ** k / fact(k); return [I[k % 4][0] * m, I[k % 4][1] * m]; };
const chain = () => { const pts = [[0, 0]]; for (let k = 0; k <= state.N; k++) { const [x, y] = termAt(k); const p = pts[pts.length - 1]; pts.push([p[0] + x, p[1] + y]); } return pts; };

createTool({
  state,
  label: 'The complex plane with the unit circle. Arrows for the terms of the series for e to the i theta are laid nose to tail and the chain ends close to the point cosine theta, sine theta on the circle.',
  draw(ctx, stage, c) {
    const pts = chain();
    const R = Math.max(1.3, ...pts.map(([x, y]) => Math.max(Math.abs(x), Math.abs(y)) * 1.1));
    const s = Math.min(stage.w, stage.h) / (2 * R) * 0.92;
    const [cx, cy] = [stage.w / 2, stage.h / 2];
    const P = ([x, y]) => [cx + x * s, cy - y * s];
    line(ctx, 0, cy, stage.w, cy, { color: c.grid, width: 1.5 });
    line(ctx, cx, 0, cx, stage.h, { color: c.grid, width: 1.5 });
    arc(ctx, cx, cy, s, 0, TAU, { color: c.ink, width: 2 });
    label(ctx, 'Re', stage.w - 14, cy - 12, c, { size: 11 });
    label(ctx, 'Im', cx + 14, 12, c, { size: 11 });
    const target = [Math.cos(state.theta), Math.sin(state.theta)];
    const [tx, ty] = P(target);
    line(ctx, cx, cy, tx, ty, { color: c.c, width: 2, dash: [5, 4] });
    dot(ctx, tx, ty, 7, c.c, c.ink);
    for (let k = 0; k < pts.length - 1; k++) {
      const [x1, y1] = P(pts[k]);
      const [x2, y2] = P(pts[k + 1]);
      if (Math.hypot(x2 - x1, y2 - y1) > 6) arrow(ctx, x1, y1, x2, y2, { color: [c.a, c.b, c.d, c.ink][k % 4], width: 3, head: 8 });
      else line(ctx, x1, y1, x2, y2, { color: [c.a, c.b, c.d, c.ink][k % 4], width: 3 });
    }
    const [ex, ey] = P(pts[pts.length - 1]);
    dot(ctx, ex, ey, 5, c.a, c.ink);
  },
  controls: [
    { title: 'Build e^(iθ)' },
    { key: 'theta', label: 'Angle θ (radians)', min: 0, max: 3.5, step: 0.05, format: (v) => v.toFixed(2) },
    { key: 'N', label: 'Terms up to k =', min: 0, max: 14, step: 1 },
    { readout: [
      ['Real part of sum', () => num(chain()[state.N + 1][0], 5)],
      ['cos θ', () => num(Math.cos(state.theta), 5)],
      ['Imaginary part of sum', () => num(chain()[state.N + 1][1], 5)],
      ['sin θ', () => num(Math.sin(state.theta), 5)],
    ] },
  ],
  tex: (s) => `e^{i\\theta}=\\sum_{k=0}^{${s.N}}\\frac{(i\\theta)^k}{k!}\\ \\to\\ \\cos\\theta+i\\sin\\theta`,
});
