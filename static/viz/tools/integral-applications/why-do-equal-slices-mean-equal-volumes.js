import { createTool } from '../../lib/tool.js';
import { poly, label } from '../../lib/draw.js';
import { num } from './_ia.js';

// Cavalieri: if every slice at the same height has the same size, the two solids have the same volume. Shear a stack of coins: each coin keeps its area.
const state = { n: 8, shear: 0, tilt: 0 };
const W = 60; // coin width (units), H = coin thickness
const H = 8;

createTool({
  state,
  label: 'A stack of coins on the left and the same coins sheared sideways on the right. Every coin keeps the same width and thickness, so the two stacks hold the same volume even though the right one leans.',
  draw(ctx, stage, c) {
    const s = Math.min(stage.w / 2.4 / (W + 80), (stage.h - 40) / (state.n * H + 10)) * 1.3;
    const base = stage.h - 20;
    const drawStack = (x0, shear) => {
      for (let i = 0; i < state.n; i++) {
        const y = base - (i + 1) * H * s;
        const dx = shear * i * H * 0.25 * s;
        ctx.fillStyle = i % 2 ? c.fillA : c.fillB;
        ctx.fillRect(x0 + dx, y, W * s, H * s);
        ctx.strokeStyle = c.ink; ctx.lineWidth = 2;
        ctx.strokeRect(x0 + dx, y, W * s, H * s);
      }
    };
    drawStack(stage.w * 0.12, 0);
    drawStack(stage.w * 0.58, state.shear);
    label(ctx, 'straight', stage.w * 0.12 + (W * s) / 2, base + 14, c, { size: 12 });
    label(ctx, 'sheared', stage.w * 0.58 + (W * s) / 2, base + 14, c, { size: 12 });
  },
  controls: [
    { title: 'Lean the stack' },
    { key: 'n', label: 'Number of coins', min: 2, max: 14, step: 1 },
    { key: 'shear', label: 'Shear', min: 0, max: 6, step: 0.25, format: (v) => v.toFixed(2) },
    { readout: [
      ['One coin: width × thickness', () => `${W} × ${H} = ${W * H}`],
      ['Straight stack total', () => num(state.n * W * H, 5)],
      ['Sheared stack total', () => num(state.n * W * H, 5)],
      ['Slant height of the sheared stack', () => num(Math.hypot(state.n * H, state.shear * (state.n - 1) * H * 0.25), 4)],
    ] },
  ],
  tex: (s) => `V=\\sum A_i\\,\\Delta h=${s.n}\\times${W * H}`,
});
