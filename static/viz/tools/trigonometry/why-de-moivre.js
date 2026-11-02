import { createTool } from '../../lib/tool.js';
import { dot, label, poly } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { arrowW, drawGrid, eqFrame, rad, segW } from './_kit.js';
import { deMoivre, toRect } from './_polar-math.js';

const state = { r: 1.2, th: 30, n: 5 };
const power = (k) => deMoivre(state.r, state.th, k);

createTool({
  state,
  label: 'The powers of a complex number z drawn as a spiral. Each multiplication by z turns the arrow by the same angle theta and stretches it by the same factor r. After n steps the arrow has turned n times theta and has length r to the power n, which is De Moivre’s theorem.',
  draw(ctx, stage, c) {
    const f = eqFrame(stage, [-7, 7], [-7, 7], 8);
    drawGrid(ctx, f, c, stage, { step: 1, labels: false });
    const pts = [];
    for (let i = 0; i <= state.n * 12; i++) {
      const p = deMoivre(state.r, state.th, i / 12);
      pts.push(f.px(toRect(p.r, p.thD)));
    }
    poly(ctx, pts, { stroke: c.grid, width: 2, closed: false });
    for (let k = 1; k <= state.n; k++) {
      const q = toRect(power(k).r, power(k).thD);
      segW(ctx, f, [0, 0], q, { color: k === state.n ? c.a : c.grid, width: k === state.n ? 4 : 1 });
    }
    for (let k = 0; k <= state.n; k++) {
      const p = power(k);
      dot(ctx, ...f.px(toRect(p.r, p.thD)), k === state.n ? 9 : 5, k === state.n ? c.a : c.b, c.ink, 2);
    }
    arrowW(ctx, f, [0, 0], toRect(power(state.n).r, power(state.n).thD), { color: c.a, width: 5, head: 12 });
    label(ctx, 'z', ...f.px(toRect(state.r, state.th)), c, { size: 12, color: c.b, bounds: stage, patch: false });
    label(ctx, `zⁿ`, f.px(toRect(power(state.n).r, power(state.n).thD))[0] + 12, f.px(toRect(power(state.n).r, power(state.n).thD))[1] - 12, c, { size: 12, color: c.a, bounds: stage, patch: false });
  },
  controls: [
    { title: 'z = r ∠ θ' },
    { key: 'r', label: 'Length, r', min: 0.8, max: 1.25, step: 0.05, format: (n) => fixed(n, 2) },
    { key: 'th', label: 'Angle, θ', min: 10, max: 120, step: 5, format: (n) => `${n}°` },
    { key: 'n', label: 'Power, n', min: 1, max: 8, step: 1 },
    { readout: [
      ['Length of zⁿ', () => fixed(power(state.n).r, 3)],
      ['Angle of zⁿ', () => `${state.n * state.th}°`],
      ['zⁿ', () => `${fixed(toRect(power(state.n).r, power(state.n).thD)[0], 3)} + ${fixed(toRect(power(state.n).r, power(state.n).thD)[1], 3)}i`],
    ] },
  ],
  tex: () => `(r\\angle\\theta)^n=r^n\\angle n\\theta=${fixed(power(state.n).r, 2)}\\angle ${state.n * state.th}^\\circ`,
});
