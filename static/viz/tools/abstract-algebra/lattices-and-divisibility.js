import { createTool } from '../../lib/tool.js';
import { dot, label, line } from '../../lib/draw.js';
import { divisors, factor, gcd, lcm } from './_aa-math.js';

// The divisors of n, ordered by "divides", form a lattice: any two have a greatest lower bound (their gcd, the meet)
// and a least upper bound (their lcm, the join). When n has no repeated prime factor the lattice is a Boolean algebra.
const state = { n: 30, i: 2, j: 4 };
const rankOf = (d) => factor(d).length;
const isSquarefree = (n) => new Set(factor(n)).size === factor(n).length;
const pick = (s, key) => { const ds = divisors(s.n); return ds[Math.min(s[key], ds.length - 1)]; };

createTool({
  state,
  label: 'The divisors of n drawn as a diagram, with 1 at the bottom and n at the top, and a line from each divisor up to each multiple that is bigger by one prime factor. Two chosen divisors show their gcd (meet) and lcm (join).',
  draw(ctx, stage, c) {
    const ds = divisors(state.n);
    const levels = [];
    ds.forEach((d) => { (levels[rankOf(d)] ||= []).push(d); });
    const pos = new Map();
    levels.forEach((row, r) => row.forEach((d, k) => pos.set(d, [stage.w * ((k + 1) / (row.length + 1)), stage.h - 34 - ((stage.h - 70) * r) / Math.max(levels.length - 1, 1)])));
    ds.forEach((a) => ds.forEach((b) => { if (b > a && b % a === 0 && isPrimeRatio(b / a)) line(ctx, ...pos.get(a), ...pos.get(b), { color: c.ink, width: 2 }); }));
    const x = pick(state, 'i');
    const y = pick(state, 'j');
    const meet = gcd(x, y);
    const join = lcm(x, y);
    ds.forEach((d) => {
      const [px, py] = pos.get(d);
      const fill = d === meet || d === join ? c.fillC : d === x ? c.a : d === y ? c.b : c.paper;
      dot(ctx, px, py, d > 99 ? 16 : 14, fill, c.ink);
      label(ctx, String(d), px, py, c, { size: d > 99 ? 10 : 12, patch: false });
    });
    label(ctx, `meet = gcd(${x}, ${y}) = ${meet}    join = lcm(${x}, ${y}) = ${join}`, stage.w / 2, 14, c, { size: 12, bounds: stage });
  },
  controls: [
    { title: 'Divisors of n' },
    { key: 'n', label: 'n', options: [[12, '12'], [30, '30'], [36, '36'], [60, '60'], [210, '210']] },
    { key: 'i', label: 'First divisor, x', min: 0, max: 15, step: 1, format: (v) => String(pick({ ...state, i: v }, 'i')) },
    { key: 'j', label: 'Second divisor, y', min: 0, max: 15, step: 1, format: (v) => String(pick({ ...state, j: v }, 'j')) },
    { readout: [
      ['Divisors', (s) => String(divisors(s.n).length)],
      ['Meet (gcd)', (s) => String(gcd(pick(s, 'i'), pick(s, 'j')))],
      ['Join (lcm)', (s) => String(lcm(pick(s, 'i'), pick(s, 'j')))],
      ['Complement of x', (s) => { const x = pick(s, 'i'); return gcd(x, s.n / x) === 1 ? String(s.n / x) : 'none (x shares a factor with n/x)'; }],
      ['Boolean algebra?', (s) => ({ text: isSquarefree(s.n) ? 'yes: n has no repeated prime' : 'no: n has a repeated prime', good: isSquarefree(s.n) })],
    ] },
  ],
  tex: (s) => `\\gcd(${pick(s, 'i')},${pick(s, 'j')})\\cdot\\operatorname{lcm}(${pick(s, 'i')},${pick(s, 'j')})=${pick(s, 'i') * pick(s, 'j')}`,
});

function isPrimeRatio(r) { return factor(r).length === 1; }
