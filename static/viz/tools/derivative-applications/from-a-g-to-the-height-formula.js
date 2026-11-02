import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { boxes, num } from './_da.js';

// a = −g. Integrate once: v = v₀ − g t (+ the starting v₀). Integrate again: h = h₀ + v₀ t − ½ g t² (+ the starting h₀).
const G = 9.8;
const state = { v0: 15, h0: 5, t: 1 };
const v = (t) => state.v0 - G * t;
const h = (t) => state.h0 + state.v0 * t - 0.5 * G * t * t;
const [b1, b2, b3] = boxes(3);

createTool({
  state,
  label: 'Three graphs stacked: acceleration, velocity and height against time. The shaded area under acceleration up to the chosen time equals the change in velocity; the shaded area under velocity equals the change in height.',
  setup: (stage, c) => ({ a: createPlot(stage, { x: [0, 4], y: [-12, 2], c, box: b1 }), v: createPlot(stage, { x: [0, 4], y: [-30, 30], c, box: b2 }), h: createPlot(stage, { x: [0, 4], y: [-20, 40], c, box: b3 }) }),
  draw(ctx, stage, c, { a, v: pv, h: ph }) {
    const T = (state.v0 + Math.sqrt(state.v0 ** 2 + 2 * G * state.h0)) / G; // lands at h = 0
    const hmax = state.h0 + (state.v0 * state.v0) / (2 * G);
    a.setRange([0, 4], [-12, 3]); pv.setRange([0, 4], [-28, 28]); ph.setRange([0, 4], [-hmax * 0.15, hmax * 1.2]);
    a.axes({ xLabel: 't (s)', yLabel: 'a (m/s²)' }); pv.axes({ xLabel: 't (s)', yLabel: 'v (m/s)' }); ph.axes({ xLabel: 't (s)', yLabel: 'h (m)' });
    const t = state.t;
    a.shade(() => -G, null, 0, t, c.fillA);
    a.fn(() => -G, { color: c.d, width: 3 });
    pv.shade(v, null, 0, t, c.fillB);
    pv.fn(v, { color: c.b, width: 3 });
    ph.fn(h, { color: c.ink, width: 3, domain: [0, T] });
    ph.segment(0, 0, 4, 0, { color: c.grid, width: 1.5 });
    a.point(t, -G, { fill: c.a }); pv.point(t, v(t), { fill: c.a }); ph.point(t, h(t), { fill: c.a });
  },
  controls: [
    { title: 'Throw it' },
    { key: 'v0', label: 'Launch speed v₀ (up)', min: -10, max: 25, step: 1, format: (x) => `${x} m/s` },
    { key: 'h0', label: 'Start height h₀', min: 0, max: 20, step: 1, format: (x) => `${x} m` },
    { key: 't', label: 'Time t', min: 0, max: 4, step: 0.05, format: (x) => `${x.toFixed(2)} s` },
    { readout: [
      ['Area under a (shaded)', () => `${num(-G * state.t, 4)} = change in v`],
      ['v = v₀ − g t', () => `${num(v(state.t), 4)} m/s`],
      ['Area under v (shaded)', () => `${num(state.v0 * state.t - 0.5 * G * state.t ** 2, 4)} = change in h`],
      ['h = h₀ + v₀t − ½gt²', () => `${num(h(state.t), 4)} m`],
    ] },
  ],
  tex: (s) => `h(t)=${s.h0}${s.v0 < 0 ? '-' : '+'}${Math.abs(s.v0)}t-\\tfrac12(9.8)t^2`,
});
