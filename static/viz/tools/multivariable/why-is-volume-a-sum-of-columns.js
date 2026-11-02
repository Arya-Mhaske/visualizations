import { createTool } from '../../lib/tool.js';
import { createCamera } from '../../lib/project3d.js';

// Cut the rectangle [0, 2]² into n × n squares of area ΔA. Over each, a column of height f(sample point). Total volume ≈ Σ f ΔA.
// Finer squares fit the surface better, and the sum approaches the exact volume.
const FUNCS = {
  dome: { name: '4 − (x² + y²)/2', f: (x, y) => 4 - (x * x + y * y) / 2 },
  ramp: { name: '1 + x + y/2', f: (x, y) => 1 + x + y / 2 },
  waves: { name: '2 + sin(2x)·cos(y)', f: (x, y) => 2 + Math.sin(2 * x) * Math.cos(y) },
};
const state = { fn: 'dome', n: 4, rule: 'mid' };
const sample = (i, j, n, rule) => { const d = 2 / n; return rule === 'mid' ? [(i + 0.5) * d, (j + 0.5) * d] : rule === 'low' ? [i * d, j * d] : [(i + 1) * d, (j + 1) * d]; };
export function columnSum(f, n, rule) {
  let sum = 0;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) sum += f(...sample(i, j, n, rule)) * (2 / n) ** 2;
  return sum;
}
const exact = (f) => columnSum(f, 300, 'mid');

function box(lo, hi, fill, c) {
  const q = (k) => [k & 1 ? hi[0] : lo[0], k & 2 ? hi[1] : lo[1], k & 4 ? hi[2] : lo[2]];
  return [[0, 1, 3, 2], [4, 5, 7, 6], [0, 1, 5, 4], [2, 3, 7, 6], [0, 2, 6, 4], [1, 3, 7, 5]].map((idx) => ({ pts: idx.map(q), fill, stroke: c.ink, width: 1 }));
}

const tool = createTool({
  state,
  label: 'A grid of square-based columns standing on a square floor. Each column reaches the surface at one point of its square. The sum of the volumes of the columns approximates the volume under the surface, and gets closer as the squares get smaller.',
  setup: (stage, c) => createCamera(stage, { extent: 3.8, yaw: 0.8, pitch: 0.5, c }),
  draw(ctx, stage, c, cam) {
    const { f } = FUNCS[state.fn];
    cam.axes({ size: 3 });
    const faces = [];
    const d = 2 / state.n;
    for (let i = 0; i < state.n; i++) for (let j = 0; j < state.n; j++) {
      const h = f(...sample(i, j, state.n, state.rule));
      faces.push(...box([i * d, j * d, 0], [(i + 1) * d, (j + 1) * d, h], (i + j) % 2 ? c.fillB : c.fillC, c));
    }
    cam.faces(faces);
  },
  controls: [
    { title: 'Fill the space with columns' },
    { key: 'fn', label: 'Height f(x, y)', options: Object.entries(FUNCS).map(([k, v]) => [k, v.name]) },
    { key: 'n', label: 'Squares along each side, n', min: 1, max: 14, step: 1 },
    { key: 'rule', label: 'Column height taken at', options: [['mid', 'Middle'], ['low', 'Near corner'], ['high', 'Far corner']] },
    { readout: [
      ['Columns', (s) => String(s.n * s.n)],
      ['Sum of columns', (s) => columnSum(FUNCS[s.fn].f, s.n, s.rule).toFixed(4)],
      ['Exact volume', (s) => exact(FUNCS[s.fn].f).toFixed(4)],
      ['Difference', (s) => (columnSum(FUNCS[s.fn].f, s.n, s.rule) - exact(FUNCS[s.fn].f)).toFixed(4)],
    ] },
  ],
  tex: (s) => `V\\approx\\sum f(x_i^*,y_j^*)\\,\\Delta A=${columnSum(FUNCS[s.fn].f, s.n, s.rule).toFixed(3)}\\to\\iint f\\,dA`,
});
tool.extra.orbit(tool.update);
