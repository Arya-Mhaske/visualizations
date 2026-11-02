import { createTool } from '../../lib/tool.js';
import { cellGrid } from '../../lib/discrete.js';
import { gcd, lcm } from './_aa-math.js';
import { host, textBox } from './_aa-view.js';

// Each cell is an element (i, j) of ℤ_m × ℤ_n, and its text is that element's order. ℤ_m × ℤ_n is cyclic exactly when
// some element has order mn, and that happens exactly when gcd(m, n) = 1.
const state = { m: 2, n: 3 };
export const orderAt = (m, n, i, j) => lcm(m / gcd(i, m), n / gcd(j, n));
const best = (s) => { let top = 1; for (let i = 0; i < s.m; i++) for (let j = 0; j < s.n; j++) top = Math.max(top, orderAt(s.m, s.n, i, j)); return top; };

createTool({
  state,
  label: 'A grid with a cell for every element of the product of two cyclic groups. Each cell shows the element order. A green cell has order equal to the size of the whole group, which would make the product cyclic.',
  dom(el) {
    el.classList.add('viz-stage--flow');
    host(el, 'nb-label').textContent = 'Each cell is an element (i, j); the number is its order.';
    let grid = null;
    let built = '';
    const holder = host(el);
    const box = textBox(el);
    const refresh = () => {
      const id = `${state.m}x${state.n}`;
      if (built !== id) {
        holder.replaceChildren();
        built = id;
        grid = cellGrid(holder, {
          rows: state.m, cols: state.n,
          cell: (r, c) => { const o = orderAt(state.m, state.n, r, c); return { text: String(o), state: o === state.m * state.n ? 'on' : o === 1 ? 'mark' : '', label: `(${r}, ${c}) has order ${o}` }; },
        });
        holder.firstChild.dataset.cols = state.n;
      }
      grid.refresh();
      const full = best(state) === state.m * state.n;
      box.set([`Largest order of any element: ${best(state)}. The group has ${state.m * state.n} elements.`, full ? `An element of order ${state.m * state.n} exists, so ℤ${state.m} × ℤ${state.n} ≅ ℤ${state.m * state.n}.` : `No element reaches ${state.m * state.n}, so ℤ${state.m} × ℤ${state.n} is not cyclic and not ≅ ℤ${state.m * state.n}.`]);
    };
    refresh();
    return { refresh };
  },
  controls: [
    { title: 'Two cyclic groups' },
    { key: 'm', label: 'First, ℤ_m', min: 2, max: 6, step: 1 },
    { key: 'n', label: 'Second, ℤ_n', min: 2, max: 6, step: 1 },
    { readout: [
      ['gcd(m, n)', (s) => String(gcd(s.m, s.n))],
      ['Cyclic?', (s) => { const ok = best(s) === s.m * s.n; return { text: ok ? 'yes' : 'no', good: ok }; }],
      ['Largest order', (s) => String(best(s))],
    ] },
  ],
  tex: (s) => `\\mathbb Z_{${s.m}}\\times\\mathbb Z_{${s.n}}\\cong\\mathbb Z_{${s.m * s.n}}\\iff\\gcd(${s.m},${s.n})=${gcd(s.m, s.n)}=1`,
});
