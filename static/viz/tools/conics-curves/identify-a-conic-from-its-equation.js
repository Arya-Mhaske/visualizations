import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { contour } from '../vectors-3d/_quadric-surfaces-math.js';
import { classify, conicValue } from './_conics-math.js';

const state = { A: 1, B: 0, C: 4, D: 0, E: 0, F: -16 };
const R = 8;
const PRESETS = [
  ['Circle', { A: 1, B: 0, C: 1, D: 0, E: 0, F: -9 }],
  ['Ellipse', { A: 1, B: 0, C: 4, D: 0, E: 0, F: -16 }],
  ['Parabola', { A: 1, B: 0, C: 0, D: 0, E: -2, F: 0 }],
  ['Hyperbola', { A: 1, B: 0, C: -1, D: 0, E: 0, F: -4 }],
  ['Two lines', { A: 1, B: 0, C: -1, D: 0, E: 0, F: 0 }],
];
const sign = (n) => (n < 0 ? `-${Math.abs(n)}` : `+${n}`);
let tool;

createTool({
  state,
  label: 'The graph of A x squared plus B x y plus C y squared plus D x plus E y plus F equals 0. The type of conic depends only on the sign of B squared minus 4 A C: negative for an ellipse or circle, zero for a parabola, positive for a hyperbola. If a second number, a determinant, is zero, the conic has fallen apart into lines or a point.',
  setup: (stage, c) => createPlot(stage, { x: [-R, R], y: [-R, R], c, pad: 16 }),
  draw(ctx, stage, c, plot) {
    plot.axes();
    const info = classify(state);
    contour((x, y) => conicValue(state, x, y), -R, R, 150).forEach(([p, q]) => {
      plot.segment(p[0], p[1], q[0], q[1], { color: info.fallen ? c.d : c.a, width: 4 });
    });
  },
  controls: (t) => {
    tool = t;
    return [
      { title: 'Ax² + Bxy + Cy² + Dx + Ey + F = 0' },
      { row: PRESETS.slice(0, 3).map(([name, v]) => ({ button: name, ghost: true, onClick: () => { Object.assign(state, v); tool.update(); } })) },
      { row: PRESETS.slice(3).map(([name, v]) => ({ button: name, ghost: true, onClick: () => { Object.assign(state, v); tool.update(); } })) },
      { key: 'A', label: 'A', min: -6, max: 6, step: 1 },
      { key: 'B', label: 'B', min: -6, max: 6, step: 1 },
      { key: 'C', label: 'C', min: -6, max: 6, step: 1 },
      { key: 'D', label: 'D', min: -8, max: 8, step: 1 },
      { key: 'E', label: 'E', min: -8, max: 8, step: 1 },
      { key: 'F', label: 'F', min: -20, max: 20, step: 1 },
      { readout: [
        ['B² − 4AC', (s) => `${classify(s).disc}`],
        ['Type', (s) => { const i = classify(s); return { text: i.fallen ? `degenerate (${i.kind} family)` : i.kind, good: !i.fallen }; }],
      ] },
    ];
  },
  tex: (s) => {
    const i = classify(s);
    return `B^2-4AC=(${s.B})^2-4(${s.A})(${s.C})=${i.disc}${i.disc < 0 ? '<0' : i.disc === 0 ? '=0' : '>0'}\\ \\Rightarrow\\ \\text{${i.kind}}`;
  },
});
