import { createTool } from '../../lib/tool.js';
import { line, arrow, label } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';

const MATS = { cu: ['Copper', 400], al: ['Aluminium', 237], fe: ['Iron', 80], glass: ['Glass', 1] };
const state = { mat: 'cu', n: 2, L: 50, dT: 60 };
const heat = (s) => (MATS[s.mat][1] * s.n * 1e-4 * s.dT) / (s.L / 100); // watts, lane area 1 cm²

createTool({
  state,
  label: 'A rod drawn as parallel lanes, hot at the left and cold at the right. Each lane has arrows pointing along it. A steeper temperature drop gives more arrows per lane, and more lanes give more total flow. Below, a graph shows the temperature falling in a straight line from hot to cold.',
  draw(ctx, stage, c) {
    const [W, H] = [stage.w, stage.h];
    const [x0, x1] = [W * 0.08, W * 0.92];
    const laneH = Math.min(22, (H * 0.42) / state.n);
    const top = H * 0.08;
    for (let i = 0; i < state.n; i++) {
      const y = top + i * laneH;
      for (let k = 0; k < 24; k++) {
        const t = k / 23;
        ctx.save();
        ctx.fillStyle = c.a;
        ctx.globalAlpha = 1 - t * 0.85;
        ctx.fillRect(x0 + ((x1 - x0) * k) / 24, y, (x1 - x0) / 24 + 1, laneH - 3);
        ctx.restore();
      }
      const arrows = Math.max(1, Math.round(state.dT / state.L * 2.2));
      for (let a = 0; a < arrows; a++) {
        const x = x0 + ((x1 - x0) * (a + 0.5)) / arrows;
        arrow(ctx, x - 9, y + (laneH - 3) / 2, x + 9, y + (laneH - 3) / 2, { color: c.ink, width: 2, head: 7 });
      }
    }
    line(ctx, x0, top - 3, x0, top + state.n * laneH, { color: c.ink, width: 4 });
    line(ctx, x1, top - 3, x1, top + state.n * laneH, { color: c.ink, width: 4 });
    label(ctx, `hot`, x0, top + state.n * laneH + 12, c, { size: 11, bounds: stage, patch: false });
    label(ctx, `cold`, x1, top + state.n * laneH + 12, c, { size: 11, bounds: stage, patch: false });
    // temperature graph: straight line from hot to cold over the length L
    const [gx0, gx1, gy0, gy1] = [W * 0.14, W * 0.9, H * 0.62, H * 0.92];
    line(ctx, gx0, gy0, gx0, gy1, { color: c.ink, width: 2 });
    line(ctx, gx0, gy1, gx1, gy1, { color: c.ink, width: 2 });
    line(ctx, gx0, gy0 + 4, gx1, gy1 - 4, { color: c.a, width: 4 });
    label(ctx, 'T', gx0 - 8, gy0, c, { size: 11, bounds: stage, patch: false });
    label(ctx, `length L = ${state.L} cm`, (gx0 + gx1) / 2, gy1 + 10, c, { size: 11, bounds: stage, patch: false });
    label(ctx, `slope = ΔT/L = ${fixed(state.dT / (state.L / 100), 0)} K/m`, (gx0 + gx1) / 2, gy0 - 4, c, { size: 11, bounds: stage, patch: false });
  },
  controls: [
    { title: 'Build a rod' },
    { key: 'dT', label: 'Temperature difference ΔT (K)', min: 10, max: 100, step: 10 },
    { key: 'L', label: 'Length L (cm)', min: 10, max: 100, step: 10 },
    { key: 'n', label: 'Lanes: area A (cm²)', min: 1, max: 5, step: 1 },
    { key: 'mat', label: 'Material K', options: [['cu', 'Cu'], ['al', 'Al'], ['fe', 'Fe'], ['glass', 'Glass']] },
    { readout: [
      ['K (W/m·K)', (s) => MATS[s.mat][1]],
      ['Gradient ΔT/L', (s) => `${fixed(s.dT / (s.L / 100), 0)} K/m`],
      ['Heat flow H', (s) => `${fixed(heat(s), 3)} W`],
    ] },
  ],
  tex: (s) => `H=\\dfrac{KA\\,\\Delta T}{L}=\\dfrac{${MATS[s.mat][1]}\\times ${fixed(s.n * 1e-4, 4)}\\times ${s.dT}}{${fixed(s.L / 100, 2)}}=${fixed(heat(s), 3)}\\ \\mathrm{W}`,
});
