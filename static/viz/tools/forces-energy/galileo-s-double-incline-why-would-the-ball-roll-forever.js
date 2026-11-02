import { createTool } from '../../lib/tool.js';
import { line, dot, label } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';

const state = { beta: 20, mu: 0 };
const [ALPHA, H] = [35, 1];
const rad = (d) => (d * Math.PI) / 180;
// Distance along the right slope and height reached (energy balance with sliding friction).
function stop(s) {
  const cotA = 1 / Math.tan(rad(ALPHA));
  const left = Math.max(0, 1 - s.mu * cotA);
  if (s.beta === 0) return s.mu === 0 ? { never: true, h: 0, dist: Infinity } : { never: false, h: 0, dist: (H * left) / s.mu };
  const h = (H * left) / (1 + s.mu / Math.tan(rad(s.beta)));
  return { never: false, h, dist: h / Math.sin(rad(s.beta)) };
}

createTool({
  state,
  label: 'A V-shaped track. A ball starts at the top of the left slope. On a smooth right slope it climbs to the starting height, further along the slope the gentler the slope is.',
  draw(ctx, stage, c) {
    const k = stage.h * 0.45;
    const [x0, yb] = [stage.w * 0.06, stage.h * 0.82];
    const xv = x0 + (H * k) / Math.tan(rad(ALPHA));
    const r = stop(state);
    const tb = Math.tan(rad(state.beta));
    line(ctx, x0, yb - H * k, xv, yb, { color: c.ink, width: 4 });
    line(ctx, xv, yb, stage.w - 6, yb - (stage.w - 6 - xv) * tb, { color: c.ink, width: 4 });
    line(ctx, x0, yb - H * k, stage.w - 6, yb - H * k, { color: c.c, width: 1, dash: [5, 4] });
    dot(ctx, x0, yb - H * k - 8, 8, c.fillA, c.ink);
    if (!r.never) {
      const along = Math.min(r.dist * k, (stage.w - 6 - xv) / Math.cos(rad(state.beta)));
      dot(ctx, xv + along * Math.cos(rad(state.beta)), yb - along * Math.sin(rad(state.beta)) - 8, 8, c.a, c.ink);
    }
    label(ctx, r.never ? 'never stops: inertia' : `stops after ${fixed(r.dist, 2)} along the slope, at ${fixed(r.h, 2)} of the start height`, stage.w / 2, 20, c, { size: 12, bounds: stage, patch: false });
  },
  controls: [
    { title: 'The double incline' },
    { key: 'beta', label: 'Right slope (°)', min: 0, max: 45, step: 5 },
    { key: 'mu', label: 'Friction μ', min: 0, max: 0.4, step: 0.05 },
    { readout: [
      ['Height reached', (s) => (stop(s).never ? '—' : `${fixed(stop(s).h, 2)} × start`)],
      ['Distance on right slope', (s) => (stop(s).never ? 'forever' : fixed(stop(s).dist, 2))],
    ] },
  ],
  tex: (s) => (stop(s).never ? '\\text{level slope, no friction: the ball never stops}' : `h=${fixed(stop(s).h, 2)}\\,h_0`),
});
