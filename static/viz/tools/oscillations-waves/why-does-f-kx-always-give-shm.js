import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { createClock, transport } from '../../lib/sim.js';
import { label, line } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { at, force, gap, period, trajectory, TAU } from './_force-law-math.js';

const state = { p: 2, A: 1.5 };
const END = 14;
const DT = 1 / 200;
const clock = createClock(document.querySelector('#stage'), { onFrame: () => tool.update() });
const t = () => clock.state.t % END;
let calc = null;

function recompute() {
  calc = {
    samples: trajectory(state.p, state.A, END + 1, DT),
    half: trajectory(state.p, state.A / 2, END + 1, DT),
    T: period(state.p, state.A),
    T2: period(state.p, state.A * 2),
    gap: gap(state.p, state.A),
  };
}
recompute();
const xNow = () => at(calc.samples, DT, t());
const row = (top, bottom) => (s) => ({ x: 0, y: s.h * top, w: s.w, h: s.h * (bottom - top) });
const exponent = (s) => (1 - s.p) / 2;

const tool = createTool({
  state,
  label: 'A mass pulled aside and released under a chosen force law. Graphs show the force against position and the motion against time, with a true cosine dashed for comparison.',
  setup: (stage, c) => ({
    force: createPlot(stage, { x: [-2, 2], y: [-2, 2], c, box: row(0.2, 0.56) }),
    motion: createPlot(stage, { x: [0, END], y: [-2, 2], c, box: row(0.56, 1) }),
  }),
  draw(ctx, stage, c, { force: fp, motion: mp }) {
    const [mid, track] = [stage.w / 2, stage.h * 0.1];
    const unit = (stage.w * 0.4) / state.A;
    line(ctx, mid - state.A * unit, track, mid + state.A * unit, track, { color: c.grid, width: 6 });
    line(ctx, mid, track - 12, mid, track + 12, { color: c.ink, width: 2 });
    ctx.fillStyle = c.a;
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 3;
    ctx.fillRect(mid + xNow() * unit - 12, track - 12, 24, 24);
    ctx.strokeRect(mid + xNow() * unit - 12, track - 12, 24, 24);
    label(ctx, 'start here', mid + state.A * unit, track - 22, c, { size: 10, bounds: stage });

    const reach = state.A * 1.15;
    const top = Math.max(1, state.A ** state.p) * 1.15;
    fp.setRange([-reach, reach], [-top, top]);
    fp.axes({ xLabel: 'x (m)', yLabel: 'force F (N)' });
    fp.fn((u) => -u, { color: c.c, dash: [6, 5] });
    fp.fn((u) => force(state.p, u), { color: c.ink });
    fp.point(xNow(), force(state.p, xNow()), { fill: c.a, r: 6 });
    label(ctx, 'dashed: F = −kx', ...fp.toPx(reach * 0.98, top * 0.8), c, { size: 10, align: 'right', color: c.c, bounds: stage });

    const lim = state.A * 1.25;
    mp.setRange([0, END], [-lim, lim]);
    mp.axes({ xLabel: 't (s)', yLabel: 'x (m)' });
    mp.fn((u) => state.A * Math.cos((TAU * u) / calc.T), { color: c.c, dash: [6, 5], width: 3 });
    mp.fn((u) => 2 * at(calc.half, DT, u), { color: c.b, width: 3 });
    mp.fn((u) => at(calc.samples, DT, u), { color: c.a, width: 4 });
    mp.text('green: cosine', END * 0.99, lim * 0.9, { size: 10, align: 'right', color: c.c });
    mp.text('blue: half swing ×2', END * 0.99, lim * 0.7, { size: 10, align: 'right', color: c.b });
    mp.segment(t(), -lim, t(), lim, { color: c.ink, width: 1 });
    mp.point(t(), xNow(), { r: 6 });
  },
  controls: [
    { title: 'Try a different force law' },
    { key: 'p', label: 'Restoring force grows like', options: [[0.5, '√x'], [1, 'x'], [2, 'x²'], [3, 'x³']] },
    { key: 'A', label: 'Pulled aside by', min: 0.5, max: 2.5, step: 0.5, format: (n) => `${fixed(n, 1)} m` },
    transport(clock),
    { readout: [
      ['Period, this swing', () => `${fixed(calc.T, 2)} s`],
      ['Period, double the swing', () => `${fixed(calc.T2, 2)} s`],
      ['Period ratio', () => fixed(calc.T2 / calc.T, 2)],
      ['Gap from a cosine', () => ({ text: `${fixed(calc.gap * 100, 1)}% of A`, good: calc.gap < 0.005 })],
    ] },
  ],
  tex: (s) => `F = -k\\,\\mathrm{sgn}(x)\\,|x|^{${s.p}},\\quad T \\propto A^{${fixed(exponent(s), 2).replace('−', '-')}}`,
  onChange: recompute,
});

clock.step(1);
