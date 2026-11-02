import { plotTool } from '../../lib/recipes.js';

const state = { n: 7, R: 1 };
function trace(s, y0) {
  const out = [[-5, y0]];
  let [x, y] = [-5, y0];
  for (let i = 0; i < 700; i++) {
    const r2 = x * x + y * y;
    if (r2 < s.R * s.R * 0.98) break;
    const R2 = s.R * s.R;
    const u = 1 - (R2 * (x * x - y * y)) / (r2 * r2);
    const v = -(2 * R2 * x * y) / (r2 * r2);
    const sp = Math.hypot(u, v) || 1;
    x += (u / sp) * 0.04;
    y += (v / sp) * 0.04;
    out.push([x, y]);
    if (x > 5) break;
  }
  return out;
}

plotTool({
  state,
  label: 'Streamlines of fluid flowing left to right past a circular obstacle. The lines bend round it and squeeze together above and below, but none of them cross.',
  x: [-5, 5],
  y: [-3, 3],
  range: () => [[-5, 5], [-3.5, 3.5]],
  draw: (ctx, stage, c, plot) => {
    const R = state.R;
    const rim = Array.from({ length: 61 }, (_, k) => [R * Math.cos((k / 60) * 2 * Math.PI), R * Math.sin((k / 60) * 2 * Math.PI)]);
    rim.slice(1).forEach((p, k) => plot.segment(rim[k][0], rim[k][1], p[0], p[1], { color: c.ink, width: 4 }));
    for (let i = 0; i < state.n; i++) {
      const y0 = (-2.6 + (5.2 * i) / Math.max(state.n - 1, 1)) * (state.n === 1 ? 0 : 1) + (state.n === 1 ? 1.2 : 0);
      const p = trace(state, y0);
      p.slice(1).forEach((q, k) => plot.segment(p[k][0], p[k][1], q[0], q[1], { color: c.b, width: 2 }));
    }
  },
  controls: [
    { title: 'Flow past a cylinder' },
    { key: 'n', label: 'Streamlines', min: 1, max: 13, step: 2 },
    { key: 'R', label: 'Obstacle radius', min: 0.5, max: 1.5, step: 0.25 },
    { readout: [['Crossings', () => '0'], ['Why', () => 'one velocity at each point']] },
  ],
  tex: () => `\\vec v\\ \\text{is single-valued at every point}`,
});
