import { createTool } from '../../lib/tool.js';
import { handles } from '../../lib/stage.js';
import { dot, label } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { angleArc, arrowW, drawGrid, eqFrame, pointHandle, segW } from './_kit.js';

const state = { u: [4, 3], v: [5, 0] };
let f = null;
const clamp = ([x, y]) => [Math.max(-6, Math.min(6, Math.round(x))), Math.max(-5, Math.min(5, Math.round(y)))];
const norm = (a) => Math.hypot(...a);
const dotp = () => state.u[0] * state.v[0] + state.u[1] * state.v[1];
const diff2 = () => (state.u[0] - state.v[0]) ** 2 + (state.u[1] - state.v[1]) ** 2;
const theta = () => (norm(state.u) && norm(state.v) ? (Math.acos(Math.max(-1, Math.min(1, dotp() / (norm(state.u) * norm(state.v))))) * 180) / Math.PI : NaN);

const tool = createTool({
  state,
  label: 'Two vectors u in coral and v in blue from the origin, with the angle between them. The shadow of u along v is shown in green. The triangle formed by u, v and u minus v lets the law of cosines connect the dot product written with components to the one written with lengths and the angle.',
  draw(ctx, stage, c) {
    f = eqFrame(stage, [-7.5, 7.5], [-6, 6], 8);
    drawGrid(ctx, f, c, stage, { step: 1, labels: false });
    const vv = norm(state.v);
    if (vv) {
      const k = dotp() / (vv * vv);
      const foot = [k * state.v[0], k * state.v[1]];
      segW(ctx, f, state.u, foot, { color: c.grid, width: 2, dash: [5, 4] });
      segW(ctx, f, [0, 0], foot, { color: c.c, width: 9 });
    }
    segW(ctx, f, state.u, state.v, { color: c.d, width: 3, dash: [8, 5] });
    arrowW(ctx, f, [0, 0], state.v, { color: c.b, width: 5, head: 12 });
    arrowW(ctx, f, [0, 0], state.u, { color: c.a, width: 5, head: 12 });
    if (!Number.isNaN(theta())) angleArc(ctx, f.px([0, 0]), f.px(state.v), f.px(state.u), 30, { color: c.ink, width: 3 });
    dot(ctx, ...f.px(state.u), 9, c.a, c.ink);
    dot(ctx, ...f.px(state.v), 9, c.b, c.ink);
    label(ctx, 'u', f.px(state.u)[0] + 10, f.px(state.u)[1] - 12, c, { size: 13, color: c.a, bounds: stage, patch: false });
    label(ctx, 'v', f.px(state.v)[0] + 10, f.px(state.v)[1] - 12, c, { size: 13, color: c.b, bounds: stage, patch: false });
  },
  controls: [
    { title: 'Drag the tips of u and v' },
    { readout: [
      ['u · v from components', () => String(dotp())],
      ['‖u‖‖v‖ cos θ', () => (Number.isNaN(theta()) ? '—' : fixed(norm(state.u) * norm(state.v) * Math.cos((theta() * Math.PI) / 180), 3))],
      ['(‖u‖² + ‖v‖² − ‖u − v‖²) ÷ 2', () => fixed((norm(state.u) ** 2 + norm(state.v) ** 2 - diff2()) / 2, 3)],
      ['Angle θ', () => (Number.isNaN(theta()) ? '—' : `${fixed(theta(), 1)}°`)],
    ] },
  ],
  tex: () => `u\\cdot v=${state.u[0]}(${state.v[0]})+${state.u[1]}(${state.v[1]})=${dotp()}=\\|u\\|\\|v\\|\\cos\\theta`,
});

handles(tool.stage, ['u', 'v'].map((key) => pointHandle(() => f, () => state[key], (p) => { state[key] = clamp(p); }, { limit: clamp, unit: 1 })), { onChange: () => tool.update(), radius: 32 });
