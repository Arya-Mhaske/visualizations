import { createTool } from '../../lib/tool.js';
import { handles } from '../../lib/stage.js';
import { dot, label } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { arrowW, drawGrid, eqFrame, pointHandle, segW } from './_kit.js';

const state = { v: [2, 1.5], k: 1 };
let f = null;
const clamp = ([x, y]) => [Math.max(-3, Math.min(3, Math.round(x * 2) / 2)), Math.max(-3, Math.min(3, Math.round(y * 2) / 2))];
const kv = () => [state.k * state.v[0], state.k * state.v[1]];

const tool = createTool({
  state,
  label: 'A vector v and the multiple k times v. A long dashed line through the origin shows the direction of v. As k changes from minus two to two, the green arrow stretches, shrinks through zero, and flips to the other side, but it never leaves the dashed line.',
  draw(ctx, stage, c) {
    f = eqFrame(stage, [-7, 7], [-7, 7], 8);
    drawGrid(ctx, f, c, stage, { step: 1, labels: false });
    const m = Math.hypot(...state.v) || 1;
    const long = [(state.v[0] / m) * 12, (state.v[1] / m) * 12];
    segW(ctx, f, [-long[0], -long[1]], long, { color: c.d, width: 2, dash: [8, 6] });
    arrowW(ctx, f, [0, 0], kv(), { color: c.c, width: 7, head: 14 });
    arrowW(ctx, f, [0, 0], state.v, { color: c.a, width: 4, head: 11 });
    dot(ctx, ...f.px(state.v), 9, c.a, c.ink);
    label(ctx, 'v', f.px(state.v)[0] + 10, f.px(state.v)[1] - 12, c, { size: 13, color: c.a, bounds: stage, patch: false });
    if (Math.abs(state.k) > 0.05) label(ctx, `${fixed(state.k, 1)}v`, f.px(kv())[0] + 10, f.px(kv())[1] + 16, c, { size: 13, color: c.c, bounds: stage, patch: false });
  },
  controls: [
    { title: 'Multiply v by k' },
    { key: 'k', label: 'Scalar, k', min: -2, max: 2, step: 0.1, format: (n) => fixed(n, 1) },
    { text: 'Drag the coral tip to change v.' },
    { readout: [
      ['kv', () => `⟨${fixed(kv()[0], 2)}, ${fixed(kv()[1], 2)}⟩`],
      ['Length of kv', () => fixed(Math.hypot(...kv()), 2)],
      ['|k| × length of v', () => fixed(Math.abs(state.k) * Math.hypot(...state.v), 2)],
      ['Direction', () => (Math.abs(state.k) < 0.05 ? 'none: the zero vector' : state.k > 0 ? 'same as v' : 'opposite to v')],
    ] },
  ],
  tex: () => `k\\langle x,y\\rangle=\\langle kx,ky\\rangle=\\langle ${fixed(kv()[0], 2)},\\ ${fixed(kv()[1], 2)}\\rangle`,
});

handles(tool.stage, [pointHandle(() => f, () => state.v, (p) => { state.v = clamp(p); if (!state.v[0] && !state.v[1]) state.v = [0.5, 0]; }, { limit: clamp, unit: 0.5 })], { onChange: () => tool.update(), radius: 32 });
