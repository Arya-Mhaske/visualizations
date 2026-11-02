import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { boxes, tangent, num } from './_da.js';

// Rolle: s(a) = s(b) and s smooth ⇒ s′(c) = 0 somewhere. A ball thrown up from the ground and caught at the same height has v = 0 at the top.
const G = 9.8;
const state = { v0: 14, T: 2, release: 0 };
const s = (t) => state.v0 * t - 0.5 * G * t * t;
const v = (t) => state.v0 - G * t;
const equal = () => Math.abs(s(state.T) - s(0)) < 1e-9;
const TEQ = () => (2 * state.v0) / G;
const [bA, bB] = boxes(2);

createTool({
  state,
  label: 'Top: height of a thrown ball against time, with a horizontal line at the starting height. Bottom: its velocity. When the ball is caught back at the same height, the velocity crosses zero in between.',
  setup: (stage, c) => ({ a: createPlot(stage, { x: [0, 4], y: [-5, 12], c, box: bA }), b: createPlot(stage, { x: [0, 4], y: [-20, 20], c, box: bB }) }),
  draw(ctx, stage, c, { a, b }) {
    const top = Math.max(5, (state.v0 * state.v0) / (2 * G)) * 1.2;
    a.setRange([0, 4], [-top * 0.4, top]);
    b.setRange([0, 4], [-25, 25]);
    a.axes({ xLabel: 't (s)', yLabel: 's (m)' });
    a.fn(s, { color: c.ink, width: 3 });
    a.segment(0, 0, 4, 0, { color: c.b, width: 2, dash: [6, 4] });
    a.point(0, 0, { fill: c.b }); a.point(state.T, s(state.T), { fill: c.a, r: 8 });
    if (equal()) {
      const cc = state.v0 / G;
      tangent(a, cc, s(cc), 0, 0.6, c.c, 4);
      a.point(cc, s(cc), { fill: c.c, r: 7 });
    }
    b.axes({ xLabel: 't (s)', yLabel: 'v (m/s)' });
    b.fn(v, { color: c.b, width: 3 });
    if (equal()) b.point(state.v0 / G, 0, { fill: c.c, r: 7 });
  },
  controls: (tool) => [
    { title: 'Throw and catch' },
    { key: 'v0', label: 'Throw speed', min: 5, max: 19, step: 0.5, format: (x) => `${x} m/s` },
    { key: 'T', label: 'Caught at time T', min: 0.2, max: 3.9, step: 0.05, format: (x) => `${x.toFixed(2)} s` },
    { button: 'Catch at the same height', onClick() { state.T = Math.min(3.9, TEQ()); tool.update(); } },
    { readout: [
      ['Height at start / at T', () => `0 and ${num(s(state.T), 3)} m`],
      ['Same height?', () => (equal() ? { text: 'yes: Rolle applies', good: true } : { text: 'no: no promise of v = 0', good: false })],
      ['Velocity at the top', () => (equal() ? { text: `0 at t = ${num(state.v0 / G, 3)} s`, good: true } : '—')],
    ] },
  ],
  tex: () => 's(0)=s(T)\\ \\Rightarrow\\ s\'(c)=0\\ \\text{for some } 0<c<T',
});
