import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { vec, fitPath, G } from '../../lib/quick.js';
import { fixed } from '../../lib/format.js';

const state = { vx: 15, h: 490, t: 5 };
const T = (s) => Math.sqrt((2 * s.h) / G);

createTool({
  state,
  label: 'The curved path of a stone thrown sideways off a high cliff. At the chosen time the stone is marked with arrows for its sideways and downward velocity.',
  setup: (stage, c) => createPlot(stage, { x: [0, 160], y: [0, 500], c }),
  draw(ctx, stage, c, plot) {
    fitPath(plot, stage, state.vx * T(state), state.h);
    plot.axes({ xLabel: 'x (m)', yLabel: 'height (m)' });
    plot.fn((x) => state.h - (G * x * x) / (2 * state.vx ** 2), { color: c.b, domain: [0, state.vx * T(state)] });
    const t = Math.min(state.t, T(state));
    plot.point(state.vx * t, state.h - 0.5 * G * t * t, { fill: c.a, r: 7 });
    const [px, py] = plot.toPx(state.vx * t, state.h - 0.5 * G * t * t);
    vec(ctx, c, px, py, state.vx * 1.2, 0, { color: c.c });
    vec(ctx, c, px, py, 0, G * t * 0.35, { color: c.a });
  },
  controls: [
    { title: 'Off the cliff' },
    { key: 'vx', label: 'Sideways speed (m/s)', min: 5, max: 40, step: 1 },
    { key: 'h', label: 'Cliff height (m)', min: 100, max: 800, step: 10 },
    { key: 't', label: 'Time t (s)', min: 0, max: 14, step: 0.5 },
    { readout: [
      ['Landing time', (s) => `${fixed(T(s), 2)} s`],
      ['Downward speed now', (s) => `${fixed(G * Math.min(s.t, T(s)), 1)} m/s`],
      ['Speed now', (s) => `${fixed(Math.hypot(s.vx, G * Math.min(s.t, T(s))), 1)} m/s`],
      ['Lands', (s) => `${fixed(s.vx * T(s), 0)} m from the base`],
    ] },
  ],
  tex: (s) => `t=\\sqrt{\\dfrac{2h}{g}}=${fixed(T(s), 2)}\\ \\mathrm{s},\\quad v=\\sqrt{v_x^2+(gt)^2}=${fixed(Math.hypot(s.vx, G * T(s)), 1)}\\ \\mathrm{m/s}`,
});
