import { createTool } from '../../lib/tool.js';
import { arrow, dot, label, line } from '../../lib/draw.js';
import { mod } from './_aa-math.js';

// Three vectors in the plane over a field F (the real/rational numbers, ℤ₂ or ℤ₃). They are dependent when some combination
// x₁v₁ + x₂v₂ + x₃v₃ with not all x zero equals the zero vector. The same vectors can be independent in one field and not another.
const state = { field: '2', a: 1, b: 0, c: 0, d: 1, e: 1, f: 1 };
const vecs = (s) => [[s.a, s.b], [s.c, s.d], [s.e, s.f]];
const reduce = (v, p) => (p ? v.map((x) => mod(x, p)) : v);
const modulus = (s) => (s.field === 'R' ? 0 : Number(s.field));
const fix = (x, p) => (p ? mod(x, p) : x);

export function relation(s) {
  const p = modulus(s);
  const V = vecs(s).map((v) => reduce(v, p));
  const range = p ? [...Array(p).keys()] : [-8, -7, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8];
  let best = null;
  for (const x of range) for (const y of range) for (const z of range) {
    if (x === 0 && y === 0 && z === 0) continue;
    const sum = [0, 1].map((k) => fix(x * V[0][k] + y * V[1][k] + z * V[2][k], p));
    if (sum[0] === 0 && sum[1] === 0) {
      const cost = p ? x + y + z : Math.abs(x) + Math.abs(y) + Math.abs(z);
      if (!best || cost < best.cost) best = { x, y, z, cost };
    }
  }
  return best;
}
export function span(s) {
  const p = modulus(s);
  if (!p) return null;
  const V = vecs(s).map((v) => reduce(v, p));
  const set = new Map();
  for (let x = 0; x < p; x++) for (let y = 0; y < p; y++) for (let z = 0; z < p; z++) {
    const q = [0, 1].map((k) => (x * V[0][k] + y * V[1][k] + z * V[2][k]) % p);
    set.set(q.join(','), q);
  }
  return [...set.values()];
}
const cross = (u, v) => u[0] * v[1] - u[1] * v[0];
export function rank(s) {
  const p = modulus(s);
  const V = vecs(s).map((v) => reduce(v, p));
  const zero = V.every((v) => fix(v[0], p) === 0 && fix(v[1], p) === 0);
  if (zero) return 0;
  const minors = [cross(V[0], V[1]), cross(V[0], V[2]), cross(V[1], V[2])].map((m) => fix(m, p));
  return minors.some((m) => m !== 0) ? 2 : 1;
}

createTool({
  state,
  label: 'The plane over a chosen field with three arrows from the origin. Over the integers mod 2 or 3 the plane has only four or nine points, and the points reachable as combinations of the arrows are filled in. Over the real numbers the arrows are drawn in the ordinary plane.',
  draw(ctx, stage, c) {
    const p = modulus(state);
    const cols = [c.a, c.b, c.c];
    const names = ['v₁', 'v₂', 'v₃'];
    const V = vecs(state).map((v) => reduce(v, p));
    const R = p ? p - 1 : 3;
    const s = Math.min(stage.w, stage.h) / (p ? R + 2.4 : 6.6);
    const [ox, oy] = p ? [stage.w / 2 - (R * s) / 2, stage.h / 2 + (R * s) / 2] : [stage.w / 2, stage.h / 2];
    const at = ([x, y]) => [ox + x * s, oy - y * s];
    if (p) {
      const sp = span(state).map((q) => q.join(','));
      for (let x = 0; x < p; x++) for (let y = 0; y < p; y++) {
        const [px, py] = at([x, y]);
        dot(ctx, px, py, 11, sp.includes(`${x},${y}`) ? c.fillC : c.paper, c.ink, 2);
      }
    } else {
      for (let k = -3; k <= 3; k++) {
        const [lx, ly] = at([k, -3]);
        const [hx, hy] = at([k, 3]);
        line(ctx, lx, ly, hx, hy, { color: c.grid, width: 1 });
        const [ax, ay] = at([-3, k]);
        const [bx, by] = at([3, k]);
        line(ctx, ax, ay, bx, by, { color: c.grid, width: 1 });
      }
    }
    V.forEach((v, i) => {
      const [x, y] = at(v);
      if (v[0] !== 0 || v[1] !== 0) arrow(ctx, ox, oy, x, y, { color: cols[i], width: 3 });
      label(ctx, names[i], x + (i - 1) * 14, y - 14 + i * 9, c, { size: 11, color: cols[i], bounds: stage });
    });
    dot(ctx, ox, oy, 5, c.ink);
    label(ctx, p ? `plane over ℤ${p}: ${p * p} points` : 'plane over ℝ (or ℚ)', stage.w / 2, 14, c, { size: 12, bounds: stage });
  },
  controls: [
    { title: 'Pick a field and three vectors' },
    { key: 'field', label: 'Field', options: [['R', 'ℝ (or ℚ)'], ['2', 'ℤ₂'], ['3', 'ℤ₃']] },
    { key: 'a', label: 'v₁ across', min: -2, max: 2, step: 1 },
    { key: 'b', label: 'v₁ up', min: -2, max: 2, step: 1 },
    { key: 'c', label: 'v₂ across', min: -2, max: 2, step: 1 },
    { key: 'd', label: 'v₂ up', min: -2, max: 2, step: 1 },
    { key: 'e', label: 'v₃ across', min: -2, max: 2, step: 1 },
    { key: 'f', label: 'v₃ up', min: -2, max: 2, step: 1 },
    { readout: [
      ['Vectors used', (s) => vecs(s).map((v) => `(${reduce(v, modulus(s)).join(', ')})`).join('  ')],
      ['Dimension of the span', (s) => String(rank(s))],
      ['A relation x₁v₁ + x₂v₂ + x₃v₃ = 0', (s) => { const r = relation(s); return r ? `(${r.x}, ${r.y}, ${r.z})` : 'none'; }],
      ['Points in the span', (s) => (modulus(s) ? `${span(s).length} = ${modulus(s)}^${rank(s)}` : (rank(s) === 2 ? 'the whole plane' : rank(s) === 1 ? 'a line' : 'just the origin'))],
    ] },
  ],
  tex: (s) => { const r = relation(s); return r ? `${r.x}\\mathbf v_1+${r.y}\\mathbf v_2+${r.z}\\mathbf v_3=\\mathbf 0` : '\\mathbf v_1,\\mathbf v_2,\\mathbf v_3\\ \\text{independent}'; },
});
