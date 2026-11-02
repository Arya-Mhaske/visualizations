import { createTool } from '../../lib/tool.js';
import { line, dot, poly, label } from '../../lib/draw.js';
import { forceUcCm } from './_coulomb.js';

// 64 field lines leave a charge through a 1 × 1 window at distance 1. At distance r they spread over r² squares.
const state = { r: 2, q: 4 };
const F = (s) => forceUcCm(s.q, 1, s.r * 5); // force on a 1 µC test charge, unit distance = 5 cm

createTool({
  state,
  label: 'Left: a charge sends field lines through a one-unit window at distance 1 and on to a wall at distance r. Right: the wall seen from the front, with the same 64 line ends spread over r squared squares. The more the wall is moved away, the thinner the lines, and the force on a test charge falls in the same way.',
  draw(ctx, stage, c) {
    const [W, H] = [stage.w, stage.h];
    const u = Math.min((W * 0.56) / 5.4, (H * 0.9) / 5);
    const [x0, y0, r] = [W * 0.05, H / 2, state.r];
    const sx = x0 + r * u;
    poly(ctx, [[x0, y0], [sx, y0 - (r * u) / 2], [sx, y0 + (r * u) / 2]], { fill: c.fillY, stroke: c.ink, width: 1.5 });
    line(ctx, x0 + u, y0 - u / 2, x0 + u, y0 + u / 2, { color: c.b, width: 5 });
    line(ctx, sx, y0 - (r * u) / 2, sx, y0 + (r * u) / 2, { color: c.ink, width: 4 });
    dot(ctx, x0, y0, 7, c.a, c.ink);
    label(ctx, 'charge', x0, y0 - 18, c, { size: 11, bounds: stage, patch: false });
    label(ctx, `r = ${r}`, sx, y0 + (r * u) / 2 + 14, c, { size: 11, bounds: stage, patch: false });
    const g = (W * 0.32) / 5;
    const gx = W * 0.64 + (5 - r) * g * 0.5;
    const gy = y0 - (r * g) / 2;
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 3;
    ctx.strokeRect(gx, gy, r * g, r * g);
    for (let i = 1; i < r; i++) {
      line(ctx, gx + i * g, gy, gx + i * g, gy + r * g, { color: c.grid, width: 1 });
      line(ctx, gx, gy + i * g, gx + r * g, gy + i * g, { color: c.grid, width: 1 });
    }
    for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) dot(ctx, gx + ((i + 0.5) / 8) * r * g, gy + ((j + 0.5) / 8) * r * g, 2.2, c.a, c.ink, 0.5);
    label(ctx, `${r * r} squares`, gx + (r * g) / 2, gy + r * g + 14, c, { size: 11, bounds: stage, patch: false });
  },
  controls: [
    { title: 'Move the wall away' },
    { key: 'r', label: 'Distance r (units of 5 cm)', min: 1, max: 5, step: 1 },
    { key: 'q', label: 'Charge Q (µC)', min: 1, max: 8, step: 1 },
    { readout: [
      ['Lines per square', (s) => `64 ÷ ${s.r * s.r} = ${(64 / (s.r * s.r)).toFixed(1)}`],
      ['Force on 1 µC', (s) => `${F(s).toFixed(2)} N`],
      ['Compared with r = 1', (s) => `1/${s.r * s.r}`],
    ] },
  ],
  tex: (s) => `F=\\dfrac{1}{4\\pi\\varepsilon_0}\\dfrac{q_1q_2}{r^{2}}=\\dfrac{9\\times10^{9}\\times ${s.q}\\times10^{-6}\\times10^{-6}}{(${(s.r * 0.05).toFixed(2)})^{2}}=${F(s).toFixed(2)}\\ \\mathrm{N}`,
});
