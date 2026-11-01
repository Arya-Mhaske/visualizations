import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { contour } from '../vectors-3d/_quadric-surfaces-math.js';
import { fixed } from '../../lib/format.js';
import { removeAngle, rotateConic } from './_rotation-math.js';
import { conicValue } from './_conics-math.js';

const state = { A: 5, B: 4, C: 2, th: 0 };
const R = 6;
const rad = (d) => (d * Math.PI) / 180;
const q = (s = state) => ({ A: s.A, B: s.B, C: s.C, D: 0, E: 0, F: -12 });
let tool;

tool = createTool({
  state,
  label: 'A tilted ellipse given by an equation with an xy term, and a pair of axes you can turn. The turned axes are drawn as dark lines through the centre. When the axes line up with the ellipse itself, the new equation has no xy term. The new coefficient B-prime is shown as you turn, and a button sets the angle from the rule cot 2 theta equals A minus C over B.',
  setup: (stage, c) => createPlot(stage, { x: [-R, R], y: [-R, R], c, pad: 16 }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: '', yLabel: '' });
    contour((x, y) => conicValue(q(), x, y), -R, R, 150).forEach(([p, r]) => plot.segment(p[0], p[1], r[0], r[1], { color: c.a, width: 4 }));
    const d = [Math.cos(rad(state.th)), Math.sin(rad(state.th))];
    const good = Math.abs(rotateConic(q(), state.th).B) < 0.02;
    plot.segment(-d[0] * 9, -d[1] * 9, d[0] * 9, d[1] * 9, { color: good ? c.c : c.ink, width: 3 });
    plot.segment(d[1] * 9, -d[0] * 9, -d[1] * 9, d[0] * 9, { color: good ? c.c : c.ink, width: 3 });
  },
  controls: [
    { title: 'Turn the axes' },
    { key: 'th', label: 'Turn the axes by θ', min: 0, max: 180, step: 1, format: (v) => `${fixed(v, 0)}°` },
    { button: 'Set θ from cot 2θ = (A − C)/B', onClick: () => { state.th = removeAngle(q()); tool.update(); } },
    { key: 'A', label: 'A', min: 1, max: 6, step: 1 },
    { key: 'B', label: 'B', min: -8, max: 8, step: 1 },
    { key: 'C', label: 'C', min: 1, max: 6, step: 1 },
    { readout: [
      ['B′ at this angle', (s) => ({ text: fixed(rotateConic(q(s), s.th).B, 3), good: Math.abs(rotateConic(q(s), s.th).B) < 0.02 })],
      ['Angle from the rule', (s) => (s.B === 0 ? 'none needed' : `${fixed(removeAngle(q(s)), 2)}°`)],
      ['(A − C) ÷ B', (s) => (s.B === 0 ? '—' : fixed((s.A - s.C) / s.B, 3))],
      ['cot 2θ now', (s) => (Math.abs(Math.sin(rad(2 * s.th))) < 1e-9 ? '—' : fixed(1 / Math.tan(rad(2 * s.th)), 3))],
    ] },
  ],
  tex: (s) => `B'=(C-A)\\sin 2\\theta+B\\cos 2\\theta=${fixed(rotateConic(q(s), s.th).B, 3)}`,
});
