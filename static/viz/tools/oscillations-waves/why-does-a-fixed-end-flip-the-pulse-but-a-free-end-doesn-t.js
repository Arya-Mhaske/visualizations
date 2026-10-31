import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { createTimeline } from '../../lib/timeline.js';
import { transport } from '../../lib/sim.js';
import { fixed } from '../../lib/format.js';
import { LENGTH, pulseAt, wallField, wallImage } from './_superposition-math.js';

const CYCLE = 12; // the pulse starts at 4 m, hits the wall at 6 s and is back at 4 m at 12 s
const H = 2.7; // the graphs show heights from −H to H
const REACH = 16; // the picture runs 6 m beyond the wall, where the image pulse lives
const state = { t: 5.5, mode: -1, A: 1, image: true };
const pulse = (s) => ({ A: s.A, x: 4, w: 0.55, dir: 1 });
const opts = (s) => ({ L: LENGTH, sigma: s.mode });
const end = (s, t = s.t) => wallField(LENGTH, t, pulse(s), opts(s));
const slope = (s) => (wallField(LENGTH + 1e-4, s.t, pulse(s), opts(s)) - wallField(LENGTH - 1e-4, s.t, pulse(s), opts(s))) / 2e-4;
const line = createTimeline(document.querySelector('#stage'), state, { cycle: () => CYCLE, update: () => tool.update() });

const tool = createTool({
  state,
  label: 'A pulse runs right along a string to its end at 10 metres. Beyond the end a shaded region holds an imaginary image pulse running left. The real string is the sum of the real pulse and the image, drawn only up to the end. A small graph below shows the height of the end of the string against time: flat for a fixed end, a double-height bump for a free end.',
  setup: (stage, c) => ({
    top: createPlot(stage, { x: [0, REACH], y: [-H, H], c, pad: 22, box: (g) => ({ x: 0, y: 0, w: g.w, h: g.h * 0.64 }) }),
    low: createPlot(stage, { x: [0, CYCLE], y: [-H, H], c, pad: 22, box: (g) => ({ x: 0, y: g.h * 0.64, w: g.w, h: g.h * 0.36 }) }),
  }),
  draw(ctx, stage, c, { top, low }) {
    const p = pulse(state);
    const o = opts(state);
    const { t } = state;
    top.shade(() => H, () => -H, LENGTH, REACH, c.fillY);
    top.axes({ xLabel: 'x (m)', yLabel: 'string (cm)' });
    if (state.image) {
      top.fn((x) => pulseAt(x, t, p), { color: c.b, width: 2, dash: [5, 5] });
      top.fn((x) => wallImage(x, t, p, o), { color: c.a, width: 2, dash: [5, 5] });
      top.text('image pulse', LENGTH + 3.2, 2.0, { size: 10 });
    }
    top.fn((x) => wallField(x, t, p, o), { color: c.c, width: 4, domain: [0, LENGTH] });
    if (state.mode < 0) {
      top.segment(LENGTH, -H, LENGTH, H, { color: c.ink, width: 6 });
      top.text('wall', LENGTH - 0.8, -2.0, { size: 11 });
    } else {
      top.segment(LENGTH, -H, LENGTH, H, { color: c.ink, width: 3 });
      top.point(LENGTH, end(state), { fill: c.fillY, r: 8 });
      top.text('ring on rod', LENGTH - 1.4, -2.0, { size: 11 });
    }
    low.axes({ xLabel: 't (s)', yLabel: 'height of the end' });
    low.fn((tt) => end(state, tt), { color: c.c, width: 3 });
    low.point(t, end(state), { fill: c.a, r: 6 });
  },
  controls: [
    { title: 'Reflect a pulse' },
    { key: 'mode', label: 'The end of the string is', options: [[-1, 'Fixed to a wall'], [1, 'A ring on a rod']] },
    { key: 't', label: 'Time, t', min: 0, max: CYCLE, step: 0.05, format: (n) => `${fixed(n, 2)} s` },
    transport(line.clock),
    { key: 'A', label: 'Height of pulse', min: 0.5, max: 1.2, step: 0.1, format: (n) => `${fixed(n, 1)} cm` },
    { key: 'image', label: 'Show the image pulse', toggle: true },
    { readout: [
      ['Height of the end', (s) => `${fixed(end(s), 2)} cm`],
      ['Slope at the end', (s) => `${fixed(slope(s), 2)} cm per m`],
      ['The reflected pulse is', (s) => (s.mode < 0 ? 'upside down' : 'the same way up')],
    ] },
  ],
  tex: (s) => `y(L,t) = y_{\\text{in}} + y_{\\text{image}} = ${fixed(pulseAt(LENGTH, s.t, pulse(s)), 2)} + (${fixed(wallImage(LENGTH, s.t, pulse(s), opts(s)), 2)}) = ${fixed(end(s), 2)}\\ \\text{cm}`,
  onChange: () => line.sync(),
});

line.sync();
