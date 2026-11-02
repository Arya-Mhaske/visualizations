import { plotTool } from '../../lib/recipes.js';
import { fixed } from '../../lib/format.js';

const state = { a: 5, c: 3, t: 50 };
const rad = (d) => (d * Math.PI) / 180;
const b = (s) => Math.sqrt(s.a * s.a - s.c * s.c);

plotTool({
  state,
  label: 'An ellipse drawn with a pencil and string stretched between two foci. The pencil is at the chosen point with lines to both foci whose lengths always add to the same total.',
  x: [-8, 8],
  y: [-6, 6],
  range: () => [[-8, 8], [-6, 6]],
  draw: (ctx, stage, c, plot) => {
    const pts = Array.from({ length: 121 }, (_, k) => [state.a * Math.cos((k / 120) * 2 * Math.PI), b(state) * Math.sin((k / 120) * 2 * Math.PI)]);
    pts.slice(1).forEach((p, k) => plot.segment(pts[k][0], pts[k][1], p[0], p[1], { color: c.ink, width: 3 }));
    const p = [state.a * Math.cos(rad(state.t)), b(state) * Math.sin(rad(state.t))];
    plot.segment(-state.c, 0, ...p, { color: c.b, width: 3 });
    plot.segment(state.c, 0, ...p, { color: c.a, width: 3 });
    plot.point(-state.c, 0, { fill: c.ink, r: 5 });
    plot.point(state.c, 0, { fill: c.c, r: 9 });
    plot.point(...p, { fill: c.a });
  },
  controls: [
    { title: 'Pins and string' },
    { key: 'a', label: 'Semi-major axis a (half the string)', min: 3, max: 7, step: 0.5 },
    { key: 'c', label: 'Pin distance from centre c', min: 0, max: 7, step: 0.5 },
    { key: 't', label: 'Pencil position (°)', min: 0, max: 360, step: 5 },
    { readout: [
      ['Distances to foci', (s) => { const p = [s.a * Math.cos(rad(s.t)), b(s) * Math.sin(rad(s.t))]; return `${fixed(Math.hypot(p[0] + s.c, p[1]), 2)} + ${fixed(Math.hypot(p[0] - s.c, p[1]), 2)}`; }],
      ['Sum', (s) => fixed(2 * s.a, 2)],
      ['Eccentricity e = c/a', (s) => fixed(s.c / s.a, 3)],
    ] },
  ],
  tex: (s) => `r_1+r_2=2a=${2 * s.a},\\quad e=\\dfrac{c}{a}=${fixed(s.c / s.a, 3)}`,
  onChange: (s) => {
    s.c = Math.min(s.c, s.a - 0.5);
  },
});
