import { createTool } from '../../lib/tool.js';
import { createCamera } from '../../lib/project3d.js';
import { fixed } from '../../lib/format.js';
import { rank, solve } from './_sm-math.js';
import { det } from './_sm-math.js';

// Each plane is n·x = d. The three cases: one common point, a common line, or no common point.
const CASES = {
  point: { name: 'One point', A: [[1, 1, 1], [1, -1, 0], [0, 1, -1]], d: [3, 0, 0] },
  line: { name: 'A line', A: [[1, 1, 1], [1, -1, 0], [2, 0, 1]], d: [3, 0, 3] },
  prism: { name: 'No point: a prism', A: [[1, -1, 0], [0, 1, -1], [1, 0, -1]], d: [0, 0, 1] },
  parallel: { name: 'No point: two parallel', A: [[1, 1, 1], [1, 1, 1], [1, -1, 0]], d: [3, 6, 0] },
};
const state = { which: 'point', shift: 0 };
const A = (s) => CASES[s.which].A;
const d = (s) => CASES[s.which].d.map((v, i) => (i === 2 ? v + s.shift : v));
const aug = (s) => A(s).map((r, i) => [...r, d(s)[i]]);
const verdict = (s) => {
  const [r, ra] = [rank(A(s)), rank(aug(s))];
  if (r < ra) return 'no common point';
  return r === 3 ? 'one common point' : r === 2 ? 'a common line' : 'a common plane';
};

createTool({
  state,
  label: 'Three planes drawn as outlined squares in 3D, which you can turn by dragging. In the first case they meet at a single point. In the second they share a whole line. In the other two cases there is no point on all three planes. Shifting the third plane along its normal turns the shared line into no solution.',
  setup(stage, c) {
    const cam = createCamera(stage, { extent: 5, yaw: 0.7, pitch: 0.5, c });
    cam.orbit(() => stage.invalidate());
    return cam;
  },
  draw(ctx, stage, c, cam) {
    cam.axes({ size: 4 });
    const colors = [c.a, c.b, c.d];
    A(state).forEach((n, i) => {
      const len2 = n[0] ** 2 + n[1] ** 2 + n[2] ** 2;
      const centre = n.map((v) => (v * d(state)[i]) / len2);
      const u = Math.abs(n[2]) < 0.9 * Math.sqrt(len2) ? [-n[1], n[0], 0] : [0, -n[2], n[1]];
      const un = Math.hypot(...u);
      const e1 = u.map((v) => (v / un) * 2.6);
      const nn = Math.sqrt(len2);
      const e2 = [n[1] * e1[2] - n[2] * e1[1], n[2] * e1[0] - n[0] * e1[2], n[0] * e1[1] - n[1] * e1[0]].map((v) => v / nn);
      const corner = (s, t) => centre.map((v, k) => v + s * e1[k] + t * e2[k]);
      const pts = [corner(-1, -1), corner(1, -1), corner(1, 1), corner(-1, 1)];
      pts.forEach((p, k) => cam.line(p, pts[(k + 1) % 4], { color: colors[i], width: 3 }));
      cam.line(corner(-1, 0), corner(1, 0), { color: colors[i], width: 1 });
      cam.line(corner(0, -1), corner(0, 1), { color: colors[i], width: 1 });
    });
    const p = solve(A(state), d(state));
    if (p) cam.point(p, { fill: c.fillY, r: 9 });
  },
  controls: [
    { title: 'Three planes' },
    { key: 'which', label: 'Case', options: Object.entries(CASES).map(([key, v]) => [key, v.name]) },
    { key: 'shift', label: 'Push plane 3 along its normal', min: -2, max: 2, step: 0.5, format: (n) => fixed(n, 1) },
    { readout: [
      ['They have', (s) => ({ text: verdict(s), good: verdict(s).startsWith('one') || verdict(s).startsWith('a common') })],
      ['Rank of A, rank of [A | d]', (s) => `${rank(A(s))}, ${rank(aug(s))}`],
      ['Determinant of A', (s) => fixed(det(A(s)), 2)],
    ] },
  ],
  tex: (s) => `\\operatorname{rank}A=${rank(A(s))},\\ \\operatorname{rank}[A\\,|\\,\\mathbf d]=${rank(aug(s))}\\ \\Rightarrow\\ \\text{${verdict(s)}}`,
});
