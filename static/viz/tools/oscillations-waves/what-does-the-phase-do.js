import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { phasor } from '../../lib/phasor.js';
import { fixed, piFrac } from '../../lib/format.js';
import { x } from './_shm-math.js';

const state = { phi: 0.79, A: 2, w: 1 };
const shown = (phi) => piFrac(phi) ?? fixed(phi, 2);

createTool({
  state,
  label: 'A rotating arrow at its starting angle beside a graph of x = A cos(ωt + φ). Changing the phase slides the whole curve along the time axis without changing its shape.',
  setup: (stage, c) => createPlot(stage, {
    x: [-6.5, 6.5], y: [-3, 3], c, box: (s) => ({ x: 0, y: s.h * 0.34, w: s.w, h: s.h * 0.66 }),
  }),
  draw(ctx, stage, c, plot) {
    const R = stage.h * 0.13 * (state.A / 3 + 0.3);
    phasor(ctx, stage.w / 2, stage.h * 0.17, R, state.phi, { color: c.a, c });
    plot.axes({ xLabel: 't (s)', yLabel: 'x' });
    plot.fn((t) => x(state.A, state.w, 0, t), { color: c.grid, width: 3 });
    plot.fn((t) => x(state.A, state.w, state.phi, t), { color: c.a });
    plot.point(0, x(state.A, state.w, state.phi, 0));
  },
  controls: [
    { title: 'Slide the start' },
    { key: 'phi', label: 'Phase, φ', min: -3.14, max: 3.14, step: 0.01, format: (v) => `${fixed(v, 2)} rad` },
    { key: 'A', label: 'Amplitude, A', min: 0.5, max: 3, step: 0.5, format: (v) => fixed(v, 1) },
    { key: 'w', label: 'Angular frequency, ω', min: 0.5, max: 3, step: 0.1, format: (v) => `${fixed(v, 1)} rad/s` },
    { readout: [
      ['x at t = 0', (s) => fixed(x(s.A, s.w, s.phi, 0), 3)],
      ['Curve shifted left by', (s) => `${fixed(s.phi / s.w, 2)} s`],
      ['Largest x', (s) => fixed(s.A, 1)],
      ['Period', (s) => `${fixed((2 * Math.PI) / s.w, 2)} s`],
    ] },
  ],
  tex: (s) => `x = ${fixed(s.A, 1)}\\cos(${fixed(s.w, 1)}t ${s.phi < 0 ? '-' : '+'} ${shown(Math.abs(s.phi)).replace('π', '\\pi ')})`,
});
