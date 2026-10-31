import { createTool } from '../../lib/tool.js';
import { createClock, transport } from '../../lib/sim.js';
import { dot, label, line } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { G, at, stopwatch, swing, toRad } from './_pendulum-math.js';

const state = { L: 1, N: 20, err: 0.2, deg: 5, speed: 4 };
const clock = createClock(document.querySelector('#stage'), { onFrame: () => tool.update(), speed: state.speed });
const A = (s) => toRad(s.deg);
const lab = (s, N = s.N) => stopwatch({ L: s.L, A: A(s), N, err: s.err });
let run;
const build = (s) => { run = swing({ L: s.L, A: A(s), span: s.N * lab(s).T + 1, dt: 1 / 100 }); };
build(state);
const swings = (s) => Math.min(s.N, Math.floor(clock.state.t / lab(s).T));
const finished = (s) => swings(s) >= s.N;
const shownTime = (s) => (finished(s) ? lab(s).shown : clock.state.t);

const tool = createTool({
  state,
  label: 'A pendulum swinging while a stopwatch counts the time and the swings. The lab bench shows the time for the chosen number of swings, the period worked out from it, and g.',
  draw(ctx, stage, c) {
    const pivot = [stage.w / 2, 16];
    const len = stage.h * 0.6 * (0.3 + 0.7 * state.L / 2);
    const th = at(run.theta, run.dt, Math.min(clock.state.t, run.theta.length * run.dt - run.dt * 2));
    const [bx, by] = [pivot[0] + len * Math.sin(th), pivot[1] + len * Math.cos(th)];
    line(ctx, stage.w / 2, 16, stage.w / 2, 16 + len + 14, { color: c.grid, width: 2, dash: [4, 4] });
    line(ctx, ...pivot, bx, by, { color: c.ink, width: 3 });
    dot(ctx, bx, by, 13, c.a, c.ink);
    label(ctx, `swings: ${swings(state)} of ${state.N}`, 10, 14, c, { size: 12, align: 'left', bounds: stage });
    label(ctx, `stopwatch: ${fixed(shownTime(state), 2)} s`, 10, 34, c, { size: 12, align: 'left', bounds: stage, color: finished(state) ? c.c : c.ink });
  },
  controls: [
    { title: 'Set up the experiment' },
    { key: 'L', label: 'String length, L', min: 0.2, max: 2, step: 0.05, format: (n) => `${fixed(n, 2)} m` },
    { key: 'N', label: 'Swings you time', min: 1, max: 40, step: 1, format: (n) => `${n}` },
    { key: 'err', label: 'Your start-and-stop error', min: 0, max: 0.4, step: 0.05, format: (n) => `${fixed(n, 2)} s` },
    { key: 'deg', label: 'Swing angle', min: 3, max: 45, step: 1, format: (n) => `${n}°` },
    { key: 'speed', label: 'Replay speed', options: [[1, '×1'], [4, '×4'], [10, '×10']] },
    transport(clock),
    { readout: [
      ['Stopwatch shows (N swings)', (s) => `${fixed(lab(s).shown, 2)} s`],
      ['Period, T = time ÷ N', (s) => `${fixed(lab(s).measured, 3)} s`],
      ['g from your numbers', (s) => `${fixed(lab(s).g, 2)} m/s²`],
      ['g in this world', () => `${fixed(G, 1)} m/s²`],
      ['Your error', (s) => ({ text: `${fixed(100 * lab(s).error, 1)}%`, good: Math.abs(lab(s).error) < 0.02 })],
      ['Error if you timed 1 swing', (s) => `${fixed(100 * lab(s, 1).error, 1)}%`],
    ] },
  ],
  tex: (s) => `g = \\frac{4\\pi^2 L}{T^2} = \\frac{4\\pi^2 (${fixed(s.L, 2)})}{(${fixed(lab(s).measured, 3)})^2} = ${fixed(lab(s).g, 2)}\\ \\text{m/s}^2`,
  onChange: (s) => {
    build(s);
    clock.speed = s.speed;
    clock.reset();
    clock.step(1);
  },
});

clock.step(1);
