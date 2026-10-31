import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { createSim, transport } from '../../lib/sim.js';
import { arrow, dot, label, line } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { G, topHeight, topTime, uniformV } from './_motion-in-a-straight-line-math.js';

const state = { u: 15 };
const MAX_H = 30;
const SCALE = 4;    // arrow pixels per m/s
const sim = createSim(document.querySelector('#stage'), {
  init: () => ({ t: 0, x: [0], v: [state.u] }),
  accel: () => [-G],
  stopWhen: (s) => s.x[0] < 0,
  onFrame: () => tool.update(),
});
// Opens part-way up the flight, so the first view already shows both arrows.
function openPartWay() {
  sim.reset();
  sim.step(topTime(state.u) * 0.5);
}
const height = () => sim.state.x[0];
const speed = () => sim.state.v[0];

const tool = createTool({
  state,
  label: 'A ball thrown straight up beside its velocity graph. At the top the velocity arrow vanishes but the acceleration arrow stays.',
  setup: (stage, c) => createPlot(stage, {
    x: [0, 5], y: [-25, 25], c, box: (s) => ({ x: s.w * 0.36, y: 0, w: s.w * 0.64, h: s.h }),
  }),
  draw(ctx, stage, c, plot) {
    const ground = stage.h - 26;
    const unit = (ground - 30) / MAX_H;
    const x = stage.w * 0.18;
    const y = ground - height() * unit;
    line(ctx, 8, ground, stage.w * 0.34, ground, { color: c.ink });
    dot(ctx, x, y, 11, c.a, c.ink);
    const v = speed();
    if (Math.abs(v) > 0.05) arrow(ctx, x - 22, y, x - 22, y - v * SCALE, { color: c.b, width: 4 });
    arrow(ctx, x + 22, y, x + 22, y + G * SCALE, { color: c.d, width: 4 });
    label(ctx, 'v', x - 22, y + 14, c, { size: 11, color: c.b });
    label(ctx, 'a', x + 22, y - 12, c, { size: 11, color: c.d });
    plot.axes({ xLabel: 't (s)', yLabel: 'v (m/s)' });
    plot.fn((t) => uniformV(state.u, -G, t), { color: c.ink });
    plot.point(sim.state.t, v);
    plot.point(topTime(state.u), 0, { fill: c.c, r: 6 });
  },
  controls: [
    { title: 'Throw a ball up' },
    { key: 'u', label: 'Throw speed, u', min: 5, max: 22, step: 1, format: (v) => `${v} m/s` },
    transport(sim),
    { readout: [
      ['Time', () => `${fixed(sim.state.t, 2)} s`],
      ['Height', () => `${fixed(height(), 2)} m`],
      ['Velocity, v', () => `${fixed(speed(), 2)} m/s`],
      ['Acceleration, a', () => `−${G} m/s² (always)`],
      ['Top reached at', (s) => `${fixed(topTime(s.u), 2)} s, ${fixed(topHeight(s.u), 2)} m`],
    ] },
  ],
  tex: () => `v = u - gt = ${state.u} - ${G} \\times ${fixed(sim.state.t, 2)} = ${fixed(speed(), 2).replace('−', '-')}\\ \\text{m/s}`,
  onChange: () => openPartWay(),
});

openPartWay();
