import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { createClock, transport } from '../../lib/sim.js';
import { fixed, piFrac } from '../../lib/format.js';
import { wave, speedOf, wavelengthOf, periodOf, freqOf } from './_travelling-waves-math.js';

const X = 8;
const END = 10;
const state = { a: 1, k: 1.5, w: 3, phi: 0.8, at: 2 };
const clock = createClock(document.querySelector('#stage'), { onFrame: () => tool.update() });
const now = () => clock.state.t % END;
const shown = (phi) => (piFrac(Math.abs(phi)) ?? fixed(Math.abs(phi), 2)).replace('π', '\\pi ');

const tool = createTool({
  state,
  label: 'Top: the wave y = a sin(kx − ωt + φ) along the string right now, with one watched position marked. Bottom: the up-and-down motion of that watched position against time. Changing a, k, ω or φ reshapes both graphs.',
  setup: (stage, c) => ({
    top: createPlot(stage, { x: [0, X], y: [-2.3, 2.3], c, box: (g) => ({ x: 0, y: 0, w: g.w, h: g.h * 0.52 }) }),
    low: createPlot(stage, { x: [0, END], y: [-2.3, 2.3], c, box: (g) => ({ x: 0, y: g.h * 0.52, w: g.w, h: g.h * 0.48 }) }),
  }),
  draw(ctx, stage, c, { top, low }) {
    const t = now();
    const y = (x, u) => wave(x, u, state.a, state.k, state.w, state.phi, 1);
    top.axes({ xLabel: 'x (m)', yLabel: 'y' });
    top.fn((x) => y(x, 0), { color: c.grid, width: 2, dash: [5, 5] });
    top.fn((x) => y(x, t), { color: c.b });
    top.segment(state.at, -2.3, state.at, 2.3, { color: c.a, width: 1, dash: [3, 3] });
    top.point(state.at, y(state.at, t), { fill: c.a });
    top.text('dashed: t = 0', X * 0.85, 2.0, { size: 10 });
    low.axes({ xLabel: 't (s)', yLabel: `y at x = ${fixed(state.at, 1)}` });
    low.fn((u) => y(state.at, u), { color: c.a });
    low.segment(t, -2.3, t, 2.3, { color: c.ink, width: 1 });
    low.point(t, y(state.at, t), { fill: c.a });
  },
  controls: [
    { title: 'Change the four numbers' },
    { key: 'a', label: 'Amplitude, a', min: 0.5, max: 2, step: 0.25, format: (n) => `${fixed(n, 2)} m` },
    { key: 'k', label: 'Wave number, k', min: 0.5, max: 4, step: 0.1, format: (n) => `${fixed(n, 1)} rad/m` },
    { key: 'w', label: 'Angular frequency, ω', min: 0.5, max: 6, step: 0.1, format: (n) => `${fixed(n, 1)} rad/s` },
    { key: 'phi', label: 'Phase constant, φ', min: -3.14, max: 3.14, step: 0.01, format: (n) => `${fixed(n, 2)} rad` },
    { key: 'at', label: 'Watch the point at x', min: 0, max: X, step: 0.25, format: (n) => `${fixed(n, 2)} m` },
    transport(clock),
    { readout: [
      ['Wavelength, 2π/k', (s) => `${fixed(wavelengthOf(s.k), 2)} m`],
      ['Period, 2π/ω', (s) => `${fixed(periodOf(s.w), 2)} s`],
      ['Frequency, ω/2π', (s) => `${fixed(freqOf(s.w), 2)} Hz`],
      ['Speed, ω/k', (s) => `${fixed(speedOf(s.k, s.w), 2)} m/s`],
      ['Direction', () => 'to the right (+x)'],
    ] },
  ],
  tex: (s) => `y = ${fixed(s.a, 2)}\\sin(${fixed(s.k, 1)}x - ${fixed(s.w, 1)}t ${s.phi < 0 ? '-' : '+'} ${shown(s.phi)}) \\qquad v = \\dfrac{\\omega}{k} = ${fixed(speedOf(s.k, s.w), 2)}\\ \\text{m/s}`,
});

clock.step(1);
