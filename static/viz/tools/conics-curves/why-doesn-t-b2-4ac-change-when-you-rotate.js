import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { contour } from '../vectors-3d/_quadric-surfaces-math.js';
import { fixed } from '../../lib/format.js';
import { disc, rotateConic } from './_rotation-math.js';
import { classify, conicValue } from './_conics-math.js';

const state = { A: 3, B: 5, C: -1, th: 20 };
const R = 7;
const rad = (d) => (d * Math.PI) / 180;
const q = (s = state) => ({ A: s.A, B: s.B, C: s.C, D: 0, E: 0, F: -6 });
const kind = (s = state) => classify(q(s)).kind;

createTool({
  state,
  label: 'A conic and a pair of axes that you can turn. As the axes turn, the coefficients A, B and C of the equation change, but the number B squared minus 4AC stays exactly the same. It is a property of the curve itself, not of the axes used to describe it, and it decides whether the curve is an ellipse, a parabola or a hyperbola.',
  setup: (stage, c) => createPlot(stage, { x: [-R, R], y: [-R, R], c, pad: 16 }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: '', yLabel: '' });
    contour((x, y) => conicValue(q(), x, y), -R, R, 150).forEach(([p, r]) => plot.segment(p[0], p[1], r[0], r[1], { color: c.a, width: 4 }));
    const d = [Math.cos(rad(state.th)), Math.sin(rad(state.th))];
    plot.segment(-d[0] * 10, -d[1] * 10, d[0] * 10, d[1] * 10, { color: c.ink, width: 3 });
    plot.segment(d[1] * 10, -d[0] * 10, -d[1] * 10, d[0] * 10, { color: c.ink, width: 3 });
  },
  controls: [
    { title: 'Turn the axes' },
    { key: 'th', label: 'Turn the axes by θ', min: 0, max: 180, step: 1, format: (v) => `${v}°` },
    { key: 'A', label: 'A', min: -5, max: 5, step: 1 },
    { key: 'B', label: 'B', min: -8, max: 8, step: 1 },
    { key: 'C', label: 'C', min: -5, max: 5, step: 1 },
    { readout: [
      ['A′, B′, C′', (s) => { const r = rotateConic(q(s), s.th); return `${fixed(r.A, 2)}, ${fixed(r.B, 2)}, ${fixed(r.C, 2)}`; }],
      ['B′² − 4A′C′', (s) => ({ text: fixed(disc(rotateConic(q(s), s.th)), 3), good: true })],
      ['B² − 4AC at θ = 0', (s) => fixed(disc(q(s)), 3)],
      ['A′ + C′', (s) => { const r = rotateConic(q(s), s.th); return `${fixed(r.A + r.C, 3)}  (A + C = ${s.A + s.C})`; }],
      ['Type', (s) => kind(s)],
    ] },
  ],
  tex: (s) => { const r = rotateConic(q(s), s.th); return `B'^2-4A'C'=(${fixed(r.B, 2)})^2-4(${fixed(r.A, 2)})(${fixed(r.C, 2)})=${fixed(disc(r), 2)}=B^2-4AC`; },
});
