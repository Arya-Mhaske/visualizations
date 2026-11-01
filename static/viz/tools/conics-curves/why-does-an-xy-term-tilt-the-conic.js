import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { disc, ellipseAt, tiltedEllipse } from './_rotation-math.js';
import { curve, trace } from './_conics-view.js';

const state = { a: 4, b: 2, phi: 30 };
const R = 6;
const q = (s = state) => tiltedEllipse(s.a, s.b, s.phi);
const rad = (d) => (d * Math.PI) / 180;

createTool({
  state,
  label: 'An ellipse whose axes are turned by an angle phi from the x and y axes. The dashed lines are the ellipse\'s own axes. When phi is 0 or 90 degrees the ellipse is square to the axes and its equation has no xy term. For any other angle an xy term appears in the equation, and the more it is tilted the bigger the coefficient B is, until the ellipse becomes a circle, which has no preferred direction.',
  setup: (stage, c) => createPlot(stage, { x: [-R, R], y: [-R, R], c, pad: 16 }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'x', yLabel: 'y' });
    const d = [Math.cos(rad(state.phi)), Math.sin(rad(state.phi))];
    plot.segment(-d[0] * 9, -d[1] * 9, d[0] * 9, d[1] * 9, { color: c.grid, width: 2, dash: [6, 5] });
    plot.segment(d[1] * 9, -d[0] * 9, -d[1] * 9, d[0] * 9, { color: c.grid, width: 2, dash: [6, 5] });
    curve(plot, trace((t) => ellipseAt(state.a, state.b, state.phi, t), 0, Math.PI * 2, 240), { color: c.a, width: 4 });
  },
  controls: [
    { title: 'Tilt the ellipse' },
    { key: 'phi', label: 'Tilt, φ', min: 0, max: 90, step: 1, format: (v) => `${v}°` },
    { key: 'a', label: 'Long half-axis, a', min: 2, max: 5.5, step: 0.5 },
    { key: 'b', label: 'Short half-axis, b', min: 1, max: 5, step: 0.5 },
    { readout: [
      ['A', (s) => fixed(q(s).A, 4)],
      ['B (the xy term)', (s) => ({ text: fixed(q(s).B, 4), good: Math.abs(q(s).B) < 5e-5 })],
      ['C', (s) => fixed(q(s).C, 4)],
      ['B² − 4AC', (s) => fixed(disc(q(s)), 4)],
    ] },
  ],
  onChange(s) { if (s.b > s.a) s.b = s.a; },
  tex: (s) => `${fixed(q(s).A, 3)}x^2${q(s).B < 0 ? '-' : '+'}${fixed(Math.abs(q(s).B), 3)}xy+${fixed(q(s).C, 3)}y^2=1`,
});
