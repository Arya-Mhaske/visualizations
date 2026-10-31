import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { createTimeline } from '../../lib/timeline.js';
import { transport } from '../../lib/sim.js';
import { fixed } from '../../lib/format.js';
import { LENGTH, V, energy, field, pulseAt } from './_superposition-math.js';

const XS = Array.from({ length: 201 }, (_, i) => (i * LENGTH) / 200);
const state = { t: 3, A1: 1, x1: 2, w1: 0.5, A2: 0.5, x2: 8, w2: 0.5, walls: 0 };
const cycle = (s) => (s.walls ? (2 * LENGTH) / V : 12);
const line = createTimeline(document.querySelector('#stage'), state, { cycle, update: () => tool.update() });
const pulses = (s) => [
  { A: s.A1, x: s.x1, w: s.w1, dir: 1 },
  { A: s.A2, x: s.x2, w: s.w2, dir: -1 },
];
const o = (s) => ({ walls: s.walls });
const ys = (s, list = pulses(s)) => XS.map((x) => field(x, s.t, list, o(s)));
const peak = (s) => {
  const values = ys(s);
  let best = 0;
  values.forEach((y, i) => { if (Math.abs(y) > Math.abs(values[best])) best = i; });
  return { y: values[best], x: XS[best] };
};
const startEnergy = (s) => energy(XS, 0, pulses(s), o(s));
const preset = (values) => () => {
  Object.assign(state, values);
  line.sync();
  tool.update();
};

const tool = createTool({
  state,
  label: 'Two graphs of a string 10 metres long. Top: the two pulses you built, each shown alone with the same ends. Bottom: the real string, which is their sum. The blue pulse starts moving right and the purple pulse moving left. The ends can be open, fixed or free.',
  setup: (stage, c) => ({
    top: createPlot(stage, { x: [0, LENGTH], y: [-1.7, 1.7], c, pad: 22, box: (g) => ({ x: 0, y: 0, w: g.w, h: g.h * 0.44 }) }),
    low: createPlot(stage, { x: [0, LENGTH], y: [-3.2, 3.2], c, pad: 22, box: (g) => ({ x: 0, y: g.h * 0.44, w: g.w, h: g.h * 0.56 }) }),
  }),
  draw(ctx, stage, c, { top, low }) {
    const [p1, p2] = pulses(state);
    const { t } = state;
    const alone = (p) => (x) => field(x, t, [p], o(state));
    top.axes({ xLabel: 'x (m)', yLabel: 'each pulse alone' });
    top.fn(alone(p1), { color: c.b });
    top.fn(alone(p2), { color: c.d });
    low.axes({ xLabel: 'x (m)', yLabel: 'the string (cm)' });
    low.fn(alone(p1), { color: c.b, width: 2, dash: [5, 5] });
    low.fn(alone(p2), { color: c.d, width: 2, dash: [5, 5] });
    low.fn((x) => field(x, t, pulses(state), o(state)), { color: c.c, width: 4 });
    const top1 = peak(state);
    low.point(top1.x, top1.y, { fill: c.a, r: 6 });
  },
  controls: [
    { title: 'Build the pulses' },
    { row: [
      { button: 'Cancel', ghost: true, onClick: preset({ A1: 1, A2: -1, x1: 2, x2: 8, w1: 0.5, w2: 0.5, walls: 0, t: 3 }) },
      { button: 'Double up', ghost: true, onClick: preset({ A1: 1, A2: 1, x1: 2, x2: 8, w1: 0.5, w2: 0.5, walls: 0, t: 3 }) },
      { button: 'Echo off a wall', ghost: true, onClick: preset({ A1: 1, A2: 0, x1: 3, x2: 8, w1: 0.5, w2: 0.5, walls: -1, t: 8 }) },
    ] },
    { key: 'walls', label: 'Both ends of the string are', options: [[0, 'Open'], [-1, 'Fixed'], [1, 'Free']] },
    { key: 'A1', label: 'Pulse 1 (blue, moves right): height', min: -1.5, max: 1.5, step: 0.25, format: (n) => `${fixed(n, 2)} cm` },
    { key: 'x1', label: 'Pulse 1 starts at', min: 1, max: 9, step: 0.5, format: (n) => `${fixed(n, 1)} m` },
    { key: 'w1', label: 'Pulse 1 width', min: 0.3, max: 1, step: 0.1, format: (n) => `${fixed(n, 1)} m` },
    { key: 'A2', label: 'Pulse 2 (purple, moves left): height', min: -1.5, max: 1.5, step: 0.25, format: (n) => `${fixed(n, 2)} cm` },
    { key: 'x2', label: 'Pulse 2 starts at', min: 1, max: 9, step: 0.5, format: (n) => `${fixed(n, 1)} m` },
    { key: 'w2', label: 'Pulse 2 width', min: 0.3, max: 1, step: 0.1, format: (n) => `${fixed(n, 1)} m` },
    { key: 't', label: 'Time, t', min: 0, max: (2 * LENGTH) / V, step: 0.05, format: (n) => `${fixed(n, 2)} s` },
    transport(line.clock),
    { readout: [
      ['Tallest point', (s) => `${fixed(peak(s).y, 2)} cm at ${fixed(peak(s).x, 1)} m`],
      ['Energy on the string, against t = 0', (s) => `${fixed((energy(XS, s.t, pulses(s), o(s)) / (startEnergy(s) || 1)) * 100, 0)} %`],
    ] },
  ],
  tex: (s) => `y = y_1 + y_2:\\quad ${fixed(Math.abs(s.A1), 2)}\\ \\text{cm},\\ ${fixed(Math.abs(s.A2), 2)}\\ \\text{cm}\\ \\Rightarrow\\ \\text{tallest } ${fixed(Math.abs(peak(s).y), 2)}\\ \\text{cm}`,
  onChange: () => line.sync(),
});

line.sync();
