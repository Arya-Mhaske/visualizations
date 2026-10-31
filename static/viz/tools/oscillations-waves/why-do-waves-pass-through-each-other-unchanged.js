import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { createTimeline } from '../../lib/timeline.js';
import { transport } from '../../lib/sim.js';
import { fixed } from '../../lib/format.js';
import { LENGTH, field, pulseAt } from './_superposition-math.js';

const CYCLE = 7; // pulse 1 runs from 1.5 m to 8.5 m, pulse 2 the other way
const XS = Array.from({ length: 201 }, (_, i) => (i * LENGTH) / 200);
const state = { t: 3, A1: 1, A2: 1, probe: 5 };
const pulses = (s) => [
  { A: s.A1, x: 1.5, w: 0.55, dir: 1 },
  { A: s.A2, x: 8.5, w: 0.55, dir: -1 },
];
const parts = (s) => {
  const [p1, p2] = pulses(s);
  return [pulseAt(s.probe, s.t, p1), pulseAt(s.probe, s.t, p2)];
};
const total = (s) => field(s.probe, s.t, pulses(s));
const tallest = (s) => Math.max(...XS.map((x) => Math.abs(field(x, s.t, pulses(s)))));
const line = createTimeline(document.querySelector('#stage'), state, { cycle: () => CYCLE, update: () => tool.update() });

const tool = createTool({
  state,
  label: 'Three stacked graphs of a string, 0 to 10 metres. Top: pulse 1 alone, moving right. Middle: pulse 2 alone, moving left. Bottom: the real string, which is the two added point by point, with the two pulses dashed behind it. A coral marker at one point of the string shows its three heights.',
  setup: (stage, c) => [0, 1, 2].map((row) => createPlot(stage, {
    x: [0, LENGTH], y: row === 2 ? [-2.4, 2.4] : [-1.6, 1.6], c, pad: 22,
    box: (g) => ({ x: 0, y: g.h * (row === 0 ? 0 : row === 1 ? 0.27 : 0.54), w: g.w, h: g.h * (row === 2 ? 0.46 : 0.27) }),
  })),
  draw(ctx, stage, c, [one, two, sum]) {
    const [p1, p2] = pulses(state);
    const { probe, t } = state;
    const [y1, y2] = parts(state);
    one.axes({ xLabel: 'x (m)', yLabel: 'pulse 1 alone' });
    one.fn((x) => pulseAt(x, t, p1), { color: c.b });
    two.axes({ xLabel: 'x (m)', yLabel: 'pulse 2 alone' });
    two.fn((x) => pulseAt(x, t, p2), { color: c.d });
    sum.axes({ xLabel: 'x (m)', yLabel: 'the real string (cm)' });
    sum.fn((x) => pulseAt(x, t, p1), { color: c.b, width: 2, dash: [5, 5] });
    sum.fn((x) => pulseAt(x, t, p2), { color: c.d, width: 2, dash: [5, 5] });
    sum.fn((x) => field(x, t, pulses(state)), { color: c.c, width: 4 });
    for (const [plot, y, hi] of [[one, y1, 1.6], [two, y2, 1.6], [sum, y1 + y2, 2.4]]) {
      plot.segment(probe, -hi, probe, hi, { color: c.a, width: 1, dash: [3, 3] });
      plot.point(probe, y, { fill: c.a, r: 6 });
    }
  },
  controls: [
    { title: 'Send two pulses at each other' },
    { key: 't', label: 'Time, t', min: 0, max: CYCLE, step: 0.05, format: (n) => `${fixed(n, 2)} s` },
    transport(line.clock),
    { key: 'A1', label: 'Height of pulse 1', min: -1.5, max: 1.5, step: 0.25, format: (n) => `${fixed(n, 2)} cm` },
    { key: 'A2', label: 'Height of pulse 2', min: -1.5, max: 1.5, step: 0.25, format: (n) => `${fixed(n, 2)} cm` },
    { key: 'probe', label: 'Follow the string at', min: 0.5, max: 9.5, step: 0.25, format: (n) => `${fixed(n, 2)} m` },
    { readout: [
      ['Pulse 1 alone, there', (s) => `${fixed(parts(s)[0], 2)} cm`],
      ['Pulse 2 alone, there', (s) => `${fixed(parts(s)[1], 2)} cm`],
      ['The string, there', (s) => `${fixed(total(s), 2)} cm`],
      ['Peaks are at', (s) => `${fixed(1.5 + s.t, 2)} m and ${fixed(8.5 - s.t, 2)} m`],
      ['Tallest point of the string', (s) => `${fixed(tallest(s), 2)} cm`],
    ] },
  ],
  tex: (s) => `y(x,t) = y_1 + y_2 = ${fixed(parts(s)[0], 2)} + (${fixed(parts(s)[1], 2)}) = ${fixed(total(s), 2)}\\ \\text{cm}`,
  onChange: () => line.sync(),
});

line.sync();
