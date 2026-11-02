import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { shadeSigned, exact } from './_ig.js';

// Velocity v(t) = 4 sin(t) m/s on [0, T]. Forward motion is above the axis, backward below.
const state = { T: 5 };
const v = (t) => 4 * Math.sin(t);
const fwd = (T) => exact((t) => Math.max(v(t), 0), 0, T);
const back = (T) => exact((t) => Math.min(v(t), 0), 0, T);

const tool = createTool({
  state,
  label: 'A graph of velocity against time. The part of the curve above the axis, forward motion, is shaded green. The part below the axis, backward motion, is shaded coral. A readout compares the net displacement with the total distance travelled.',
  setup: (stage, c) => createPlot(stage, { x: [0, 6.5], y: [-5, 5], c, pad: 28 }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 't (s)', yLabel: 'v (m/s)' });
    shadeSigned(plot, c, v, 0, state.T);
    plot.fn(v, { color: c.a });
    plot.segment(state.T, -5, state.T, 5, { color: c.ink, width: 2, dash: [5, 4] });
  },
  controls: () => [
    { title: 'Drive forward, then back' },
    { key: 'T', label: 'Stop at', min: 0.1, max: 6.2, step: 0.1, format: (v2) => `${fixed(v2, 1)} s` },
    { readout: [
      ['Forward (area above)', (s) => `${fixed(fwd(s.T), 2)} m`],
      ['Backward (area below)', (s) => `${fixed(back(s.T), 2)} m`],
      ['Net displacement', (s) => `${fixed(fwd(s.T) + back(s.T), 2)} m`],
      ['Distance travelled', (s) => `${fixed(fwd(s.T) - back(s.T), 2)} m`],
    ] },
  ],
  tex: (s) => `\\int_0^{${fixed(s.T, 1)}}v\\,dt=${fixed(fwd(s.T), 2)}-${fixed(-back(s.T), 2)}=${fixed(fwd(s.T) + back(s.T), 2)}\\ \\text{m}`,
});

tool.update();
