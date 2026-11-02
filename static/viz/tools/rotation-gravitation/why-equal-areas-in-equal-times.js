import { plotTool } from '../../lib/recipes.js';
import { fixed } from '../../lib/format.js';
import { eccAnomaly } from './_rg.js';

const state = { e: 0.6, m0: 0.05, dm: 0.1 };
const A = 5;
// Position relative to the Sun (focus at the origin) for mean anomaly Mean (fraction of 2π).
const at = (s, f) => {
  const E = eccAnomaly(f * 2 * Math.PI, s.e);
  return [A * (Math.cos(E) - s.e), A * Math.sqrt(1 - s.e * s.e) * Math.sin(E)];
};
const wedge = (s, f0, f1) => {
  const pts = [[0, 0]];
  for (let k = 0; k <= 24; k++) pts.push(at(s, f0 + ((f1 - f0) * k) / 24));
  return pts;
};
const area = (pts) => Math.abs(pts.reduce((t, p, i) => t + (p[0] * pts[(i + 1) % pts.length][1] - pts[(i + 1) % pts.length][0] * p[1]), 0)) / 2;

plotTool({
  state,
  label: 'An elliptical orbit with the Sun at one focus and two shaded wedges swept in equal times, one near the Sun and one far from it. The near wedge is long and thin, the far wedge short and fat, with the same area.',
  x: [-9, 9],
  y: [-6, 6],
  range: () => [[-10, 10], [-7, 7]],
  draw: (ctx, stage, c, plot) => {
    const orbit = Array.from({ length: 121 }, (_, k) => at(state, k / 120));
    orbit.slice(1).forEach((p, k) => plot.segment(orbit[k][0], orbit[k][1], p[0], p[1], { color: c.ink, width: 2 }));
    [[state.m0, c.fillA], [0.5 + state.m0, c.fillB]].forEach(([f0, fill]) => {
      const w = wedge(state, f0, f0 + state.dm).map((p) => plot.toPx(p[0], p[1]));
      ctx.save();
      ctx.fillStyle = fill;
      ctx.strokeStyle = c.ink;
      ctx.lineWidth = 2;
      ctx.beginPath();
      w.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    });
    plot.point(0, 0, { fill: c.c, r: 9 });
  },
  controls: [
    { title: 'Sweep areas' },
    { key: 'e', label: 'Eccentricity e', min: 0, max: 0.9, step: 0.05 },
    { key: 'm0', label: 'First interval starts at (fraction of the period)', min: 0, max: 0.4, step: 0.05 },
    { key: 'dm', label: 'Length of interval (fraction of the period)', min: 0.02, max: 0.2, step: 0.01 },
    { readout: [
      ['Area of near wedge', (s) => fixed(area(wedge(s, s.m0, s.m0 + s.dm)), 3)],
      ['Area of far wedge', (s) => fixed(area(wedge(s, 0.5 + s.m0, 0.5 + s.m0 + s.dm)), 3)],
      ['Equal?', (s) => ({ text: Math.abs(area(wedge(s, s.m0, s.m0 + s.dm)) - area(wedge(s, 0.5 + s.m0, 0.5 + s.m0 + s.dm))) < 0.02 ? 'yes' : 'no', good: true })],
    ] },
  ],
  tex: () => `\\dfrac{dA}{dt}=\\dfrac{L}{2m}=\\text{constant}`,
});
