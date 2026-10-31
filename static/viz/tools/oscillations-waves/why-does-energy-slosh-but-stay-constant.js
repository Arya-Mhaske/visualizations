import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { createClock, transport } from '../../lib/sim.js';
import { label, line, spring } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { energies, periodOf, totalEnergy } from './_force-law-math.js';

const state = { k: 4, m: 1, A: 1, graph: 'time' };
const clock = createClock(document.querySelector('#stage'), { onFrame: () => tool.update() });
const now = (s) => energies(s.k, s.m, s.A, clock.state.t);
const span = (s) => 2 * periodOf(s.k, s.m);

function bars(ctx, stage, c, e, E) {
  const [left, bottom, top] = [16, stage.h - 34, stage.h * 0.4];
  const full = bottom - top;
  const width = Math.min(46, (stage.w * 0.36 - 16) / 3 - 8);
  [['K', e.K, c.a], ['U', e.U, c.b], ['K+U', e.E, c.c]].forEach(([name, value, color], i) => {
    const x = left + i * (width + 10);
    const h = (value / E) * full;
    ctx.fillStyle = color;
    ctx.fillRect(x, bottom - h, width, h);
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 3;
    ctx.strokeRect(x, bottom - full, width, full);
    label(ctx, name, x + width / 2, bottom + 14, c, { size: 11, bounds: stage });
  });
}

const tool = createTool({
  state,
  label: 'A mass on a spring with bars for kinetic energy, potential energy and their sum, and a graph of both energies. The two bars trade height while the total bar never moves.',
  setup: (stage, c) => createPlot(stage, {
    x: [0, 2], y: [0, 1], c, box: (s) => ({ x: s.w * 0.36, y: s.h * 0.34, w: s.w * 0.64, h: s.h * 0.66 }),
  }),
  draw(ctx, stage, c, plot) {
    const e = now(state);
    const E = totalEnergy(state.k, state.A);
    const [wall, mid, y] = [14, stage.w / 2, stage.h * 0.13];
    const unit = (stage.w * 0.36) / state.A;
    line(ctx, wall, y - 24, wall, y + 24, { color: c.ink, width: 5 });
    spring(ctx, wall, mid + e.x * unit - 16, y, { color: c.ink });
    ctx.fillStyle = c.a;
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 3;
    ctx.fillRect(mid + e.x * unit - 16, y - 16, 32, 32);
    ctx.strokeRect(mid + e.x * unit - 16, y - 16, 32, 32);
    line(ctx, mid, y + 22, mid, y + 34, { color: c.ink, width: 2 });
    bars(ctx, stage, c, e, E);

    const energy = (f) => (u) => f(energies(state.k, state.m, state.A, u));
    if (state.graph === 'time') {
      plot.setRange([0, span(state)], [0, E * 1.15]);
      plot.axes({ xLabel: 't (s)', yLabel: 'energy (J)' });
      plot.fn(energy((q) => q.K), { color: c.a });
      plot.fn(energy((q) => q.U), { color: c.b });
      plot.segment(0, E, span(state), E, { color: c.c, width: 4 });
      const t = clock.state.t % span(state);
      plot.segment(t, 0, t, E * 1.15, { color: c.ink, width: 1 });
      plot.point(t, e.K, { fill: c.a, r: 5 });
      plot.point(t, e.U, { fill: c.b, r: 5 });
    } else {
      plot.setRange([-state.A * 1.1, state.A * 1.1], [0, E * 1.15]);
      plot.axes({ xLabel: 'x (m)', yLabel: 'energy (J)' });
      plot.fn((u) => 0.5 * state.k * u * u, { color: c.b });
      plot.fn((u) => E - 0.5 * state.k * u * u, { color: c.a, domain: [-state.A, state.A] });
      plot.segment(-state.A * 1.1, E, state.A * 1.1, E, { color: c.c, width: 4 });
      plot.point(e.x, e.K, { fill: c.a, r: 5 });
      plot.point(e.x, e.U, { fill: c.b, r: 5 });
    }
  },
  controls: [
    { title: 'Watch the two bars trade' },
    { key: 'graph', label: 'Graph against', options: [['time', 'Time'], ['position', 'Position']] },
    { key: 'k', label: 'Spring stiffness, k', min: 1, max: 9, step: 1, format: (n) => `${n} N/m` },
    { key: 'm', label: 'Mass, m', min: 0.5, max: 4, step: 0.5, format: (n) => `${fixed(n, 1)} kg` },
    { key: 'A', label: 'Amplitude, A', min: 0.5, max: 2, step: 0.5, format: (n) => `${fixed(n, 1)} m` },
    transport(clock),
    { readout: [
      ['Kinetic, K', (s) => `${fixed(now(s).K, 3)} J`],
      ['Potential, U', (s) => `${fixed(now(s).U, 3)} J`],
      ['K + U', (s) => `${fixed(now(s).E, 3)} J`],
      ['½kA²', (s) => `${fixed(totalEnergy(s.k, s.A), 3)} J`],
    ] },
  ],
  tex: (s) => {
    const e = now(s);
    return `\\tfrac12 m v^2 + \\tfrac12 k x^2 = ${fixed(e.K, 2)} + ${fixed(e.U, 2)} = ${fixed(e.E, 2)}\\ \\text{J} = \\tfrac12 k A^2`;
  },
});

clock.step(1);
