import { createTool } from '../../lib/tool.js';
import { handles } from '../../lib/stage.js';
import { dot, label } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { angleArc, arrowW, drawGrid, eqFrame, pointHandle } from './_kit.js';

const state = { z: [3, 2], w: [4, -1] };
let f = null;
const clamp = ([x, y]) => [Math.max(-6, Math.min(6, Math.round(x))), Math.max(-5, Math.min(5, Math.round(y)))];
const prod = () => {
  const [a, b] = state.z; const [c, d] = state.w;
  return [a * c + b * d, a * d - b * c]; // (a - bi)(c + di)
};
const sgn = (x) => (x < 0 ? `-${-x}` : `+${x}`);

const tool = createTool({
  state,
  label: 'Two complex numbers z and w drawn as arrows on the complex plane, with the mirror image of z, its conjugate, drawn dashed. The product of the conjugate of z with w has a real part equal to the dot product of the two arrows, and an imaginary part equal to a b-type cross term.',
  draw(ctx, stage, c) {
    f = eqFrame(stage, [-7.5, 7.5], [-6, 6], 8);
    drawGrid(ctx, f, c, stage, { step: 1, labels: false });
    arrowW(ctx, f, [0, 0], [state.z[0], -state.z[1]], { color: c.grid, width: 3, head: 10 });
    arrowW(ctx, f, [0, 0], state.z, { color: c.a, width: 5, head: 12 });
    arrowW(ctx, f, [0, 0], state.w, { color: c.b, width: 5, head: 12 });
    if (state.z[0] || state.z[1]) angleArc(ctx, f.px([0, 0]), f.px(state.z), f.px(state.w), 32, { color: c.ink, width: 3 });
    dot(ctx, ...f.px(state.z), 9, c.a, c.ink);
    dot(ctx, ...f.px(state.w), 9, c.b, c.ink);
    label(ctx, 'z', f.px(state.z)[0] + 10, f.px(state.z)[1] - 12, c, { size: 13, color: c.a, bounds: stage, patch: false });
    label(ctx, 'w', f.px(state.w)[0] + 10, f.px(state.w)[1] - 12, c, { size: 13, color: c.b, bounds: stage, patch: false });
    label(ctx, 'z̄', f.px([state.z[0], -state.z[1]])[0] + 10, f.px([0, -state.z[1]])[1] + 12, c, { size: 13, color: c.grid, bounds: stage, patch: false });
  },
  controls: [
    { title: 'Drag z and w' },
    { readout: [
      ['z', () => `${state.z[0]} ${sgn(state.z[1])}i`],
      ['w', () => `${state.w[0]} ${sgn(state.w[1])}i`],
      ['Real part of z̄w', () => String(prod()[0])],
      ['Dot product z · w', () => String(state.z[0] * state.w[0] + state.z[1] * state.w[1])],
      ['Imaginary part of z̄w', () => String(prod()[1])],
    ] },
  ],
  tex: () => `(${state.z[0]}${sgn(-state.z[1])}i)(${state.w[0]}${sgn(state.w[1])}i)=(ac+bd)+(ad-bc)i=${prod()[0]}${sgn(prod()[1])}i`,
});

handles(tool.stage, ['z', 'w'].map((key) => pointHandle(() => f, () => state[key], (p) => { state[key] = clamp(p); }, { limit: clamp, unit: 1 })), { onChange: () => tool.update(), radius: 32 });
