import { createTool } from '../../lib/tool.js';
import { handles } from '../../lib/stage.js';
import { arc, dot, label, poly } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { arrowW, drawGrid, drawPolarGrid, eqFrame, pointHandle, rad, segW } from './_kit.js';
import { PRESETS, presetPoint, toPolar } from './_polar-math.js';

const state = { mode: 'point', p: [3, 2], k: 3, s: 0.35 };
let f = null;
const clamp = ([x, y]) => [Math.max(-6, Math.min(6, Math.round(x * 2) / 2)), Math.max(-6, Math.min(6, Math.round(y * 2) / 2))];
const pre = () => PRESETS[state.k];
const pt = () => (state.mode === 'point' ? state.p : presetPoint(pre(), state.s));

const tool = createTool({
  state,
  label: 'A grid that shows rectangular lines and polar rings at the same time. In point mode, drag a point and read its x and y beside its r and theta. In curve mode, a polar equation is drawn with a marker that slides along it, and the marker’s x and y satisfy the matching rectangular equation.',
  draw(ctx, stage, c) {
    f = eqFrame(stage, [-7.2, 7.2], [-7.2, 7.2], 8);
    drawGrid(ctx, f, c, stage, { step: 1, labels: false });
    drawPolarGrid(ctx, f, c, stage, { rMax: 7, ringStep: 1, rayStep: 30, labels: false });
    const O = f.px([0, 0]);
    if (state.mode === 'curve') {
      const p = pre();
      const pts = [];
      for (let i = 0; i <= 400; i++) pts.push(f.px(presetPoint(p, i / 400)));
      poly(ctx, pts, { stroke: c.b, width: 4, closed: false });
    }
    const [x, y] = pt();
    const pol = toPolar([x, y]);
    segW(ctx, f, [0, 0], [x, 0], { color: c.c, width: 4 });
    segW(ctx, f, [x, 0], [x, y], { color: c.d, width: 4 });
    arrowW(ctx, f, [0, 0], [x, y], { color: c.a, width: 4, head: 11 });
    if (pol.r > 0) arc(ctx, ...O, 30, 0, -rad(pol.thD > 180 ? pol.thD - 360 : pol.thD), { color: c.a, width: 3 });
    dot(ctx, ...f.px([x, y]), 9, c.a, c.ink);
    label(ctx, `(${fixed(x, 2)}, ${fixed(y, 2)})`, f.px([x, y])[0], f.px([x, y])[1] - 16, c, { size: 11, bounds: stage });
  },
  controls: [
    { title: 'Convert' },
    { key: 'mode', label: 'Convert a', options: [['point', 'Point'], ['curve', 'Equation']] },
    { key: 'k', label: 'Equation', min: 0, max: PRESETS.length - 1, step: 1, format: (n) => PRESETS[n].name },
    { key: 's', label: 'Slide along the curve', min: 0, max: 1, step: 0.01, format: (n) => fixed(n, 2) },
    { readout: [
      ['Rectangular (x, y)', () => `(${fixed(pt()[0], 2)}, ${fixed(pt()[1], 2)})`],
      ['Polar (r, θ)', () => { const q = toPolar(pt()); return q.r < 1e-9 ? '(0, any θ)' : `(${fixed(q.r, 2)}, ${fixed(q.thD, 1)}°)`; }],
      ['Rectangular equation', () => (state.mode === 'curve' ? pre().rect.replace(/\^2/g, '²') : '—')],
      ['Check: left − right', () => (state.mode === 'curve' ? fixed(pre().resid(...pt()), 4) : '—')],
    ] },
  ],
  tex: () => (state.mode === 'curve' ? `${pre().tex}\\ \\Longleftrightarrow\\ ${pre().rect}` : `r=\\sqrt{x^2+y^2}=${fixed(toPolar(pt()).r, 2)},\\quad \\tan\\theta=\\dfrac{y}{x}`),
  onChange: () => {
    fields[2].hidden = state.mode !== 'curve';
    fields[1].hidden = state.mode !== 'curve';
  },
});
const fields = [...document.querySelectorAll('#panel .nb-field')];
fields[1].hidden = true;
fields[2].hidden = true;

handles(tool.stage, [pointHandle(() => f, () => pt(), (p) => { if (state.mode === 'point') state.p = clamp(p); }, { limit: clamp, unit: 0.5 })], { onChange: () => tool.update(), radius: 32 });
