import { plotTool } from '../../lib/recipes.js';
import { fixed } from '../../lib/format.js';
import { GM, RE } from './_rg.js';

const state = { v: 11.3, th: 45 };
function path(s) {
  let [x, y] = [0, RE];
  let [vx, vy] = [s.v * 1000 * Math.sin((s.th * Math.PI) / 180), s.v * 1000 * Math.cos((s.th * Math.PI) / 180)];
  const out = [[x / RE, y / RE]];
  const dt = 15;
  for (let i = 0; i < 4000; i++) {
    const r = Math.hypot(x, y);
    if (r < RE && i > 5) break;
    const a = -GM / (r * r * r);
    vx += a * x * dt;
    vy += a * y * dt;
    x += vx * dt;
    y += vy * dt;
    if (i % 20 === 0) out.push([x / RE, y / RE]);
    if (r > 14 * RE) break;
  }
  return out;
}
const energy = (s) => 0.5 * (s.v * 1000) ** 2 - GM / RE;

plotTool({
  state,
  label: 'The path of a projectile launched from the surface of the Earth at the chosen speed and angle. It either falls back or leaves on an open curve, depending only on whether the speed reaches 11.2 kilometres per second.',
  x: [-8, 8],
  y: [-2, 12],
  range: () => [[-8, 8], [-1.5, 13]],
  draw: (ctx, stage, c, plot) => {
    const earth = Array.from({ length: 73 }, (_, k) => [Math.cos((k / 72) * 2 * Math.PI), Math.sin((k / 72) * 2 * Math.PI)]);
    earth.slice(1).forEach((p, k) => plot.segment(earth[k][0], earth[k][1], p[0], p[1], { color: c.ink, width: 3 }));
    const p = path(state);
    p.slice(1).forEach((q, k) => plot.segment(p[k][0], p[k][1], q[0], q[1], { color: energy(state) >= 0 ? c.c : c.a, width: 3 }));
  },
  controls: [
    { title: 'Launch' },
    { key: 'v', label: 'Speed (km/s)', min: 6, max: 13, step: 0.1 },
    { key: 'th', label: 'Angle from the vertical (°)', min: 0, max: 85, step: 5 },
    { readout: [
      ['Escape speed √(2GM/R)', () => `${fixed(Math.sqrt((2 * GM) / RE) / 1000, 2)} km/s`],
      ['Total energy per kg', (s) => `${fixed(energy(s) / 1e6, 2)} MJ`],
      ['Result', (s) => ({ text: energy(s) >= 0 ? 'escapes' : 'falls back', good: energy(s) >= 0 })],
    ] },
  ],
  tex: () => `v_{\\text{esc}}=\\sqrt{\\dfrac{2GM}{R}}=\\sqrt{2gR}=11.2\\ \\mathrm{km/s}`,
});
