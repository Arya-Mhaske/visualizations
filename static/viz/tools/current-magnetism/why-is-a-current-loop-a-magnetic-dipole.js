import { createTool } from '../../lib/tool.js';
import { arrow, label } from '../../lib/draw.js';
import { fixed, sig } from '../../lib/format.js';
import { MU0 } from './_sources-of-magnetic-field-math.js';
import { dipoleMoment, dipoleField, loopFieldAt, angleBetween } from './_loops-meters-math.js';

// Lengths are in units of the loop radius R. The loop is seen edge-on: its wires cut the page at (0, ±1).
const R_M = 0.05; // m
const state = { W: 2, N: 1, I: 2, show: 'both' };
const GRID = 11;
let cache = { key: '', cells: [] };

function cells(W) {
  if (cache.key !== W) {
    const list = [];
    for (let i = 0; i < GRID; i++) {
      for (let j = 0; j < GRID; j++) {
        const x = -W + (2 * W * i) / (GRID - 1);
        const y = -W + (2 * W * j) / (GRID - 1);
        if (Math.hypot(x, y) < 0.8) continue;
        const loop = loopFieldAt(1, 1, x, y);
        const dip = dipoleField(Math.PI, x, y); // I = 1 A, A = π R², R = 1
        list.push({ x, y, loop, dip });
      }
    }
    cache = { key: W, cells: list };
  }
  return cache.cells;
}
const worst = (W) => Math.max(...cells(W).map((c) => angleBetween(c.loop, c.dip)));

const tool = createTool({
  state,
  label: 'A map of small arrows showing the magnetic field of a circular loop seen edge-on, drawn in coral. Blue arrows show the field of an ideal bar magnet or dipole of the same moment. Close to the loop the arrows differ. Far away they lie on top of each other.',
  draw(ctx, stage, c) {
    const s = Math.min(stage.w, stage.h) / (2 * state.W + 1.2);
    const cx = stage.w / 2;
    const cy = stage.h / 2;
    // the loop: two wire cross-sections
    for (const sign of [1, -1]) {
      ctx.beginPath();
      ctx.arc(cx, cy - sign * s, 9, 0, Math.PI * 2);
      ctx.fillStyle = c.fillY;
      ctx.fill();
      ctx.strokeStyle = c.ink;
      ctx.lineWidth = 3;
      ctx.stroke();
    }
    const list = cells(state.W);
    const ref = Math.hypot(...loopFieldAt(1, 1, 2, 0));
    const len = Math.min(26, (Math.min(stage.w, stage.h) / GRID) * 0.8);
    for (const cell of list) {
      const px = cx + cell.x * s;
      const py = cy - cell.y * s;
      const draw = (B, color, width) => {
        const m = Math.hypot(...B);
        const L = (len * Math.sqrt(m / (m + ref * 0.6))) * 1.1;
        arrow(ctx, px - (B[0] / m) * L * 0.5, py + (B[1] / m) * L * 0.5, px + (B[0] / m) * L * 0.5, py - (B[1] / m) * L * 0.5, { color, width, head: 7 });
      };
      if (state.show !== 'dipole') draw(cell.loop, c.a, 3);
      if (state.show !== 'loop') draw(cell.dip, c.b, 2);
    }
    label(ctx, 'moment m →', cx, cy + 3, c, { color: c.ink, size: 11, patch: false });
  },
  controls: () => [
    { title: 'Zoom out from the loop' },
    { key: 'W', label: 'Width of the picture', min: 2, max: 8, step: 1, format: (n) => `${n * 2} R` },
    { key: 'N', label: 'Turns, N', min: 1, max: 10, step: 1 },
    { key: 'I', label: 'Current, I', min: 1, max: 5, step: 0.5, format: (n) => `${fixed(n, 1)} A` },
    { key: 'show', label: 'Show', options: [['both', 'Both'], ['loop', 'Loop'], ['dipole', 'Dipole']] },
    { readout: [
      ['Moment, m = NIA', (s) => `${sig(dipoleMoment(s.N, s.I, Math.PI * R_M * R_M), 3)} A m²`],
      ['Largest angle between the two', (s) => `${fixed(worst(s.W), 1)}°`],
    ] },
  ],
  tex: (s) => `m=NIA=${s.N}\\times ${fixed(s.I, 1)}\\times ${sig(Math.PI * R_M * R_M, 3)}=${sig(dipoleMoment(s.N, s.I, Math.PI * R_M * R_M), 3)}\\ \\text{A m}^2`,
});
void MU0;
tool.update();
