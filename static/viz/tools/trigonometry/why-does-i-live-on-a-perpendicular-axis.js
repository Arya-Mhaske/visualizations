import { createTool } from '../../lib/tool.js';
import { handles } from '../../lib/stage.js';
import { arc, dot, label } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { TAU, arrowW, drawGrid, eqFrame, pointHandle } from './_kit.js';
import { cmul, iPower } from './_polar-math.js';

const state = { z: [3, 1], n: 1 };
let f = null;
const clamp = ([x, y]) => [Math.max(-5, Math.min(5, Math.round(x))), Math.max(-5, Math.min(5, Math.round(y)))];
const at = (k) => cmul(state.z, iPower(k));
const sgn = (x) => (x < 0 ? `-${-x}` : `+${x}`);
const cpx = (z) => `${z[0]} ${sgn(z[1])}i`;

const tool = createTool({
  state,
  label: 'The complex plane with a number z drawn as a coral arrow. Multiplying by i turns it a quarter turn anticlockwise, and a slider applies the multiplication again and again. After two multiplications the arrow has turned a half turn and points the opposite way, which is why i squared equals minus one. After four, it is back where it started.',
  draw(ctx, stage, c) {
    f = eqFrame(stage, [-6.5, 6.5], [-6, 6], 8);
    drawGrid(ctx, f, c, stage, { step: 1 });
    const O = f.px([0, 0]);
    const r = Math.hypot(...state.z);
    const base = Math.atan2(state.z[1], state.z[0]);
    arc(ctx, ...O, r * f.k, 0, TAU, { color: c.grid, width: 1.5, dash: [4, 4] });
    for (let k = 0; k < state.n; k++) {
      const rr = (0.35 + 0.12 * (k % 4)) * f.k * 1.2;
      arc(ctx, ...O, Math.min(rr, r * f.k * 0.8), -(base + (k * Math.PI) / 2), -(base + ((k + 1) * Math.PI) / 2), { color: c.b, width: 4 });
    }
    for (let k = 0; k <= Math.min(state.n, 4); k++) {
      const z = at(k);
      arrowW(ctx, f, [0, 0], z, { color: k === state.n ? c.a : c.grid, width: k === state.n ? 5 : 2, head: k === state.n ? 12 : 8 });
    }
    dot(ctx, ...f.px(state.z), 8, c.ink, c.ink);
    dot(ctx, ...f.px(at(state.n)), 9, c.a, c.ink);
    label(ctx, `z·i^${state.n}`, f.px(at(state.n))[0] + 8, f.px(at(state.n))[1] - 14, c, { size: 11, color: c.a, bounds: stage, patch: false });
    label(ctx, 'Re', stage.w - 16, O[1] - 8, c, { size: 10, bounds: stage, patch: false });
    label(ctx, 'Im', O[0] + 14, 10, c, { size: 10, bounds: stage, patch: false });
  },
  controls: [
    { title: 'Multiply by i, again and again' },
    { key: 'n', label: 'Times multiplied by i', min: 0, max: 8, step: 1 },
    { text: 'Drag the grey start point to change z.' },
    { readout: [
      ['Quarter turns', () => `${state.n} × 90° = ${state.n * 90}°`],
      ['z · iⁿ', () => cpx(at(state.n))],
      ['iⁿ', () => cpx(iPower(state.n))],
      ['Length of z · iⁿ', () => fixed(Math.hypot(...at(state.n)), 3)],
    ] },
  ],
  tex: () => `i^{${state.n}}=${cpx(iPower(state.n))}\\ \\Rightarrow\\ z\\,i^{${state.n}}=${cpx(at(state.n))}`,
});

handles(tool.stage, [pointHandle(() => f, () => state.z, (p) => { state.z = clamp(p); if (!state.z[0] && !state.z[1]) state.z = [1, 0]; }, { limit: clamp, unit: 1 })], { onChange: () => tool.update(), radius: 32 });
