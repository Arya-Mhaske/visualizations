import { createTool } from '../../lib/tool.js';
import { handles } from '../../lib/stage.js';
import { dot, label, line } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { arrowW, drawGrid, eqFrame, pointHandle, segW } from './_kit.js';

const state = { u: [4, 4], v: [6, 1] };
let f = null;
const clamp = ([x, y]) => [Math.max(-6, Math.min(6, Math.round(x))), Math.max(-5, Math.min(5, Math.round(y)))];
const vv = () => state.v[0] ** 2 + state.v[1] ** 2;
const dotp = () => state.u[0] * state.v[0] + state.u[1] * state.v[1];
const par = () => (vv() ? [(dotp() / vv()) * state.v[0], (dotp() / vv()) * state.v[1]] : [0, 0]);
const perp = () => [state.u[0] - par()[0], state.u[1] - par()[1]];

const tool = createTool({
  state,
  label: 'A vector u in coral and a direction v in blue. The green arrow along v is the part of u that points along v. The purple arrow from its tip back up to u is the leftover part, which meets v at a right angle. The two parts add up to u.',
  draw(ctx, stage, c) {
    f = eqFrame(stage, [-7.5, 7.5], [-6, 6], 8);
    drawGrid(ctx, f, c, stage, { step: 1, labels: false });
    const p = par();
    const m = Math.hypot(...state.v) || 1;
    segW(ctx, f, [-state.v[0] / m * 12, -state.v[1] / m * 12], [state.v[0] / m * 12, state.v[1] / m * 12], { color: c.grid, width: 1, dash: [6, 5] });
    arrowW(ctx, f, [0, 0], state.v, { color: c.b, width: 4, head: 11 });
    arrowW(ctx, f, [0, 0], p, { color: c.c, width: 8, head: 13 });
    arrowW(ctx, f, p, state.u, { color: c.d, width: 6, head: 12 });
    arrowW(ctx, f, [0, 0], state.u, { color: c.a, width: 3, head: 10 });
    if (m && Math.hypot(...perp()) > 0.01 && Math.hypot(...p) > 0.01) {
      const e = [state.v[0] / m * 0.35, state.v[1] / m * 0.35];
      const g = [perp()[0] / Math.hypot(...perp()) * 0.35, perp()[1] / Math.hypot(...perp()) * 0.35];
      const a = [p[0] - e[0], p[1] - e[1]];
      const b = [a[0] + g[0], a[1] + g[1]];
      const d = [p[0] + g[0], p[1] + g[1]];
      line(ctx, ...f.px(a), ...f.px(b), { color: c.ink, width: 2 });
      line(ctx, ...f.px(b), ...f.px(d), { color: c.ink, width: 2 });
    }
    dot(ctx, ...f.px(state.u), 9, c.a, c.ink);
    dot(ctx, ...f.px(state.v), 9, c.b, c.ink);
    label(ctx, 'u', f.px(state.u)[0] + 10, f.px(state.u)[1] - 12, c, { size: 13, color: c.a, bounds: stage, patch: false });
    label(ctx, 'v', f.px(state.v)[0] + 10, f.px(state.v)[1] - 12, c, { size: 13, color: c.b, bounds: stage, patch: false });
  },
  controls: [
    { title: 'Drag the tips of u and v' },
    { readout: [
      ['Parallel part', () => `⟨${fixed(par()[0], 2)}, ${fixed(par()[1], 2)}⟩`],
      ['Perpendicular part', () => `⟨${fixed(perp()[0], 2)}, ${fixed(perp()[1], 2)}⟩`],
      ['Their dot product', () => fixed(par()[0] * perp()[0] + par()[1] * perp()[1], 4)],
      ['Sum of the parts', () => `⟨${fixed(par()[0] + perp()[0], 2)}, ${fixed(par()[1] + perp()[1], 2)}⟩`],
    ] },
  ],
  tex: () => `\\text{proj}_v u=\\dfrac{u\\cdot v}{v\\cdot v}\\,v=\\dfrac{${dotp()}}{${vv()}}\\langle ${state.v[0]},${state.v[1]}\\rangle`,
});

handles(tool.stage, ['u', 'v'].map((key) => pointHandle(() => f, () => state[key], (p) => { state[key] = clamp(p); if (key === 'v' && !p[0] && !p[1]) state.v = [1, 0]; }, { limit: clamp, unit: 1 })), { onChange: () => tool.update(), radius: 32 });
