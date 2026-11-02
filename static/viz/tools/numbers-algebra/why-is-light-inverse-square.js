import { createTool } from '../../lib/tool.js';
import { line, dot, poly, label } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';

const state = { r: 2, P: 100 };

createTool({
  state,
  label: 'Left: a lamp sends light through a one-metre-square window at 1 m, and onto a wall at distance r. Right: the wall seen from the front, divided into square metres. The same light covers r squared squares, so each is dimmer.',
  draw(ctx, stage, c) {
    const [W, H] = [stage.w, stage.h];
    const u = Math.min((W * 0.56) / 5.4, (H * 0.9) / 5);
    const [x0, y0, r] = [W * 0.05, H / 2, state.r];
    const sx = x0 + r * u;
    poly(ctx, [[x0, y0], [sx, y0 - (r * u) / 2], [sx, y0 + (r * u) / 2]], { fill: c.fillY, stroke: c.ink, width: 1.5 });
    line(ctx, x0 + u, y0 - u / 2, x0 + u, y0 + u / 2, { color: c.b, width: 5 });
    for (let i = 0; i <= r; i++) line(ctx, sx - 4, y0 - (r * u) / 2 + i * u, sx + 4, y0 - (r * u) / 2 + i * u, { color: c.ink, width: 2 });
    line(ctx, sx, y0 - (r * u) / 2, sx, y0 + (r * u) / 2, { color: c.ink, width: 4 });
    dot(ctx, x0, y0, 7, c.a, c.ink);
    label(ctx, 'lamp', x0, y0 - 18, c, { size: 11, bounds: stage, patch: false });
    label(ctx, '1 m', x0 + u, y0 - u / 2 - 11, c, { size: 11, color: c.b, bounds: stage, patch: false });
    label(ctx, `${r} m`, sx, y0 + (r * u) / 2 + 14, c, { size: 11, bounds: stage, patch: false });
    // front view of the wall
    const g = (W * 0.32) / 5;
    const gx = W * 0.64 + (5 - r) * g * 0.5;
    const gy = y0 - (r * g) / 2;
    ctx.save();
    ctx.globalAlpha = 0.15 + 0.85 / (r * r);
    ctx.fillStyle = c.a;
    ctx.fillRect(gx, gy, r * g, r * g);
    ctx.restore();
    for (let i = 0; i <= r; i++) {
      line(ctx, gx + i * g, gy, gx + i * g, gy + r * g, { color: c.ink, width: i === 0 || i === r ? 3 : 1 });
      line(ctx, gx, gy + i * g, gx + r * g, gy + i * g, { color: c.ink, width: i === 0 || i === r ? 3 : 1 });
    }
    label(ctx, `${r * r} squares`, gx + (r * g) / 2, gy + r * g + 15, c, { size: 11, bounds: stage, patch: false });
    label(ctx, 'same light', gx + (r * g) / 2, gy - 12, c, { size: 11, bounds: stage, patch: false });
  },
  controls: [
    { title: 'Move the wall' },
    { key: 'r', label: 'Distance r (m)', min: 1, max: 5, step: 1 },
    { key: 'P', label: 'Lamp power P (W)', min: 20, max: 200, step: 20 },
    { readout: [
      ['Wall squares', (s) => `${s.r * s.r} m²`],
      ['Light per m²', (s) => `1/${s.r * s.r} of the 1 m window`],
      ['Sphere area 4πr²', (s) => `${fixed(4 * Math.PI * s.r * s.r, 1)} m²`],
      ['Intensity I', (s) => `${fixed(s.P / (4 * Math.PI * s.r * s.r), 2)} W/m²`],
    ] },
  ],
  tex: (s) => `I=\\dfrac{P}{4\\pi r^{2}}=\\dfrac{${s.P}}{4\\pi(${s.r})^{2}}=${fixed(s.P / (4 * Math.PI * s.r * s.r), 2)}\\ \\mathrm{W/m^2}`,
});
