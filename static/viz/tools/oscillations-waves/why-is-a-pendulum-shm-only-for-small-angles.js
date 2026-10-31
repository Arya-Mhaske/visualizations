import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { createClock, transport } from '../../lib/sim.js';
import { arc, arrow, dot, label, line } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { G, at, exactPeriod, forceGap, restoring, linearForce, smallPeriod, swing, toRad } from './_pendulum-math.js';

const L = 1;
const END = 16;
const state = { deg: 60 };
let run = swing({ L, A: toRad(state.deg), span: END });
const clock = createClock(document.querySelector('#stage'), { onFrame: () => tool.update() });
const now = () => clock.state.t % END;
const A = (s) => toRad(s.deg);
const ideal = (s, t) => A(s) * Math.cos((2 * Math.PI * t) / smallPeriod(L));

const tool = createTool({
  state,
  label: 'A pendulum swinging beside a ghost that follows the small-angle rule. Below, the real pull-back force, sin θ, is drawn against the straight-line force, θ.',
  setup: (stage, c) => createPlot(stage, {
    x: [-3.2, 3.2], y: [-1.4, 1.4], c, box: (s) => ({ x: 0, y: s.h * 0.46, w: s.w, h: s.h * 0.54 }),
  }),
  draw(ctx, stage, c, plot) {
    const pivot = [stage.w / 2, 16];
    const len = stage.h * 0.3;
    const bobAt = (th) => [pivot[0] + len * Math.sin(th), pivot[1] + len * Math.cos(th)];
    const th = at(run.theta, run.dt, now());
    const [bx, by] = bobAt(th);
    const [gx, gy] = bobAt(ideal(state, now()));
    arc(ctx, ...pivot, len, Math.PI / 2 - A(state), Math.PI / 2 + A(state), { color: c.grid, width: 2, dash: [4, 4] });
    line(ctx, ...pivot, gx, gy, { color: c.grid, width: 2 });
    dot(ctx, gx, gy, 12, c.paper, c.b);
    line(ctx, ...pivot, bx, by, { color: c.ink, width: 3 });
    dot(ctx, bx, by, 12, c.a, c.ink);
    // Pull-back forces along the arc, drawn from the bob: real in coral-dark ink, straight-line in blue.
    const unit = stage.w * 0.2;
    const tangent = [Math.cos(th), -Math.sin(th)];
    const radial = [Math.sin(th), Math.cos(th)];
    [[restoring(1, G, th) / G, c.ink, 20], [linearForce(1, G, th) / G, c.b, 34]].forEach(([f, color, off]) => {
      const [sx, sy] = [bx + radial[0] * off, by + radial[1] * off];
      arrow(ctx, sx, sy, sx - f * unit * tangent[0], sy - f * unit * tangent[1], { color, width: 4 });
    });
    label(ctx, 'ghost: ideal SHM', 12, 14, c, { size: 10, align: 'left', color: c.b, bounds: stage });
    label(ctx, 'real pendulum', 12, 30, c, { size: 10, align: 'left', bounds: stage });
    plot.axes({ xLabel: 'θ (rad)', yLabel: 'force ÷ mg' });
    plot.fn((u) => u, { color: c.b, dash: [8, 5] });
    plot.fn((u) => Math.sin(u), { color: c.a });
    plot.segment(A(state), -1.4, A(state), 1.4, { color: c.grid, width: 1 });
    plot.segment(-A(state), -1.4, -A(state), 1.4, { color: c.grid, width: 1 });
    plot.point(th, Math.sin(th), { fill: c.a });
    plot.point(th, th, { fill: c.b, r: 5 });
  },
  controls: [
    { title: 'Release the pendulum' },
    { key: 'deg', label: 'Starting angle', min: 5, max: 170, step: 5, format: (n) => `${n}°` },
    transport(clock),
    { readout: [
      ['Real pull-back, mg sin θ', () => `${fixed(restoring(1, G, at(run.theta, run.dt, now())) / G, 3)} mg`],
      ['SHM rule, mg θ', () => `${fixed(linearForce(1, G, at(run.theta, run.dt, now())) / G, 3)} mg`],
      ['SHM rule is too big by', (s) => `${fixed(100 * forceGap(A(s)), 1)}% at the ends`],
      ['Real period', (s) => `${fixed(exactPeriod(L, A(s)), 3)} s`],
      ['SHM period, 2π√(L/g)', () => `${fixed(smallPeriod(L), 3)} s`],
    ] },
  ],
  tex: (s) => `\\sin ${s.deg}^\\circ = ${fixed(Math.sin(A(s)), 4)}\\quad\\text{but}\\quad ${s.deg}^\\circ = ${fixed(A(s), 4)}\\ \\text{rad}`,
  onChange: (s) => {
    run = swing({ L, A: A(s), span: END });
    clock.reset();
    clock.step(1);
  },
});

clock.step(1);
