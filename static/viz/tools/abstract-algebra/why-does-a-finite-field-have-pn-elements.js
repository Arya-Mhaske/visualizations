import { createTool } from '../../lib/tool.js';
import { cellGrid } from '../../lib/discrete.js';
import { finiteField } from './_aa-math.js';
import { host, textBox } from './_aa-view.js';

// Build a field by taking polynomials of degree below n with coefficients mod p, and multiplying them mod an irreducible polynomial.
// There are p choices for each of n coefficients, so the field has p^n elements. Cells show an element's code (its coefficients read in base p).
const FIELDS = {
  gf4: { name: 'GF(4): ℤ₂, x² + x + 1', p: 2, f: [1, 1, 1] },
  gf8: { name: 'GF(8): ℤ₂, x³ + x + 1', p: 2, f: [1, 1, 0, 1] },
  gf9: { name: 'GF(9): ℤ₃, x² + 1', p: 3, f: [1, 0, 1] },
  gf5: { name: 'GF(5) = ℤ₅', p: 5, f: [0, 1] },
};
const state = { field: 'gf4', op: 'times', e: 2 };
const cache = {};
const F = () => (cache[state.field] ||= finiteField(FIELDS[state.field].p, FIELDS[state.field].f));
const elem = () => Math.min(state.e, F().size - 1);
const inverseOf = (k) => { const T = F().times; for (let j = 0; j < F().size; j++) if (T[k][j] === 1) return j; return null; };

const tool = createTool({
  state,
  label: 'The addition or multiplication table of a small finite field. Each element is a polynomial with coefficients mod p, shown by a code number. The chosen element has its row highlighted and its inverse is found in the table.',
  dom(el) {
    el.classList.add('viz-stage--flow');
    const holder = host(el);
    const box = textBox(el);
    let grid = null;
    let built = '';
    const refresh = () => {
      const field = F();
      if (built !== state.field) {
        holder.replaceChildren();
        built = state.field;
        grid = cellGrid(holder, {
          rows: field.size + 1, cols: field.size + 1,
          cell: (r, c) => {
            const T = state.op === 'times' ? F().times : F().add;
            if (r === 0 && c === 0) return { text: state.op === 'times' ? '×' : '+', state: 'off' };
            if (r === 0 || c === 0) return { text: String((r === 0 ? c : r) - 1), state: 'off' };
            const [a, b] = [r - 1, c - 1];
            const v = T[a][b];
            const identity = state.op === 'times' ? 1 : 0;
            return { text: String(v), state: a === elem() || b === elem() ? 'mark' : v === identity ? 'on' : '' };
          },
        });
        holder.firstChild.classList.add('viz-cells--tight');
      }
      grid.refresh();
      const k = elem();
      const inv = inverseOf(k);
      box.set([`Elements: ${[...Array(field.size).keys()].map((j) => `${j} = ${field.text(j)}`).join(',  ')}`, k === 0 ? 'Zero has no inverse, and needs none.' : `The inverse of ${field.text(k)} (code ${k}) is ${field.text(inv)} (code ${inv}): their product is 1.`]);
    };
    refresh();
    return { refresh };
  },
  controls: [
    { title: 'Build a field' },
    { key: 'field', label: 'Field', options: Object.entries(FIELDS).map(([k, v]) => [k, v.name]) },
    { key: 'op', label: 'Table', options: [['times', 'Multiplication'], ['plus', 'Addition']] },
    { key: 'e', label: 'Look at element (code)', min: 0, max: 8, step: 1, format: (v) => String(Math.min(v, F().size - 1)) },
    { readout: [
      ['Elements', () => { const f = FIELDS[state.field]; return `${f.p}^${f.f.length - 1} = ${F().size}`; }],
      ['Every non-zero element invertible?', () => { const ok = [...Array(F().size).keys()].slice(1).every((k) => inverseOf(k) !== null); return { text: ok ? 'yes: a field' : 'no', good: ok }; }],
    ] },
  ],
  tex: () => { const f = FIELDS[state.field]; return `|\\mathrm{GF}|=p^n=${f.p}^{${f.f.length - 1}}=${F().size}`; },
});
void tool;
