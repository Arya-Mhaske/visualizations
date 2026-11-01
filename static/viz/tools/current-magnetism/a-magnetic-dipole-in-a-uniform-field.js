import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { createSim, transport } from '../../lib/sim.js';
import { arrow, dot, label, line } from '../../lib/draw.js';
import { fixed, sig } from '../../lib/format.js';
import { smallPeriod } from './_magnetism-matter-math.js';

const state = { m: 0.5, B: 0.5, I: 0.05, theta0: 120 };
const rad = (d) => (d * Math.PI) / 180;
const sim = createSim(document.querySelector('#stage'), {
  init: () => ({ t: 0, y: [rad(state.theta0), 0] }),
  deriv: (t, y) => [y[1], -((state.m * state.B) / state.I) * Math.sin(y[0])],
  dt: 1 / 240,
  onFrame: () => tool.update(),
});
const theta = () => sim.state.y[0];
const omega = () => sim.state.y[1];
const U = () => -state.m * state.B * Math.cos(theta());
const K = () => 0.5 * state.I * omega() ** 2;

const tool = createTool({
  state,
  label: 'Top: a small magnet pivoted in a uniform field pointing right, swinging about the field direction. Bottom: its potential energy against angle, a well with a coral point rolling in it, and a dashed line for its total energy.',
  setup: (stage, c) => createPlot(stage, { x: [-180, 180], y: [-1.15, 1.15], c, pad: 30, ticks: 'auto', box: (g) => ({ x: 0, y: g.h * 0.45, w: g.w, h: g.h * 0.55 }) }),
  draw(ctx, stage, c, plot) {
    const cx = stage.w / 2;
    const cy = stage.h * 0.22;
    const L = Math.min(stage.w * 0.3, stage.h * 0.17);
    for (const k of [-1, 1]) arrow(ctx, 16, cy + k * L * 0.9, 16 + stage.w * 0.16, cy + k * L * 0.9, { color: c.grid, width: 2, head: 8 });
    label(ctx, 'B', 16 + stage.w * 0.08, cy - L * 0.9 - 12, c, { color: c.grid, size: 12 });
    const t = theta();
    const nx = Math.cos(t) * L;
    const ny = -Math.sin(t) * L;
    line(ctx, cx, cy, cx + nx, cy + ny, { color: c.a, width: 9 });
    line(ctx, cx, cy, cx - nx, cy - ny, { color: c.b, width: 9 });
    dot(ctx, cx, cy, 6, c.fillY, c.ink);
    label(ctx, 'N', cx + nx * 1.25, cy + ny * 1.25, c, { color: c.a, size: 12 });
    plot.axes({ xLabel: 'θ (°)', yLabel: 'U / mB' });
    plot.fn((d) => -Math.cos(rad(d)), { color: c.b, domain: [-180, 180] });
    plot.segment(-180, -Math.cos(rad(state.theta0)), 180, -Math.cos(rad(state.theta0)), { color: c.grid, dash: [6, 5] });
    let deg = ((((t * 180) / Math.PI + 180) % 360) + 360) % 360 - 180;
    plot.point(deg, -Math.cos(t), { fill: c.a, r: 8 });
  },
  controls: () => [
    { title: 'Release the magnet' },
    { key: 'm', label: 'Moment, m', min: 0.1, max: 2, step: 0.1, format: (n) => `${fixed(n, 1)} A m²` },
    { key: 'B', label: 'Field, B', min: 0.1, max: 1, step: 0.1, format: (n) => `${fixed(n, 1)} T` },
    { key: 'I', label: 'Moment of inertia, I', min: 0.01, max: 0.1, step: 0.01, format: (n) => `${fixed(n, 2)} kg m²` },
    { key: 'theta0', label: 'Release angle, θ₀', min: 10, max: 170, step: 5, format: (n) => `${n}°` },
    transport(sim),
    { readout: [
      ['Torque now', (s) => `${sig(-s.m * s.B * Math.sin(theta()), 3)} N m`],
      ['Energy U = −mB cos θ', () => `${sig(U(), 3)} J`],
      ['Kinetic energy', () => `${sig(K(), 3)} J`],
      ['Small-swing period', (s) => `${sig(smallPeriod(s.m, s.B, s.I), 3)} s`],
    ] },
  ],
  tex: (s) => `\\tau=-mB\\sin\\theta\\qquad T\\approx 2\\pi\\sqrt{\\dfrac{I}{mB}}=${sig(smallPeriod(s.m, s.B, s.I), 3)}\\ \\text{s}`,
  onChange: () => sim.reset(),
});
tool.update();
