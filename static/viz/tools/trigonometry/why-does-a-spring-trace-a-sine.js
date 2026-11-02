import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { createTimeline } from '../../lib/timeline.js';
import { transport } from '../../lib/sim.js';
import { arc, arrow, dot, line, label, poly } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { TAU, mass, spinner } from './_waves-math.js';

const SPAN = 4; // seconds of the graph
const state = { A: 1, f: 0.5, t: 1 };
const clock = createTimeline(document.querySelector('#stage'), state, { cycle: () => SPAN, update: () => tool.update() });
clock.clock.speed = 1;
const omega = () => TAU * state.f;

function zigzag(ctx, x, y0, y1, c) {
  const n = 10;
  const pts = [[x, y0]];
  for (let i = 1; i < n; i++) pts.push([x + (i % 2 ? 9 : -9), y0 + ((y1 - y0) * i) / n]);
  pts.push([x, y1]);
  poly(ctx, pts, { stroke: c.ink, width: 3, closed: false });
}

const tool = createTool({
  state,
  label: 'Left: a mass hanging on a spring. Middle: a point spinning round a circle. Right: a graph of height against time. The mass is always level with the spinning point, and the graph traces that height.',
  setup: (stage, c) => createPlot(stage, { x: [0, SPAN], y: [-1.5, 1.5], c, pad: 22, box: (g) => ({ x: g.w * 0.4, y: 0, w: g.w * 0.6, h: g.h }) }),
  draw(ctx, stage, c, plot) {
    const ppu = Math.min(stage.w * 0.13, (stage.h - 56) / 3);
    const half = (stage.h - 44) / 2 / ppu;
    plot.setRange([0, SPAN], [-half, half]);
    const cy = stage.h / 2;
    const cx = stage.w * 0.255;
    const sx = stage.w * 0.075;
    const [px, py] = spinner(state.A, omega(), state.t);
    const my = cy - mass(state.A, omega(), state.t) * ppu;
    line(ctx, sx - 22, 10, sx + 22, 10, { color: c.ink, width: 5 });
    zigzag(ctx, sx, 10, my - 14, c);
    poly(ctx, [[sx - 14, my - 14], [sx + 14, my - 14], [sx + 14, my + 14], [sx - 14, my + 14]], { fill: c.fillB, stroke: c.ink, width: 3 });
    arc(ctx, cx, cy, state.A * ppu, 0, TAU, { color: c.ink, width: 2 });
    line(ctx, cx - 1.7 * ppu, cy, cx + 1.7 * ppu, cy, { color: c.grid, width: 1 });
    line(ctx, sx + 14, my, cx + px * ppu, my, { color: c.a, width: 1.5, dash: [5, 4] });
    arrow(ctx, cx, cy, cx + px * ppu, my, { color: c.a, width: 4, head: 11 });
    dot(ctx, cx + px * ppu, my, 8, c.a, c.ink);
    plot.axes({ xLabel: 't (s)', yLabel: 'height' });
    plot.fn((t) => mass(state.A, omega(), t), { color: c.grid, width: 2 });
    plot.fn((t) => mass(state.A, omega(), t), { color: c.a, width: 4, domain: [0, state.t] });
    line(ctx, cx + px * ppu, my, ...plot.toPx(state.t, mass(state.A, omega(), state.t)), { color: c.a, width: 1.5, dash: [5, 4] });
    plot.point(state.t, mass(state.A, omega(), state.t), { fill: c.a });
    label(ctx, 'spring', sx, stage.h - 12, c, { size: 11, bounds: stage, patch: false });
    label(ctx, 'circle', cx, stage.h - 12, c, { size: 11, bounds: stage, patch: false });
  },
  controls: () => [
    { title: 'Spring and circle' },
    { key: 't', label: 'Time, t', min: 0, max: SPAN, step: 0.05, format: (n) => `${fixed(n, 2)} s` },
    transport(clock.clock),
    { key: 'A', label: 'Stretch, A', min: 0.4, max: 1.2, step: 0.1, format: (n) => fixed(n, 1) },
    { key: 'f', label: 'Swings per second, f', min: 0.25, max: 1, step: 0.05, format: (n) => `${fixed(n, 2)} Hz` },
    { readout: [
      ['Angle of the point', (s) => `${fixed(((omega() * s.t * 180) / Math.PI) % 360, 0)}°`],
      ['Mass height', (s) => fixed(mass(s.A, omega(), s.t), 3)],
      ['A sin ωt', (s) => fixed(s.A * Math.sin(omega() * s.t), 3)],
    ] },
  ],
  tex: (s) => `y=A\\sin\\omega t=${fixed(s.A, 1)}\\sin(${fixed(TAU * s.f, 2)}\\,${fixed(s.t, 2)})=${fixed(mass(s.A, omega(), s.t), 3)}`,
  onChange: () => clock.sync(),
});
