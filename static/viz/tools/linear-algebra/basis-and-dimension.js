import { createTool } from '../../lib/tool.js';
import { fixed } from '../../lib/format.js';
import { det2, rad, solve } from './_la-math.js';
import { plane, vec } from './_la-view.js';

// The plane R² always has dimension 2: any two independent vectors are a basis, one is too few, three are too many.
const B = [3, 2];
const state = { count: 2, a1: 20, a2: 110, a3: 160 };
const dirs = (s) => [s.a1, s.a2, s.a3].slice(0, s.count).map((a) => [2 * Math.cos(rad(a)), 2 * Math.sin(rad(a))]);
function verdict(s) {
  const v = dirs(s);
  if (s.count === 1) return { text: 'too few: only a line', good: false };
  const indep = Math.abs(det2([v[0], v[1]])) > 1e-6;
  if (s.count === 2) return indep ? { text: 'a basis', good: true } : { text: 'dependent: only a line', good: false };
  return { text: 'too many: dependent', good: false };
}
const coords = (s) => {
  const v = dirs(s);
  if (s.count !== 2 || Math.abs(det2([v[0], v[1]])) < 1e-6) return null;
  return solve([[v[0][0], v[1][0]], [v[0][1], v[1][1]]], B);
};

createTool({
  state,
  label: 'The plane with a target point b and one, two or three vectors you can turn. Two vectors that point in different directions are a basis: every point, including b, is reached in exactly one way. One vector reaches only a line. Three vectors always have one that is a mix of the others.',
  setup: (stage, c) => plane(stage, c, 5),
  draw(ctx, stage, c, plot) {
    const v = dirs(state);
    const k = coords(state);
    plot.axes();
    const colors = [c.a, c.b, c.d];
    v.forEach((w, i) => vec(ctx, plot, c, [0, 0], w, { color: colors[i], width: 5, text: `v${i + 1}` }));
    if (k) {
      const first = v[0].map((x) => x * k[0]);
      vec(ctx, plot, c, [0, 0], first, { color: c.a, width: 3 });
      vec(ctx, plot, c, first, [first[0] + v[1][0] * k[1], first[1] + v[1][1] * k[1]], { color: c.b, width: 3 });
    }
    plot.point(B[0], B[1], { fill: c.fillY, r: 8 });
    plot.text('b', B[0] + 0.5, B[1] + 0.5, { size: 13, patch: false });
  },
  controls: [
    { title: 'Choose a basis' },
    { key: 'count', label: 'How many vectors', options: [[1, 'One'], [2, 'Two'], [3, 'Three']] },
    { key: 'a1', label: 'Direction of v1', min: 0, max: 180, step: 5, format: (n) => `${n}°` },
    { key: 'a2', label: 'Direction of v2', min: 0, max: 180, step: 5, format: (n) => `${n}°` },
    { key: 'a3', label: 'Direction of v3', min: 0, max: 180, step: 5, format: (n) => `${n}°` },
    { readout: [
      ['These vectors are', (s) => verdict(s)],
      ['Coordinates of b', (s) => (coords(s) ? `(${fixed(coords(s)[0], 3)}, ${fixed(coords(s)[1], 3)})` : (s.count === 3 ? 'many ways' : 'not every b is reachable')],
      ['Dimension of the plane', () => '2, whatever basis you pick'],
    ] },
  ],
  tex: (s) => (coords(s) ? `\\mathbf b=${fixed(coords(s)[0], 3)}\\mathbf v_1+${fixed(coords(s)[1], 3)}\\mathbf v_2` : '\\text{a basis is independent and spans: here it is not}'),
  onChange: (s) => show(s),
});
const fields = [...document.querySelectorAll('#panel .nb-field')];
function show(s) {
  if (fields.length < 4) return;
  fields[2].hidden = s.count < 2;
  fields[3].hidden = s.count < 3;
}
show(state);
