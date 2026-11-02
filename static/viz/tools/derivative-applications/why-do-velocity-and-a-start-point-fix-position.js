import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { boxes, num } from './_da.js';

// Velocity v(t) alone gives the shape of s(t) but not its height: s(t) = S(t) + s₀. The starting position picks one curve.
const V = {
  a: { name: 'v = 6t − 2t²', v: (t) => 6 * t - 2 * t * t, S: (t) => 3 * t * t - (2 / 3) * t ** 3, T: 4 },
  b: { name: 'v = 4 cos t', v: (t) => 4 * Math.cos(t), S: (t) => 4 * Math.sin(t), T: 6.3 },
  c: { name: 'v = 3 (steady)', v: () => 3, S: (t) => 3 * t, T: 5 },
};
const state = { kind: 'a', s0: 2, t: 2 };
const K = () => V[state.kind];
const [bA, bB] = boxes(2);

createTool({
  state,
  label: 'Top: a velocity graph. Bottom: a family of position curves with the same shape, one for each starting position, with the chosen one highlighted. A dot marks the start at time zero.',
  setup: (stage, c) => ({ a: createPlot(stage, { x: [0, 4], y: [-4, 6], c, box: bA }), b: createPlot(stage, { x: [0, 4], y: [-10, 14], c, box: bB }) }),
  draw(ctx, stage, c, { a, b }) {
    const k = K();
    const tt = Math.min(state.t, k.T);
    const sMax = Math.max(...Array.from({ length: 50 }, (_, i) => Math.abs(k.S((k.T * i) / 49)))) + 6;
    const vMax = Math.max(...Array.from({ length: 50 }, (_, i) => Math.abs(k.v((k.T * i) / 49)))) * 1.2 + 0.5;
    a.setRange([0, k.T], [-vMax, vMax]);
    b.setRange([0, k.T], [-sMax, sMax]);
    a.axes({ xLabel: 't (s)', yLabel: 'v (m/s)' });
    a.fn(k.v, { color: c.b, width: 3 });
    a.shade(k.v, null, 0, tt, c.fillB);
    b.axes({ xLabel: 't (s)', yLabel: 's (m)' });
    for (let s0 = -4; s0 <= 4; s0 += 2) b.fn((t) => k.S(t) + s0, { color: c.grid, width: 2 });
    b.fn((t) => k.S(t) + state.s0, { color: c.a, width: 4 });
    b.point(0, state.s0, { fill: c.ink, r: 7 });
    b.point(tt, k.S(tt) + state.s0, { fill: c.a });
    a.point(tt, k.v(tt), { fill: c.a });
  },
  controls: [
    { title: 'Start somewhere' },
    { key: 'kind', label: 'Velocity', options: Object.entries(V).map(([k, v]) => [k, v.name]) },
    { key: 's0', label: 'Starting position s(0)', min: -4, max: 4, step: 0.5, format: (v) => `${v} m` },
    { key: 't', label: 'Time t', min: 0, max: 6.3, step: 0.1, format: (v) => `${v.toFixed(1)} s` },
    { readout: [
      ['Velocity now', () => num(K().v(Math.min(state.t, K().T)), 4)],
      ['Area under v from 0 (shaded)', () => num(K().S(Math.min(state.t, K().T)), 4)],
      ['Position s(t) = area + s(0)', () => num(K().S(Math.min(state.t, K().T)) + state.s0, 4)],
    ] },
  ],
  tex: (s) => `s(t)=s(0)+\\int_0^t v\\,dt=${s.s0}+${num(K().S(Math.min(s.t, K().T)), 3)}`,
});
