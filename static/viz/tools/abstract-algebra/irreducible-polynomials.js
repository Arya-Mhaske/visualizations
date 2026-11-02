import { createTool } from '../../lib/tool.js';
import { cellGrid } from '../../lib/discrete.js';
import { mod } from './_aa-math.js';
import { host, textBox } from './_aa-view.js';

// A polynomial of degree 2 or 3 is irreducible over a field exactly when it has no root there (a root a gives a factor x − a).
// Over ℝ and ℂ we use the discriminant and the fundamental theorem of algebra; over ℚ the rational root test; over ℤ_p we try every element.
const POLYS = {
  a: { name: 'x² + 1', c: [1, 0, 1] },
  b: { name: 'x² − 2', c: [-2, 0, 1] },
  c: { name: 'x² + x + 1', c: [1, 1, 1] },
  d: { name: 'x³ + x + 1', c: [1, 1, 0, 1] },
  e: { name: 'x² − 1', c: [-1, 0, 1] },
  f: { name: 'x³ − 2', c: [-2, 0, 0, 1] },
};
const FIELDS = { Q: 'ℚ', R: 'ℝ', C: 'ℂ', 2: 'ℤ₂', 3: 'ℤ₃' };
const state = { poly: 'a', field: '2' };
const evalAt = (c, x) => c.reduce((acc, k, i) => acc + k * x ** i, 0);
const names = { Q: 'ℚ', R: 'ℝ', C: 'ℂ' };

export function analyse(polyKey, field) {
  const c = POLYS[polyKey].c;
  const deg = c.length - 1;
  if (field === 'C') return { irreducible: false, points: [], why: `Over ℂ every polynomial of degree ${deg} splits into linear factors (fundamental theorem of algebra).` };
  if (field === 'R') {
    if (deg === 3) return { irreducible: false, points: [], why: 'A real cubic always crosses the x axis, so it has a real root and a linear factor.' };
    const disc = c[1] * c[1] - 4 * c[2] * c[0];
    return { irreducible: disc < 0, points: [], why: `Discriminant b² − 4ac = ${disc}. ${disc < 0 ? 'Negative: no real roots, so it cannot be factorised over ℝ.' : 'Not negative: real roots exist, so it splits over ℝ.'}` };
  }
  if (field === 'Q') {
    const k = Math.abs(c[0]);
    const cands = [];
    for (let d = 1; d <= k; d++) if (k % d === 0) cands.push(d, -d);
    const points = (k === 0 ? [0] : cands.sort((x, y) => x - y)).map((x) => [x, evalAt(c, x)]);
    const root = points.find(([, v]) => v === 0);
    return { irreducible: !root, points, why: root ? `${root[0]} is a root, so (x ${root[0] < 0 ? '+' : '−'} ${Math.abs(root[0])}) is a factor.` : 'The only possible rational roots are the divisors of the constant term. None works, so there is no linear factor.' };
  }
  const p = Number(field);
  const points = [...Array(p).keys()].map((x) => [x, mod(evalAt(c, x), p)]);
  const root = points.find(([, v]) => v === 0);
  return { irreducible: !root, points, why: root ? `${root[0]} is a root mod ${p}, so (x − ${root[0]}) is a factor.` : `No element of ℤ${p} is a root, so the polynomial has no linear factor.` };
}

const tool = createTool({
  state,
  label: 'A table of candidate roots and the value of the polynomial at each. A value of zero (coral) is a root, which means the polynomial has a linear factor and is reducible. A sentence below explains the verdict for the chosen field.',
  dom(el) {
    el.classList.add('viz-stage--flow');
    const holder = host(el);
    const box = textBox(el);
    let grid = null;
    let built = '';
    const refresh = () => {
      const res = analyse(state.poly, state.field);
      const id = `${state.poly}|${state.field}`;
      if (built !== id) {
        holder.replaceChildren();
        built = id;
        grid = res.points.length ? cellGrid(holder, {
          rows: 2, cols: res.points.length,
          cell: (r, c) => {
            const now = analyse(state.poly, state.field).points;
            if (c >= now.length) return { text: '' };
            return r === 0 ? { text: `x=${now[c][0]}`, state: 'off' } : { text: String(now[c][1]), state: now[c][1] === 0 ? 'both' : 'on' };
          },
        }) : null;
        if (grid) holder.firstChild.dataset.cols = Math.min(res.points.length, 8);
      }
      if (grid) grid.refresh();
      box.set([`${POLYS[state.poly].name} over ${FIELDS[state.field]}: ${res.irreducible ? 'irreducible' : 'reducible'}.`, res.why]);
    };
    refresh();
    return { refresh };
  },
  controls: [
    { title: 'Test a polynomial' },
    { key: 'poly', label: 'Polynomial', options: Object.entries(POLYS).map(([k, v]) => [k, v.name]) },
    { key: 'field', label: 'Field', options: Object.entries(FIELDS) },
    { readout: [['Verdict', (s) => { const ok = analyse(s.poly, s.field).irreducible; return { text: ok ? 'irreducible' : 'reducible', good: ok }; }]] },
  ],
  tex: (s) => `${POLYS[s.poly].name.replace('²', '^2').replace('³', '^3').replaceAll('−', '-')}\\ \\text{over}\\ ${s.field === 'Q' ? '\\mathbb Q' : s.field === 'R' ? '\\mathbb R' : s.field === 'C' ? '\\mathbb C' : `\\mathbb Z_${s.field}`}`,
});
void tool;
void names;
