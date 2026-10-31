import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { fit, x } from './_shm-math.js';

const state = { x0: 3, v0: 8, w: 2 };
const solved = (s) => fit(s.x0, s.v0, s.w);
const tx = (v) => fixed(v, 2).replace('−', '-');

createTool({
  state,
  label: 'The curve x = A cos(ωt + φ) through the starting point, with a tangent showing the starting velocity.',
  setup: (stage, c) => createPlot(stage, { x: [-0.5, 8], y: [-6, 6], c }),
  draw(ctx, stage, c, plot) {
    const { A, phi } = solved(state);
    plot.axes({ xLabel: 't (s)', yLabel: 'x (m)' });
    plot.fn((t) => x(A, state.w, phi, t), { color: c.ink });
    plot.fn((t) => state.x0 + state.v0 * t, { color: c.b, width: 2, dash: [6, 4], domain: [-0.5, 1.2] });
    plot.point(0, state.x0);
  },
  controls: [
    { title: 'Two facts fix the motion' },
    { key: 'x0', label: 'Start position, x₀', min: -5, max: 5, step: 0.5, format: (v) => `${fixed(v, 1)} m` },
    { key: 'v0', label: 'Start velocity, v₀', min: -10, max: 10, step: 0.5, format: (v) => `${fixed(v, 1)} m/s` },
    { key: 'w', label: 'Angular frequency, ω', min: 1, max: 4, step: 0.5, format: (v) => `${fixed(v, 1)} rad/s` },
    { readout: [
      ['v₀/ω', (s) => `${fixed(s.v0 / s.w, 2)} m`],
      ['Amplitude, A', (s) => `${fixed(solved(s).A, 3)} m`],
      ['Phase, φ', (s) => `${fixed(solved(s).phi, 3)} rad`],
      ['Check: A cos φ', (s) => `${fixed(solved(s).A * Math.cos(solved(s).phi), 2)} m`],
      ['Check: −Aω sin φ', (s) => `${fixed(-solved(s).A * s.w * Math.sin(solved(s).phi), 2)} m/s`],
    ] },
  ],
  tex: (s) => `A = \\sqrt{x_0^2 + (v_0/\\omega)^2} = \\sqrt{${tx(s.x0)}^2 + (${tx(s.v0 / s.w)})^2} = ${tx(solved(s).A)},\\quad \\phi = ${tx(solved(s).phi)}`,
});
