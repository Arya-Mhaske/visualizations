import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { line } from '../../lib/draw.js';
import { num } from '../derivative-applications/_da.js';

// x² + y² = L². Differentiate in t: x x′ + y y′ = 0, so y′ = −(x/y) x′. As y → 0 the ratio x/y blows up.
const L = 5;
const state = { x: 3, u: 1 };
const y = () => Math.sqrt(L * L - state.x * state.x);
const topSpeed = (x) => (x * state.u) / Math.sqrt(L * L - x * x);

createTool({
  state,
  label: 'Top: a ladder of length 5 metres leaning on a wall, with its foot pulled out at a steady speed. Bottom: the speed of the ladder top against the foot position, rising without limit as the top reaches the ground.',
  setup: (stage, c) => createPlot(stage, { x: [0, L], y: [0, 20], c, box: (s) => ({ x: 0, y: s.h * 0.5, w: s.w, h: s.h * 0.5 }) }),
  draw(ctx, stage, c, plot) {
    const h = stage.h * 0.5;
    const sc = Math.min((stage.w - 60) / L, (h - 24) / L);
    const wallX = 30;
    const floorY = h - 12;
    ctx.fillStyle = c.fillB;
    ctx.fillRect(wallX - 8, floorY - L * sc - 4, 8, L * sc + 4);
    line(ctx, wallX, floorY, wallX + L * sc + 16, floorY, { color: c.ink, width: 4 });
    line(ctx, wallX, floorY, wallX, floorY - L * sc - 4, { color: c.ink, width: 4 });
    const fx = wallX + state.x * sc;
    const ty = floorY - y() * sc;
    line(ctx, fx, floorY, wallX, ty, { color: c.a, width: 6 });
    line(ctx, wallX + 4, ty, wallX + 4, floorY, { color: c.b, width: 2, dash: [4, 4] });
    ctx.fillStyle = c.ink;
    ctx.beginPath(); ctx.arc(fx, floorY, 5, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.arc(wallX, ty, 5, 0, 7); ctx.fill();
    plot.axes({ xLabel: 'foot x (m)', yLabel: 'top speed' });
    plot.fn((x) => topSpeed(Math.min(x, L - 1e-4)), { color: c.b, width: 3, domain: [0, L - 0.0005] });
    plot.point(state.x, Math.min(19.5, topSpeed(state.x)), { fill: c.a });
  },
  controls: [
    { title: 'Pull the foot out' },
    { key: 'x', label: 'Foot distance x', min: 0.5, max: 4.95, step: 0.05, format: (v) => `${v.toFixed(2)} m` },
    { key: 'u', label: 'Foot speed dx/dt', min: 0.2, max: 2, step: 0.1, format: (v) => `${v.toFixed(1)} m/s` },
    { readout: [
      ['Height of top y', () => `${y().toFixed(3)} m`],
      ['Top speed |dy/dt|', () => `${num(topSpeed(state.x), 4)} m/s`],
      ['Ratio x / y', () => num(state.x / y(), 3)],
    ] },
  ],
  tex: (s) => `\\frac{dy}{dt}=-\\frac{x}{y}\\frac{dx}{dt}=-\\frac{${s.x.toFixed(2)}}{${y().toFixed(2)}}(${s.u.toFixed(1)})`,
});
