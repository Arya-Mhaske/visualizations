import { createTool } from '../../lib/tool.js';
import { line, label } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';

const LAYERS = [
  { name: 'Brick', K: 0.7, key: 'a' },
  { name: 'Foam', K: 0.03, key: 'b' },
  { name: 'Plaster', K: 0.8, key: 'c' },
];
const state = { dT: 20, a: 20, b: 5, c: 2 };
const R = (s) => LAYERS.map((l) => s[l.key] / 100 / l.K); // m²·K/W
const total = (s) => R(s).reduce((p, r) => p + r, 0);
const q = (s) => s.dT / total(s);

createTool({
  state,
  label: 'A wall of three layers: brick, foam and plaster, hot on the left and cold on the right. A line above shows the temperature falling through the wall. It falls steeply across layers that resist heat flow and gently across layers that do not.',
  draw(ctx, stage, c) {
    const [W, H] = [stage.w, stage.h];
    const widths = LAYERS.map((l) => Math.max(state[l.key], 0.4));
    const sum = widths.reduce((p, w) => p + w, 0);
    const [x0, x1] = [W * 0.06, W * 0.94];
    const by = H * 0.62;
    const bh = H * 0.28;
    const fills = [c.fillA, c.fillY, c.fillC];
    let x = x0;
    const edges = [x0];
    LAYERS.forEach((l, i) => {
      const w = ((x1 - x0) * widths[i]) / sum;
      ctx.fillStyle = fills[i];
      ctx.fillRect(x, by, w, bh);
      line(ctx, x, by, x, by + bh, { color: c.ink, width: 3 });
      if (state[l.key] > 0) label(ctx, `${l.name} ${state[l.key]} cm`, x + w / 2, by + bh / 2, c, { size: 10, bounds: stage, patch: false });
      x += w;
      edges.push(x);
    });
    line(ctx, x1, by, x1, by + bh, { color: c.ink, width: 3 });
    // temperature profile: drops by R_i/R_total of dT across layer i
    const r = R(state);
    const rt = total(state);
    const [ty0, ty1] = [H * 0.1, H * 0.52];
    const py = (T) => ty1 - (T / state.dT) * (ty1 - ty0);
    let T = state.dT;
    ctx.beginPath();
    ctx.moveTo(edges[0], py(T));
    r.forEach((ri, i) => {
      T -= (ri / rt) * state.dT;
      ctx.lineTo(edges[i + 1], py(T));
    });
    ctx.strokeStyle = c.a;
    ctx.lineWidth = 4;
    ctx.stroke();
    line(ctx, x0, ty1, x1, ty1, { color: c.ink, width: 2 });
    label(ctx, `inside +${state.dT} K`, x0 + 4, ty0 - 8, c, { size: 11, align: 'left', bounds: stage, patch: false });
    label(ctx, 'outside', x1 - 4, ty1 + 12, c, { size: 11, align: 'right', bounds: stage, patch: false });
  },
  controls: [
    { title: 'Stack the layers' },
    { key: 'dT', label: 'Inside − outside ΔT (K)', min: 10, max: 40, step: 5 },
    { key: 'a', label: 'Brick thickness (cm)', min: 5, max: 30, step: 5 },
    { key: 'b', label: 'Foam thickness (cm)', min: 0, max: 10, step: 1 },
    { key: 'c', label: 'Plaster thickness (cm)', min: 1, max: 5, step: 1 },
    { readout: [
      ['R brick', (s) => fixed(R(s)[0], 3)],
      ['R foam', (s) => fixed(R(s)[1], 3)],
      ['R plaster', (s) => fixed(R(s)[2], 3)],
      ['Total R', (s) => fixed(total(s), 3)],
      ['Heat per m²', (s) => `${fixed(q(s), 1)} W`],
    ] },
  ],
  tex: (s) => `\\dfrac{H}{A}=\\dfrac{\\Delta T}{\\sum L_i/K_i}=\\dfrac{${s.dT}}{${fixed(total(s), 3)}}=${fixed(q(s), 1)}\\ \\mathrm{W/m^2}`,
});
