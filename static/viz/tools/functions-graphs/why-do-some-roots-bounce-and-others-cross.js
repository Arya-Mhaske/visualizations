import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { evalP, fromRoots } from './_polynomial-math.js';

const state = { m1: 1, m2: 2, m3: 3 };
const ROOTS = [-2, 1, 3];
const mults = (s = state) => [s.m1, s.m2, s.m3];
const roots = (s = state) => ROOTS.flatMap((r, i) => Array(mults(s)[i]).fill(r));
const P = (s = state) => fromRoots(roots(s), 0.2);

createTool({
  state,
  label: 'A polynomial with roots at minus 2, 1 and 3, each with a multiplicity you can choose. A root of odd multiplicity makes the graph cross the axis there, because the factor x minus a changes sign and an odd power keeps that change. A root of even multiplicity makes the graph bounce off the axis, because an even power of x minus a is never negative and cannot change sign. Higher multiplicity flattens the graph as it meets the axis.',
  setup: (stage, c) => createPlot(stage, { x: [-4, 5], y: [-6, 6], c, pad: 18 }),
  draw(ctx, stage, c, plot) {
    const f = (x) => evalP(P(), x);
    const top = Math.min(40, Math.max(2, ...[-3.5, -2, 0, 1, 2, 3, 4.5].map((x) => Math.abs(f(x)))));
    plot.setRange([-4, 5], [-top * 0.6, top * 0.6]);
    plot.axes();
    plot.fn(f, { color: c.a, width: 4 });
    ROOTS.forEach((r, i) => plot.point(r, 0, { fill: mults()[i] % 2 ? c.c : c.b, r: 8 }));
  },
  controls: [
    { title: 'Choose the multiplicities' },
    { key: 'm1', label: 'Root −2 appears', min: 1, max: 4, step: 1, format: (v) => `${v} time${v > 1 ? 's' : ''}` },
    { key: 'm2', label: 'Root 1 appears', min: 1, max: 4, step: 1, format: (v) => `${v} time${v > 1 ? 's' : ''}` },
    { key: 'm3', label: 'Root 3 appears', min: 1, max: 4, step: 1, format: (v) => `${v} time${v > 1 ? 's' : ''}` },
    { readout: [
      ['At −2', (s) => (s.m1 % 2 ? 'crosses' : 'bounces')],
      ['At 1', (s) => (s.m2 % 2 ? 'crosses' : 'bounces')],
      ['At 3', (s) => (s.m3 % 2 ? 'crosses' : 'bounces')],
      ['Degree', (s) => `${s.m1 + s.m2 + s.m3}`],
    ] },
  ],
  tex: (s) => `P(x)=0.2(x+2)^{${s.m1}}(x-1)^{${s.m2}}(x-3)^{${s.m3}}`,
});
