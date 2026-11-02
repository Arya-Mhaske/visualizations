import { createTool } from '../../lib/tool.js';
import { handles } from '../../lib/stage.js';
import { arc, dot, label } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { TAU, arrowW, drawGrid, eqFrame, pointHandle } from './_kit.js';

const state = { v: [4, 3], L: 5 };
let f = null;
const clamp = ([x, y]) => [Math.max(-6, Math.min(6, Math.round(x))), Math.max(-5, Math.min(5, Math.round(y)))];
const mag = () => Math.hypot(...state.v);
const hat = () => (mag() ? [state.v[0] / mag(), state.v[1] / mag()] : [0, 0]);

const tool = createTool({
  state,
  label: 'A vector v in coral, and its unit vector in green: the same direction but length one, ending on the unit circle. A slider scales the unit vector to any length L, and when L equals the length of v the scaled arrow lands back on v.',
  draw(ctx, stage, c) {
    f = eqFrame(stage, [-7.5, 7.5], [-6, 6], 8);
    drawGrid(ctx, f, c, stage, { step: 1, labels: false });
    arc(ctx, ...f.px([0, 0]), f.k, 0, TAU, { color: c.ink, width: 2 });
    const h = hat();
    arrowW(ctx, f, [0, 0], [h[0] * state.L, h[1] * state.L], { color: c.b, width: 4, head: 11 });
    arrowW(ctx, f, [0, 0], state.v, { color: c.a, width: 4, head: 11 });
    arrowW(ctx, f, [0, 0], h, { color: c.c, width: 8, head: 13 });
    dot(ctx, ...f.px(state.v), 9, c.a, c.ink);
    label(ctx, 'v', f.px(state.v)[0] + 10, f.px(state.v)[1] - 12, c, { size: 13, color: c.a, bounds: stage, patch: false });
    label(ctx, 'unit vector', f.px(h)[0] + 4, f.px(h)[1] + 18, c, { size: 11, color: c.c, bounds: stage, patch: false });
  },
  controls: [
    { title: 'Drag v, then scale' },
    { key: 'L', label: 'Scale the unit vector to L', min: 0, max: 8, step: 0.5, format: (n) => fixed(n, 1) },
    { readout: [
      ['Length of v', () => fixed(mag(), 3)],
      ['Unit vector', () => (mag() ? `⟨${fixed(hat()[0], 3)}, ${fixed(hat()[1], 3)}⟩` : '—')],
      ['Its length', () => (mag() ? fixed(Math.hypot(...hat()), 3) : '—')],
      ['L × unit vector', () => `⟨${fixed(hat()[0] * state.L, 2)}, ${fixed(hat()[1] * state.L, 2)}⟩`],
    ] },
  ],
  tex: () => `\\hat v=\\dfrac{v}{\\|v\\|}=\\dfrac{\\langle ${state.v[0]},${state.v[1]}\\rangle}{${fixed(mag(), 2)}}=\\langle ${fixed(hat()[0], 3)},${fixed(hat()[1], 3)}\\rangle`,
});

handles(tool.stage, [pointHandle(() => f, () => state.v, (p) => { state.v = clamp(p); if (!state.v[0] && !state.v[1]) state.v = [1, 0]; }, { limit: clamp, unit: 1 })], { onChange: () => tool.update(), radius: 32 });
