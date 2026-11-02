import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { simpson, num } from './_ia.js';

// Impulse J = ∫F dt = Δp = m Δv. The force lasts about a millisecond but is large. Three pulse shapes with the same peak and length have different areas. Made-up round numbers.
const M = 0.16; // kg, a cricket ball
const SHAPES = {
  sine: { name: 'Smooth (half sine)', f: (t, T, P) => (t < 0 || t > T ? 0 : P * Math.sin((Math.PI * t) / T)) },
  tri: { name: 'Triangle', f: (t, T, P) => (t < 0 || t > T ? 0 : P * (1 - Math.abs((2 * t) / T - 1))) },
  box: { name: 'Flat (rectangle)', f: (t, T, P) => (t < 0 || t > T ? 0 : P) },
};
const state = { shape: 'sine', P: 8, T: 2, v: 30 }; // peak kN, duration ms, incoming speed m/s
const F = (t) => SHAPES[state.shape].f(t, state.T, state.P);
const J = () => simpson(F, 0, state.T, 400); // kN·ms = N·s
const vOut = () => -state.v + J() / M; // positive means leaving in the original direction... bat reverses it

createTool({
  state,
  label: 'The force on a ball from a bat during the few milliseconds of contact, against time. The shaded area is the impulse, which equals the change in the ball momentum.',
  setup: (stage, c) => createPlot(stage, { x: [0, 5], y: [0, 12], c }),
  draw(ctx, stage, c, plot) {
    plot.setRange([-0.2, 5], [0, 14]);
    plot.axes({ xLabel: 't (ms)', yLabel: 'force F (kN)' });
    plot.shade(F, null, 0, state.T, c.fillA);
    plot.fn(F, { color: c.ink, width: 3, domain: [-0.2, 5] });
  },
  controls: [
    { title: 'Hit it' },
    { key: 'shape', label: 'Force shape', options: Object.entries(SHAPES).map(([k, v]) => [k, v.name]) },
    { key: 'P', label: 'Peak force', min: 2, max: 12, step: 0.5, format: (v) => `${v} kN` },
    { key: 'T', label: 'Contact time', min: 0.5, max: 4, step: 0.25, format: (v) => `${v} ms` },
    { key: 'v', label: 'Ball speed coming in', min: 10, max: 40, step: 1, format: (v) => `${v} m/s` },
    { readout: [
      ['Impulse J = area', () => `${num(J(), 5)} N·s`],
      ['Change in speed J / m', () => `${num(J() / M, 4)} m/s`],
      ['Speed leaving the bat', () => `${num(Math.abs(vOut()), 4)} m/s ${vOut() >= 0 ? '(back the way it came)' : '(still going forward)'}`],
      ['Average force J / T', () => `${num(J() / state.T, 4)} kN`],
    ] },
  ],
  tex: (s) => `J=\\int F\\,dt=\\Delta p=m\\,\\Delta v=${M}\\,\\Delta v`,
});
