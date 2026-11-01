import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { arc, label, line } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { TAU, TILT_PERIOD, tiltError } from './_sine-cosine-math.js';

const state = { theta: 20, a: 0.5, b: 2 };
const rad = (d) => (d * Math.PI) / 180;

createTool({
  state,
  label: 'Top: a lattice of lines in a round window, turned by an angle theta. A square lattice looks the same after a quarter turn. Bottom: the model for how much the eye misjudges the tilt, d equals a plus b times sine of four theta, plotted over a full turn. It repeats every 90 degrees, like the lattice.',
  setup: (stage, c) => createPlot(stage, {
    x: [0, 360], y: [-6, 6], c, pad: 22, box: (g) => ({ x: 0, y: g.h * 0.52, w: g.w, h: g.h * 0.48 }),
  }),
  draw(ctx, stage, c, plot) {
    const R = Math.min(stage.w * 0.36, stage.h * 0.22);
    const [cx, cy] = [stage.w / 2, stage.h * 0.25];
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, TAU);
    ctx.clip();
    const step = R / 4.5;
    const t = rad(state.theta);
    for (let i = -10; i <= 10; i++) {
      const o = i * step;
      // one family of lines tilted by θ from vertical, and the family at right angles to it
      line(ctx, cx + o * Math.cos(t) - 2 * R * Math.sin(t), cy + o * Math.sin(t) + 2 * R * Math.cos(t), cx + o * Math.cos(t) + 2 * R * Math.sin(t), cy + o * Math.sin(t) - 2 * R * Math.cos(t), { color: c.ink, width: 2 });
      line(ctx, cx - o * Math.sin(t) - 2 * R * Math.cos(t), cy + o * Math.cos(t) - 2 * R * Math.sin(t), cx - o * Math.sin(t) + 2 * R * Math.cos(t), cy + o * Math.cos(t) + 2 * R * Math.sin(t), { color: c.ink, width: 2 });
    }
    ctx.restore();
    arc(ctx, cx, cy, R, 0, TAU, { color: c.ink, width: 3 });
    label(ctx, `turned ${state.theta}° (looks the same as ${(state.theta + TILT_PERIOD) % 360}°)`, stage.w / 2, stage.h * 0.5 - 8, c, { size: 11, bounds: stage, patch: false });
    plot.axes({ xLabel: 'θ (°)', yLabel: 'd (°)', grid: true });
    plot.fn((x) => tiltError(x, state.a, state.b), { color: c.b, width: 3 });
    [state.theta, state.theta + TILT_PERIOD, state.theta + 2 * TILT_PERIOD, state.theta + 3 * TILT_PERIOD].forEach((x, i) => {
      if (x <= 360) plot.point(x, tiltError(x, state.a, state.b), { fill: i === 0 ? c.a : c.fillA, r: i === 0 ? 7 : 5 });
    });
  },
  controls: [
    { title: 'Turn the lattice' },
    { key: 'theta', label: 'Turned by, θ', min: 0, max: 359, step: 1, format: (n) => `${n}°` },
    { key: 'a', label: 'Steady error, a (made-up)', min: -1, max: 1, step: 0.5, format: (n) => `${fixed(n, 1)}°` },
    { key: 'b', label: 'Swing, b (made-up)', min: 0.5, max: 3, step: 0.5, format: (n) => `${fixed(n, 1)}°` },
    { readout: [
      ['Error at θ', (s) => `${fixed(tiltError(s.theta, s.a, s.b), 2)}°`],
      ['Error at θ + 90°', (s) => `${fixed(tiltError(s.theta + 90, s.a, s.b), 2)}°`],
      ['Period of d', () => `${TILT_PERIOD}° = 360° ÷ 4`],
    ] },
  ],
  tex: (s) => `d=a+b\\sin 4\\theta=${fixed(s.a, 1)}+${fixed(s.b, 1)}\\sin(4\\cdot ${s.theta}^\\circ)=${fixed(tiltError(s.theta, s.a, s.b), 2)}^\\circ`,
});
