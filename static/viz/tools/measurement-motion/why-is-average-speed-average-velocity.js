import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { dot, label, line } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { averageSpeed, averageVelocity, roundTrip, tripTime } from './_motion-in-a-straight-line-math.js';

const state = { d: 2.5, out: 5, back: 7.5, minutes: 40 };
const hours = (s) => s.minutes / 60;
const total = (s) => tripTime(s.d, s.out, s.back) * 60;
const now = (s) => roundTrip(s.d, s.out, s.back, Math.min(hours(s), total(s) / 60));

createTool({
  state,
  label: 'The walk to a market and back, drawn as a position graph above a road. The walker returns home, so displacement falls to zero while the path keeps growing.',
  setup: (stage, c) => createPlot(stage, {
    x: [0, 60], y: [0, 5], c, box: (s) => ({ x: 0, y: 0, w: s.w, h: s.h * 0.74 }),
  }),
  draw(ctx, stage, c, plot) {
    const end = total(state);
    plot.setRange([0, Math.max(end * 1.1, 20)], [0, state.d * 1.3]);
    plot.axes({ xLabel: 't (min)', yLabel: 'x (km)' });
    plot.fn((m) => roundTrip(state.d, state.out, state.back, m / 60).position, { color: c.ink, domain: [0, end] });
    plot.point(Math.min(state.minutes, end), now(state).position);
    const y = stage.h * 0.86;
    const [x0, x1] = [stage.w * 0.1, stage.w * 0.88];
    const walker = x0 + (now(state).position / state.d) * (x1 - x0);
    line(ctx, x0, y, x1, y, { color: c.grid, width: 8 });
    label(ctx, 'home', x0, y + 16, c, { size: 11, bounds: stage });
    label(ctx, 'market', x1, y + 16, c, { size: 11, bounds: stage });
    dot(ctx, walker, y, 8, c.a, c.ink);
  },
  controls: [
    { title: 'Walk to the market and back' },
    { key: 'minutes', label: 'Time since leaving', min: 1, max: 80, step: 1, format: (v) => `${v} min` },
    { key: 'd', label: 'Distance to the market', min: 1, max: 4, step: 0.5, format: (v) => `${fixed(v, 1)} km` },
    { key: 'out', label: 'Speed going', min: 3, max: 8, step: 0.5, format: (v) => `${fixed(v, 1)} km/h` },
    { key: 'back', label: 'Speed returning', min: 3, max: 10, step: 0.5, format: (v) => `${fixed(v, 1)} km/h` },
    { readout: [
      ['Path length', (s) => `${fixed(now(s).path, 2)} km`],
      ['Displacement', (s) => `${fixed(now(s).position, 2)} km`],
      ['Average speed', (s) => `${fixed(averageSpeed(now(s).path, Math.min(hours(s), total(s) / 60)), 2)} km/h`],
      ['|Average velocity|', (s) => `${fixed(averageVelocity(now(s).position, Math.min(hours(s), total(s) / 60)), 2)} km/h`],
      ['Whole trip takes', (s) => `${fixed(total(s), 1)} min`],
    ] },
  ],
  tex: (s) => `\\frac{\\text{path}}{t} = ${fixed(averageSpeed(now(s).path, Math.min(hours(s), total(s) / 60)), 2)} \\;\\geq\\; \\frac{|\\text{displacement}|}{t} = ${fixed(averageVelocity(now(s).position, Math.min(hours(s), total(s) / 60)), 2)}`,
});
