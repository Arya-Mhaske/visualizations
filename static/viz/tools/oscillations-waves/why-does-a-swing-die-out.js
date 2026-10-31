import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { createClock, transport } from '../../lib/sim.js';
import { dot, label, line } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { at, envelope, halfTime, smallPeriod, swing, toRad } from './_pendulum-math.js';

const END = 30;
const state = { b: 0.2, deg: 20, L: 2.5, envelope: true };
const clock = createClock(document.querySelector('#stage'), { onFrame: () => tool.update() });
const A = (s) => toRad(s.deg);
let run;
const build = (s) => { run = swing({ L: s.L, A: A(s), b: s.b, span: END, dt: 1 / 100 }); };
build(state);
const now = () => clock.state.t % END;

const tool = createTool({
  state,
  label: 'A swing that loses energy to friction, with a graph of its angle against time and a second graph of the fraction of its energy left.',
  setup: (stage, c) => ({
    top: createPlot(stage, { x: [0, END], y: [-0.7, 0.7], c, box: (s) => ({ x: 0, y: s.h * 0.3, w: s.w, h: s.h * 0.4 }) }),
    low: createPlot(stage, { x: [0, END], y: [0, 1.1], c, box: (s) => ({ x: 0, y: s.h * 0.7, w: s.w, h: s.h * 0.3 }) }),
  }),
  draw(ctx, stage, c, { top, low }) {
    const pivot = [stage.w / 2, 12];
    const len = stage.h * 0.2;
    const th = at(run.theta, run.dt, now());
    const [bx, by] = [pivot[0] + len * Math.sin(th), pivot[1] + len * Math.cos(th)];
    line(ctx, ...pivot, bx, by, { color: c.ink, width: 3 });
    dot(ctx, bx, by, 11, c.a, c.ink);
    label(ctx, `energy left: ${fixed(100 * at(run.fraction, run.dt, now()), 0)}%`, 10, 14, c, { size: 11, align: 'left', bounds: stage });
    top.axes({ xLabel: 't (s)', yLabel: 'θ (rad)' });
    if (state.envelope && state.b > 0) {
      top.fn((u) => envelope(A(state), state.b, u), { color: c.grid, dash: [6, 4] });
      top.fn((u) => -envelope(A(state), state.b, u), { color: c.grid, dash: [6, 4] });
    }
    top.fn((u) => at(run.theta, run.dt, u), { color: c.a });
    top.segment(now(), -0.7, now(), 0.7, { color: c.ink, width: 1 });
    top.point(now(), th, { r: 6 });
    low.axes({ xLabel: 't (s)', yLabel: 'energy fraction' });
    low.fn((u) => at(run.fraction, run.dt, u), { color: c.d });
    low.segment(now(), 0, now(), 1.1, { color: c.ink, width: 1 });
  },
  controls: [
    { title: 'Add friction' },
    { key: 'b', label: 'Friction (damping), b', min: 0, max: 0.6, step: 0.05, format: (n) => `${fixed(n, 2)} per s` },
    { key: 'deg', label: 'First push', min: 5, max: 40, step: 5, format: (n) => `${n}°` },
    { key: 'L', label: 'Swing length', min: 1, max: 3, step: 0.5, format: (n) => `${fixed(n, 1)} m` },
    { key: 'envelope', label: 'Show the e^(−bt/2) envelope', toggle: true },
    transport(clock),
    { readout: [
      ['Period', (s) => `${fixed(smallPeriod(s.L), 2)} s`],
      ['Swing halves every', (s) => (s.b > 0 ? `${fixed(halfTime(s.b), 1)} s` : 'never')],
      ['Swings to halve', (s) => (s.b > 0 ? fixed(halfTime(s.b) / smallPeriod(s.L), 1) : 'never')],
      ['Size now, θ', () => `${fixed(Math.abs(at(run.theta, run.dt, now())), 3)} rad`],
      ['Energy left', () => `${fixed(100 * at(run.fraction, run.dt, now()), 0)}%`],
    ] },
  ],
  tex: (s) => `\\theta_{\\max}(t) = ${fixed(A(s), 3)}\\,e^{-${fixed(s.b / 2, 3)}\\,t}`,
  onChange: (s) => {
    build(s);
    clock.reset();
    clock.step(1);
  },
});

clock.step(1);
