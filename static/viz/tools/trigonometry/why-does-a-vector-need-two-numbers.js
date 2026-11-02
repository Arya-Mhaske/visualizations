import { createTool } from '../../lib/tool.js';
import { handles } from '../../lib/stage.js';
import { arc, dot, label } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { arrowW, drawGrid, eqFrame, pointHandle, segW } from './_kit.js';

const state = { v: [4, 3], view: 'both' };
let f = null;
const clamp = ([x, y]) => [Math.max(-6, Math.min(6, Math.round(x * 2) / 2)), Math.max(-5, Math.min(5, Math.round(y * 2) / 2))];
const mag = () => Math.hypot(...state.v);
const ang = () => ((Math.atan2(state.v[1], state.v[0]) * 180) / Math.PI + 360) % 360;

const tool = createTool({
  state,
  label: 'A vector as an arrow from the origin that you can drag. It can be described two ways: by its length and direction angle, shown as a coral arc, or by its horizontal and vertical components, shown as blue and green legs of a right triangle. Both descriptions name the same arrow.',
  draw(ctx, stage, c) {
    f = eqFrame(stage, [-7, 7], [-6, 6], 8);
    drawGrid(ctx, f, c, stage, { step: 1 });
    const [x, y] = state.v;
    const O = f.px([0, 0]);
    if (state.view !== 'polar') {
      segW(ctx, f, [0, 0], [x, 0], { color: c.b, width: 6 });
      segW(ctx, f, [x, 0], [x, y], { color: c.c, width: 6 });
      label(ctx, `x = ${fixed(x, 1)}`, f.px([x / 2, 0])[0], f.px([0, 0])[1] + (y >= 0 ? 16 : -14), c, { size: 11, color: c.b, bounds: stage, patch: false });
      label(ctx, `y = ${fixed(y, 1)}`, f.px([x, y / 2])[0] + (x >= 0 ? 8 : -8), f.px([0, y / 2])[1], c, { size: 11, color: c.c, align: x >= 0 ? 'left' : 'right', bounds: stage, patch: false });
    }
    if (state.view !== 'xy') {
      arc(ctx, ...O, 30, 0, -(ang() > 180 ? ang() - 360 : ang()) * Math.PI / 180, { color: c.a, width: 4 });
      label(ctx, `θ = ${fixed(ang(), 0)}°`, O[0] + 52, O[1] - 14 * Math.sign(y || 1), c, { size: 11, color: c.a, bounds: stage, patch: false });
    }
    arrowW(ctx, f, [0, 0], [x, y], { color: c.a, width: 5, head: 12 });
    const P = f.px([x, y]);
    dot(ctx, ...P, 9, c.a, c.ink);
    label(ctx, `‖v‖ = ${fixed(mag(), 2)}`, P[0], P[1] - 16, c, { size: 11, bounds: stage, patch: false });
  },
  controls: [
    { title: 'Drag the tip of the arrow' },
    { key: 'view', label: 'Show', options: [['both', 'Both'], ['polar', 'Length + angle'], ['xy', 'Components']] },
    { readout: [
      ['Length, ‖v‖', () => fixed(mag(), 3)],
      ['Direction, θ', () => `${fixed(ang(), 1)}°`],
      ['Components ⟨x, y⟩', () => `⟨${fixed(state.v[0], 1)}, ${fixed(state.v[1], 1)}⟩`],
      ['⟨‖v‖cos θ, ‖v‖sin θ⟩', () => `⟨${fixed(mag() * Math.cos((ang() * Math.PI) / 180), 1)}, ${fixed(mag() * Math.sin((ang() * Math.PI) / 180), 1)}⟩`],
    ] },
  ],
  tex: () => `\\langle\\|v\\|\\cos\\theta,\\ \\|v\\|\\sin\\theta\\rangle=\\langle ${fixed(state.v[0], 1)},\\ ${fixed(state.v[1], 1)}\\rangle`,
});

handles(tool.stage, [pointHandle(() => f, () => state.v, (p) => { state.v = clamp(p); }, { limit: clamp, unit: 0.5 })], { onChange: () => tool.update(), radius: 32 });
