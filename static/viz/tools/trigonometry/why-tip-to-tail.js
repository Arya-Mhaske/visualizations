import { createTool } from '../../lib/tool.js';
import { handles } from '../../lib/stage.js';
import { dot, label, poly } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { arrowW, drawGrid, eqFrame, pointHandle } from './_kit.js';

const state = { u: [4, 1], v: [1, 3], order: 'both' };
let f = null;
const clamp = ([x, y]) => [Math.max(-6, Math.min(6, Math.round(x))), Math.max(-5, Math.min(5, Math.round(y)))];
const sum = () => [state.u[0] + state.v[0], state.u[1] + state.v[1]];

const tool = createTool({
  state,
  label: 'Two vectors u and v from the origin, which you can reshape by dragging their tips. A path walks u first and then v from the tip of u. A second path walks v first and then u. Both paths end at the same point, which is the sum, and together the four sides form a parallelogram.',
  draw(ctx, stage, c) {
    f = eqFrame(stage, [-7.5, 11], [-6, 9], 8);
    drawGrid(ctx, f, c, stage, { step: 1, labels: false });
    const [u, v, s] = [state.u, state.v, sum()];
    if (state.order !== 'u first') poly(ctx, [f.px([0, 0]), f.px(u), f.px(s), f.px(v)], { fill: c.fillY, stroke: null });
    if (state.order !== 'v first') {
      arrowW(ctx, f, [0, 0], u, { color: c.a, width: 5 });
      arrowW(ctx, f, u, s, { color: c.b, width: 5 });
    }
    if (state.order !== 'u first') {
      arrowW(ctx, f, [0, 0], v, { color: c.b, width: 3 });
      arrowW(ctx, f, v, s, { color: c.a, width: 3 });
    }
    arrowW(ctx, f, [0, 0], s, { color: c.c, width: 6, head: 13 });
    [[u, c.a], [v, c.b], [s, c.c]].forEach(([p, col]) => dot(ctx, ...f.px(p), 8, col, c.ink));
    label(ctx, 'u', ...f.px([u[0] / 2, u[1] / 2 - 0.5]), c, { size: 12, color: c.a, bounds: stage, patch: false });
    label(ctx, 'v', ...f.px([v[0] / 2 - 0.5, v[1] / 2]), c, { size: 12, color: c.b, bounds: stage, patch: false });
    label(ctx, 'u + v', f.px(s)[0] + 6, f.px(s)[1] - 14, c, { size: 12, color: c.c, bounds: stage, patch: false });
  },
  controls: [
    { title: 'Drag the tips of u and v' },
    { key: 'order', label: 'Walk', options: [['both', 'Both ways'], ['u first', 'u then v'], ['v first', 'v then u']] },
    { readout: [
      ['u', () => `⟨${state.u[0]}, ${state.u[1]}⟩`],
      ['v', () => `⟨${state.v[0]}, ${state.v[1]}⟩`],
      ['u + v', () => `⟨${sum()[0]}, ${sum()[1]}⟩`],
      ['v + u', () => `⟨${state.v[0] + state.u[0]}, ${state.v[1] + state.u[1]}⟩`],
      ['Length of u + v', () => fixed(Math.hypot(...sum()), 2)],
    ] },
  ],
  tex: () => `\\langle ${state.u[0]},${state.u[1]}\\rangle+\\langle ${state.v[0]},${state.v[1]}\\rangle=\\langle ${sum()[0]},${sum()[1]}\\rangle`,
});

handles(tool.stage, [state.u, state.v].map((_, i) => {
  const key = i ? 'v' : 'u';
  return pointHandle(() => f, () => state[key], (p) => { state[key] = clamp(p); }, { limit: clamp, unit: 1 });
}), { onChange: () => tool.update(), radius: 32 });
