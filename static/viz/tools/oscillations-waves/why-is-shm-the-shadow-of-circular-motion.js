import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { createClock, transport } from '../../lib/sim.js';
import { phasor } from '../../lib/phasor.js';
import { arrow, label, line } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { a, v, x } from './_shm-math.js';

const state = { view: 'graph', w: 1.5, phi: 0.6, mass: 1 };
const A = 1;
const clock = createClock(document.querySelector('#stage'), { onFrame: () => tool.update() });
const t = () => clock.state.t;
const angle = (s) => s.w * t() + s.phi;

const tool = createTool({
  state,
  label: 'A peg on a turning wheel lit from above casts a shadow on a line below. The shadow slides back and forth, and its position traced against time is a cosine.',
  setup: (stage, c) => createPlot(stage, {
    x: [0, 10], y: [-1.4, 1.4], c, box: (s) => ({ x: 0, y: s.h * 0.58, w: s.w, h: s.h * 0.42 }),
  }),
  draw(ctx, stage, c, plot) {
    const R = stage.h * 0.2;
    const [cx, cy, screen] = [stage.w / 2, stage.h * 0.26, stage.h * 0.53];
    line(ctx, cx - R * 1.4, screen, cx + R * 1.4, screen, { color: c.ink });
    label(ctx, 'lamp above: light falls straight down', cx, 10, c, { size: 10, bounds: stage });
    const theta = angle(state);
    const [tx, ty] = phasor(ctx, cx, cy, R, theta, { color: c.a, c, shadowY: screen });
    if (state.view === 'parts') {
      const scale = R * 0.5;
      const [vx, vy] = [-Math.sin(theta) * state.w * scale, -Math.cos(theta) * state.w * scale];
      const [ax, ay] = [-Math.cos(theta) * state.w ** 2 * scale * 0.6, Math.sin(theta) * state.w ** 2 * scale * 0.6];
      arrow(ctx, tx, ty, tx + vx, ty + vy, { color: c.b, width: 3 });
      arrow(ctx, tx, ty, tx + ax, ty + ay, { color: c.d, width: 3 });
      arrow(ctx, tx, screen, tx + vx, screen, { color: c.b, width: 4 });
      arrow(ctx, tx, screen + 8, tx + ax, screen + 8, { color: c.d, width: 4 });
    }
    if (state.view === 'force') arrow(ctx, tx, screen, cx + (tx - cx) * 0.2, screen, { color: c.c, width: 5 });
    plot.axes({ xLabel: 't (s)', yLabel: 'x' });
    if (state.view === 'peg') return;
    plot.fn((u) => x(A, state.w, state.phi, u), { color: c.ink, domain: [0, Math.min(t(), 10)] });
    plot.point(Math.min(t(), 10), x(A, state.w, state.phi, t()), { r: 6 });
  },
  controls: [
    { title: 'Follow the shadow' },
    { key: 'view', label: 'View', options: [['peg', 'Peg'], ['graph', 'Graph'], ['parts', 'v and a'], ['force', 'Force']] },
    { key: 'w', label: 'Angular speed, ω', min: 0.5, max: 3, step: 0.1, format: (n) => `${fixed(n, 1)} rad/s` },
    { key: 'phi', label: 'Start angle, φ', min: 0, max: 6.28, step: 0.01, format: (n) => `${fixed(n, 2)} rad` },
    { key: 'mass', label: 'Mass, m', min: 0.5, max: 4, step: 0.5, format: (n) => `${fixed(n, 1)} kg` },
    transport(clock),
    { readout: [
      ['Time', () => `${fixed(t(), 2)} s`],
      ['Shadow x', (s) => `${fixed(x(A, s.w, s.phi, t()), 3)} m`],
      ['Shadow v', (s) => `${fixed(v(A, s.w, s.phi, t()), 3)} m/s`],
      ['Shadow a', (s) => `${fixed(a(A, s.w, s.phi, t()), 3)} m/s²`],
      ['−ω²x', (s) => `${fixed(-(s.w ** 2) * x(A, s.w, s.phi, t()), 3)} m/s²`],
      ['k = mω²', (s) => `${fixed(s.mass * s.w ** 2, 2)} N/m`],
    ] },
  ],
  tex: (s) => (s.view === 'force'
    ? `F = ma = -m\\omega^2 x = -kx,\\quad k = ${fixed(s.mass * s.w ** 2, 2)}\\ \\text{N/m}`
    : `x = A\\cos(\\omega t + \\phi) = \\cos(${fixed(s.w, 1)} \\times ${fixed(t(), 2)} + ${fixed(s.phi, 2)}) = ${fixed(x(A, s.w, s.phi, t()), 3).replace('−', '-')}`),
  onChange: () => {},
});

clock.step(2);
