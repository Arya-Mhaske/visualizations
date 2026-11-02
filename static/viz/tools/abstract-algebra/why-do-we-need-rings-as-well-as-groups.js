import { createTool } from '../../lib/tool.js';
import { createRng } from '../../lib/rng.js';
import { host, textBox } from './_aa-view.js';

// ℤ, polynomials and 2 × 2 matrices all have + and ×, and a(b + c) = ab + ac links them. A group has one operation; a ring has two.
const state = { which: 'int', seed: 3 };
const polyText = (p) => {
  const terms = [];
  for (let i = p.length - 1; i >= 0; i--) if (p[i]) terms.push(`${p[i]}${i ? `x${i > 1 ? `^${i}` : ''}` : ''}`);
  return terms.length ? `(${terms.join(' + ').replaceAll('+ -', '− ')})` : '0';
};
const trim = (p) => { const q = [...p]; while (q.length > 1 && q[q.length - 1] === 0) q.pop(); return q; };
export const RINGS = {
  int: {
    name: 'integers ℤ', gen: (r) => r.int(-6, 6), add: (a, b) => a + b, mul: (a, b) => a * b, eq: (a, b) => a === b, show: String,
  },
  poly: {
    name: 'polynomials ℤ[x]', gen: (r) => [r.int(-4, 4), r.int(-3, 3)],
    add: (a, b) => trim(Array.from({ length: Math.max(a.length, b.length) }, (_, i) => (a[i] || 0) + (b[i] || 0))),
    mul: (a, b) => { const out = Array(a.length + b.length - 1).fill(0); a.forEach((x, i) => b.forEach((y, j) => { out[i + j] += x * y; })); return trim(out); },
    eq: (a, b) => trim(a).join() === trim(b).join(), show: (p) => polyText(trim(p)),
  },
  mat: {
    name: '2 × 2 matrices', gen: (r) => [[r.int(-2, 3), r.int(-2, 3)], [r.int(-2, 3), r.int(-2, 3)]],
    add: (A, B) => A.map((row, i) => row.map((v, j) => v + B[i][j])),
    mul: (A, B) => A.map((row) => [0, 1].map((j) => row[0] * B[0][j] + row[1] * B[1][j])),
    eq: (A, B) => JSON.stringify(A) === JSON.stringify(B), show: (A) => `[${A[0].join(' ')} | ${A[1].join(' ')}]`,
  },
};
export function laws(which, seed) {
  const R = RINGS[which];
  const rng = createRng(seed * 7919 + which.length);
  const [a, b, c] = [R.gen(rng), R.gen(rng), R.gen(rng)];
  const row = (text, left, right) => ({ text, left: R.show(left), right: R.show(right), ok: R.eq(left, right) });
  return { a, b, c, rows: [
    row('a + b = b + a', R.add(a, b), R.add(b, a)),
    row('(a + b) + c = a + (b + c)', R.add(R.add(a, b), c), R.add(a, R.add(b, c))),
    row('a(b + c) = ab + ac', R.mul(a, R.add(b, c)), R.add(R.mul(a, b), R.mul(a, c))),
    row('(ab)c = a(bc)', R.mul(R.mul(a, b), c), R.mul(a, R.mul(b, c))),
    row('ab = ba', R.mul(a, b), R.mul(b, a)),
  ] };
}

const tool = createTool({
  state,
  label: 'Three random elements a, b, c from a chosen ring and five laws checked on them: addition commutes and associates, multiplication distributes over addition and associates, and whether multiplication commutes. Each law shows both sides and a tick or cross.',
  dom(el) {
    el.classList.add('viz-stage--flow');
    host(el, 'nb-label').textContent = 'Both sides of each law, worked out for the elements below.';
    const box = textBox(el);
    const refresh = () => {
      const L = laws(state.which, state.seed);
      const R = RINGS[state.which];
      box.set([`a = ${R.show(L.a)}    b = ${R.show(L.b)}    c = ${R.show(L.c)}`, ...L.rows.map((r) => `${r.ok ? '✓' : '✗'}  ${r.text}:   ${r.left}  ${r.ok ? '=' : '≠'}  ${r.right}`)]);
    };
    refresh();
    return { refresh };
  },
  controls: (t) => [
    { title: 'Pick a ring' },
    { key: 'which', label: 'Elements are', options: Object.entries(RINGS).map(([k, v]) => [k, v.name]) },
    { row: [{ button: 'New a, b, c', onClick() { state.seed++; t.update(); } }] },
    { readout: [
      ['Laws that hold here', (s) => `${laws(s.which, s.seed).rows.filter((r) => r.ok).length} of 5`],
      ['Multiplication commutes?', (s) => { const ok = laws(s.which, s.seed).rows[4].ok; return { text: ok ? 'in this example' : 'no: ab ≠ ba', good: ok }; }],
    ] },
  ],
  tex: () => 'a(b+c)=ab+ac',
});
void tool;
