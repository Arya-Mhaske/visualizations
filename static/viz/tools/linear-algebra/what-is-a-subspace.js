import { createTool } from '../../lib/tool.js';
import { dot } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { plane, vec } from './_la-view.js';

// A subspace must contain the sum of any two of its vectors, and every multiple of each one (so also 0).
const near = (a, b) => Math.abs(a - b) < 1e-9;
const SETS = {
  line: { name: 'Line through 0', yes: true, has: ([x, y]) => near(y, x / 2), pts: [[2, 1], [-4, -2], [4, 2], [-2, -1], [6, 3], [0, 0]] },
  shifted: { name: 'Line missing 0', yes: false, has: ([x, y]) => near(y, x / 2 + 1), pts: [[0, 1], [2, 2], [-2, 0], [4, 3], [-4, -1], [6, 4]] },
  quad: { name: 'First quadrant', yes: false, has: ([x, y]) => x >= -1e-9 && y >= -1e-9, pts: [[1, 1], [2, 0], [0, 3], [3, 2], [1, 4], [4, 1]] },
  axes: { name: 'The two axes', yes: false, has: ([x, y]) => near(x * y, 0), pts: [[3, 0], [-2, 0], [0, 2], [0, -3], [1, 0], [0, 4]] },
  disc: { name: 'A disc', yes: false, has: ([x, y]) => x * x + y * y <= 9 + 1e-9, pts: [[1, 0], [0, 2], [-2, 1], [2, -2], [1, 1], [-1, -2]] },
  plane: { name: 'The whole plane', yes: true, has: () => true, pts: [[1, 0], [0, 2], [-2, 1], [2, -2], [3, 3], [-3, 2]] },
};
const state = { set: 'line', iu: 1, iv: 2, k: 1 };
const pick = (s) => { const set = SETS[s.set]; const u = set.pts[s.iu - 1]; const v = set.pts[s.iv - 1]; return { set, u, v, sum: [u[0] + v[0], u[1] + v[1]], scaled: [s.k * u[0], s.k * u[1]] }; };

createTool({
  state,
  label: 'A set of points in the plane, shaded, with two chosen members u and v. The sum u plus v and the multiple k times u are marked green if they stay in the set and red if they fall out. A set is a subspace only if no choice of u, v and k can fall out.',
  setup: (stage, c) => plane(stage, c, 6),
  draw(ctx, stage, c, plot) {
    const { set, u, v, sum, scaled } = pick(state);
    plot.axes({ grid: false });
    for (let x = -6; x <= 6; x += 0.5) for (let y = -6; y <= 6; y += 0.5) {
      if (set.has([x, y])) dot(ctx, ...plot.toPx(x, y), 2, c.fillY, c.ink, 1);
    }
    if (set === SETS.line || set === SETS.shifted) plot.segment(-6, set === SETS.line ? -3 : -2, 6, set === SETS.line ? 3 : 4, { color: c.fillY, width: 6 });
    vec(ctx, plot, c, [0, 0], u, { color: c.a, width: 4, text: 'u' });
    vec(ctx, plot, c, [0, 0], v, { color: c.b, width: 4, text: 'v' });
    dot(ctx, ...plot.toPx(...sum), 8, set.has(sum) ? c.c : c.a, c.ink);
    dot(ctx, ...plot.toPx(...scaled), 8, set.has(scaled) ? c.c : c.a, c.ink);
    plot.text('u+v', sum[0] + 0.5, sum[1] + 0.5, { size: 11, patch: false });
    plot.text('ku', scaled[0] + 0.5, scaled[1] - 0.5, { size: 11, patch: false });
    dot(ctx, ...plot.toPx(0, 0), 5, c.ink, c.ink, 1);
  },
  controls: [
    { title: 'Test the two rules' },
    { key: 'set', label: 'Set', options: Object.entries(SETS).map(([key, v]) => [key, v.name]) },
    { key: 'iu', label: 'Which member is u', min: 1, max: 6, step: 1, format: (n) => `#${n}` },
    { key: 'iv', label: 'Which member is v', min: 1, max: 6, step: 1, format: (n) => `#${n}` },
    { key: 'k', label: 'Multiplier k', min: -3, max: 3, step: 0.5, format: (n) => fixed(n, 1) },
    { readout: [
      ['u + v stays inside?', (s) => { const p = pick(s); return { text: p.set.has(p.sum) ? 'yes' : 'no', good: p.set.has(p.sum) }; }],
      ['k·u stays inside?', (s) => { const p = pick(s); return { text: p.set.has(p.scaled) ? 'yes' : 'no', good: p.set.has(p.scaled) }; }],
      ['Contains the zero vector?', (s) => ({ text: SETS[s.set].has([0, 0]) ? 'yes' : 'no', good: SETS[s.set].has([0, 0]) })],
      ['Is it a subspace?', (s) => ({ text: SETS[s.set].yes ? 'yes: closed under both' : 'no: some choice falls out', good: SETS[s.set].yes })],
    ] },
  ],
  tex: () => '\\mathbf u,\\mathbf v\\in S\\ \\Rightarrow\\ \\mathbf u+\\mathbf v\\in S\\ \\text{and}\\ k\\mathbf u\\in S',
});
