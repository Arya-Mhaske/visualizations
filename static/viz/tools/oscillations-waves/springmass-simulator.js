import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { createClock, transport } from '../../lib/sim.js';
import { arrow, label, line, spring } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { energies, omega, periodOf, totalEnergy } from './_force-law-math.js';

const state = { k: 4, m: 1, A: 1.5, arrows: true };
const END = 12;
const clock = createClock(document.querySelector('#stage'), { onFrame: () => tool.update() });
const now = (s, u = clock.state.t) => energies(s.k, s.m, s.A, u);

const tool = createTool({
  state,
  label: 'A mass on a spring that you can stiffen, load and pull further. Arrows can show its velocity and the spring force, and a graph traces its position against time.',
  setup: (stage, c) => createPlot(stage, {
    x: [0, END], y: [-2.5, 2.5], c, box: (s) => ({ x: 0, y: s.h * 0.36, w: s.w, h: s.h * 0.64 }),
  }),
  draw(ctx, stage, c, plot) {
    const [wall, mid, y] = [14, stage.w * 0.5, stage.h * 0.2];
    const unit = (stage.w * 0.32) / 2.5;
    const e = now(state);
    const x = mid + e.x * unit;
    const half = 10 + state.m * 5;
    line(ctx, wall, y - 26, wall, y + 26, { color: c.ink, width: 5 });
    line(ctx, mid, y + 28, mid, y + 44, { color: c.ink, width: 2 });
    label(ctx, 'x = 0', mid, y + 54, c, { size: 10, bounds: stage });
    spring(ctx, wall, x - half, y, { color: c.ink, width: 1 + state.k * 0.3 });
    ctx.fillStyle = c.a;
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 3;
    ctx.fillRect(x - half, y - half, half * 2, half * 2);
    ctx.strokeRect(x - half, y - half, half * 2, half * 2);
    if (state.arrows) {
      const long = stage.w * 0.18;
      const vmax = state.A * omega(state.k, state.m);
      const fmax = state.k * state.A;
      arrow(ctx, x, y - half - 12, x + (e.v / vmax) * long, y - half - 12, { color: c.b, width: 4 });
      arrow(ctx, x, y + half + 12, x + (-state.k * e.x / fmax) * long, y + half + 12, { color: c.d, width: 4 });
      label(ctx, 'v', Math.max(24, x - half - 14), y - half - 12, c, { size: 11, color: c.b, bounds: stage });
      label(ctx, 'F', Math.max(24, x - half - 14), y + half + 12, c, { size: 11, color: c.d, bounds: stage });
    }
    plot.axes({ xLabel: 't (s)', yLabel: 'x (m)' });
    plot.fn((u) => now(state, u).x, { color: c.a });
    const t = clock.state.t % END;
    plot.segment(t, -2.5, t, 2.5, { color: c.ink, width: 1 });
    plot.point(t, now(state, t).x, { r: 6 });
  },
  controls: [
    { title: 'Set up the spring and mass' },
    { key: 'k', label: 'Spring stiffness, k', min: 1, max: 16, step: 1, format: (n) => `${n} N/m` },
    { key: 'm', label: 'Mass, m', min: 0.5, max: 4, step: 0.5, format: (n) => `${fixed(n, 1)} kg` },
    { key: 'A', label: 'Amplitude, A', min: 0.5, max: 2.5, step: 0.5, format: (n) => `${fixed(n, 1)} m` },
    { key: 'arrows', label: 'Show v and F arrows', toggle: true },
    transport(clock),
    { readout: [
      ['Time', () => `${fixed(clock.state.t % END, 2)} s`],
      ['x', (s) => `${fixed(now(s).x, 3)} m`],
      ['Angular frequency, ω', (s) => `${fixed(omega(s.k, s.m), 2)} rad/s`],
      ['Period, T', (s) => `${fixed(periodOf(s.k, s.m), 2)} s`],
      ['Frequency, f', (s) => `${fixed(1 / periodOf(s.k, s.m), 2)} Hz`],
      ['Top speed, Aω', (s) => `${fixed(s.A * omega(s.k, s.m), 2)} m/s`],
      ['Total energy, ½kA²', (s) => `${fixed(totalEnergy(s.k, s.A), 2)} J`],
    ] },
  ],
  tex: (s) => `T = 2\\pi\\sqrt{\\frac{m}{k}} = 2\\pi\\sqrt{\\frac{${fixed(s.m, 1)}}{${s.k}}} = ${fixed(periodOf(s.k, s.m), 2)}\\ \\text{s}`,
});

clock.step(1);
