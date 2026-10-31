import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { createClock, transport } from '../../lib/sim.js';
import { arrow, label, line } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { wave, TAU } from './_travelling-waves-math.js';

const X = 8;
const state = { lambda: 3, nu: 0.5 };
const clock = createClock(document.querySelector('#stage'), { onFrame: () => tool.update() });
const T = (s) => 1 / s.nu;
const v = (s) => s.lambda * s.nu;
const now = (s) => clock.state.t % T(s); // time since the marked crest set off
const k = (s) => TAU / s.lambda;
const w = (s) => TAU * s.nu;
const home = (s) => s.lambda / 4; // x of the first crest at t = 0, where kx = π/2

const tool = createTool({
  state,
  label: 'A wave travelling right with one crest marked in coral. A ruler one wavelength long sits under the wave. While one period passes, the marked crest moves along the ruler and arrives exactly at its far end.',
  setup: (stage, c) => createPlot(stage, { x: [0, X], y: [-1.6, 1.6], c, box: (g) => ({ x: 0, y: 0, w: g.w, h: g.h }) }),
  draw(ctx, stage, c, plot) {
    const u = now(state);
    const x0 = home(state);
    const xc = x0 + v(state) * u; // the marked crest
    plot.axes({ xLabel: 'x (m)', yLabel: 'y' });
    plot.fn((x) => wave(x, u, 1, k(state), w(state), 0, 1), { color: c.b });
    // the crest at the moment it set off: a ghost stays behind
    plot.segment(x0, -1.5, x0, 1.2, { color: c.grid, width: 2, dash: [4, 4] });
    plot.text('start', x0, 1.4, { size: 10 });
    // the ruler, one wavelength long, drawn under the axis
    const [ax, ay] = plot.toPx(x0, -1.25);
    const [bx] = plot.toPx(x0 + state.lambda, -1.25);
    line(ctx, ax, ay, bx, ay, { color: c.ink, width: 3 });
    line(ctx, ax, ay - 6, ax, ay + 6, { color: c.ink, width: 3 });
    line(ctx, bx, ay - 6, bx, ay + 6, { color: c.ink, width: 3 });
    label(ctx, `one wavelength, λ = ${fixed(state.lambda, 1)} m`, (ax + bx) / 2, ay + 16, c, { size: 10, bounds: stage });
    // distance covered by the marked crest so far
    const [cx] = plot.toPx(xc, 0);
    arrow(ctx, ax, ay - 14, Math.max(cx, ax + 2), ay - 14, { color: c.a, width: 4 });
    plot.point(xc, wave(xc, u, 1, k(state), w(state), 0, 1), { fill: c.a });
  },
  controls: [
    { title: 'Set the wave' },
    { key: 'lambda', label: 'Wavelength, λ', min: 1, max: 4, step: 0.5, format: (n) => `${fixed(n, 1)} m` },
    { key: 'nu', label: 'Frequency, ν', min: 0.25, max: 1, step: 0.05, format: (n) => `${fixed(n, 2)} Hz` },
    transport(clock),
    { readout: [
      ['Period, T = 1/ν', (s) => `${fixed(T(s), 2)} s`],
      ['Time since start', (s) => `${fixed(now(s), 2)} s`],
      ['Crest has moved', (s) => `${fixed(v(s) * now(s), 2)} m`],
      ['Fraction of λ covered', (s) => fixed((v(s) * now(s)) / s.lambda, 2)],
      ['Speed, λν', (s) => `${fixed(v(s), 3)} m/s`],
      ['Speed, ω/k', (s) => `${fixed(w(s) / k(s), 3)} m/s`],
    ] },
  ],
  tex: (s) => `v = \\dfrac{\\lambda}{T} = \\lambda\\nu = ${fixed(s.lambda, 1)} \\times ${fixed(s.nu, 2)} = ${fixed(v(s), 3)}\\ \\text{m/s} = \\dfrac{\\omega}{k} = \\dfrac{${fixed(w(s), 3)}}{${fixed(k(s), 3)}}`,
});

clock.step(1);
