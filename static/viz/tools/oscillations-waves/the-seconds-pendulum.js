import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { createClock, transport } from '../../lib/sim.js';
import { dot, label, line } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { exactPeriod, lengthFor, toRad } from './_pendulum-math.js';

const PLACES = [[9.8, 'Textbook'], [9.78, 'Equator'], [9.83, 'Pole'], [1.62, 'Moon']];
const state = { L: 0.5, g: 9.8, ruler: false };
const END = 8;
const clock = createClock(document.querySelector('#stage'), { onFrame: () => tool.update() });
const AMP = toRad(5);
const T = (s) => exactPeriod(s.L, AMP, s.g);
const angle = (s, t) => AMP * Math.cos((2 * Math.PI * t) / T(s));
const now = () => clock.state.t % END;
// A tick is each pass through the bottom: at T/4, 3T/4, 5T/4 ...
const ticks = () => Math.max(0, Math.floor((clock.state.t - T(state) / 4) / (T(state) / 2)) + 1);

const tool = createTool({
  state,
  label: 'A short pendulum with a graph of its swing against time. Grid lines mark each second. A seconds pendulum crosses the middle exactly on every grid line.',
  setup: (stage, c) => createPlot(stage, { x: [0, END], y: [-0.12, 0.12], c, box: (s) => ({ x: 0, y: s.h * 0.5, w: s.w, h: s.h * 0.5 }) }),
  draw(ctx, stage, c, plot) {
    const pivot = [stage.w / 2, 14];
    const scale = (stage.h * 0.4) / 1.5;
    const len = state.L * scale;
    const th = angle(state, now());
    const [bx, by] = [pivot[0] + len * Math.sin(th), pivot[1] + len * Math.cos(th)];
    line(ctx, ...pivot, bx, by, { color: c.ink, width: 3 });
    dot(ctx, bx, by, 12, c.a, c.ink);
    if (state.ruler) {
      line(ctx, 24, 14, 24, 14 + len, { color: c.c, width: 4 });
      label(ctx, `${fixed(state.L, 2)} m`, 52, 14 + len / 2, c, { size: 11, color: c.c, bounds: stage });
    }
    label(ctx, `tick count: ${ticks()}`, stage.w - 12, 14, c, { size: 12, align: 'right', bounds: stage });
    plot.axes({ xLabel: 't (s)', yLabel: 'angle' });
    for (let s = 1; s < END; s++) plot.segment(s, -0.12, s, 0.12, { color: c.c, width: 2, dash: [3, 4] });
    plot.fn((u) => angle(state, u), { color: c.a });
    plot.segment(now(), -0.12, now(), 0.12, { color: c.ink, width: 1 });
    plot.point(now(), angle(state, now()), { r: 6 });
  },
  controls: [
    { title: 'Tune the pendulum' },
    { key: 'L', label: 'String length', min: 0.1, max: 1.5, step: 0.01, format: (n) => `${fixed(n, 2)} m` },
    { key: 'g', label: 'Where are you?', options: PLACES.map(([g, name]) => [g, name]) },
    { key: 'ruler', label: 'Show the length', toggle: true },
    transport(clock),
    { readout: [
      ['Period, T', (s) => `${fixed(T(s), 3)} s`],
      ['Time between ticks, T ÷ 2', (s) => ({ text: `${fixed(T(s) / 2, 3)} s`, good: Math.abs(T(s) - 2) < 0.01 })],
      ['g here', (s) => `${fixed(s.g, 2)} m/s²`],
      ['Length that gives T = 2 s', (s) => `${fixed(lengthFor(2, s.g), 3)} m`],
      ['Your length is off by', (s) => `${fixed(100 * (s.L / lengthFor(2, s.g) - 1), 1)}%`],
    ] },
  ],
  tex: (s) => `L = \\frac{gT^2}{4\\pi^2} = \\frac{${fixed(s.g, 2)}\\times 2^2}{4\\pi^2} = ${fixed(lengthFor(2, s.g), 3)}\\ \\text{m}`,
});

clock.step(1);
