import { createTool } from '../../lib/tool.js';
import { cellGrid } from '../../lib/discrete.js';
import { gcd } from './_aa-math.js';
import { host, textBox } from './_aa-view.js';

// The multiplication table of ℤₙ. Coral cells are products that equal 0 although neither factor is 0: zero divisors.
// They appear exactly when n is composite. Singular 2 × 2 matrices do the same thing.
const state = { n: 6 };
export const zeroPairs = (n) => { const out = []; for (let a = 1; a < n; a++) for (let b = a; b < n; b++) if ((a * b) % n === 0) out.push([a, b]); return out; };
export const zeroDivisors = (n) => { const set = new Set(); for (let a = 1; a < n; a++) for (let b = 1; b < n; b++) if ((a * b) % n === 0) set.add(a); return [...set]; };

createTool({
  state,
  label: 'The multiplication table of the integers mod n. Cells that show 0 where neither the row nor the column is 0 are coral. Cells showing 1 are green. A table with no coral cells has no zero divisors.',
  dom(el) {
    el.classList.add('viz-stage--flow');
    const holder = host(el);
    const box = textBox(el);
    let grid = null;
    let built = 0;
    const refresh = () => {
      const n = state.n;
      if (built !== n) {
        holder.replaceChildren();
        built = n;
        grid = cellGrid(holder, {
          rows: n + 1, cols: n + 1,
          cell: (r, c) => {
            if (r === 0 && c === 0) return { text: '×', state: 'off' };
            if (r === 0 || c === 0) return { text: String((r === 0 ? c : r) - 1), state: 'off' };
            const [a, b] = [r - 1, c - 1];
            const p = (a * b) % state.n;
            return { text: String(p), state: p === 0 && a !== 0 && b !== 0 ? 'both' : p === 1 ? 'on' : '', label: `${a} times ${b}` };
          },
        });
        holder.firstChild.classList.add('viz-cells--tight');
      }
      grid.refresh();
      const pairs = zeroPairs(n);
      box.set(pairs.length ? [`Zero divisors: ${pairs.slice(0, 4).map(([a, b]) => `${a} × ${b} = ${a * b} ≡ 0`).join(',  ')}${pairs.length > 4 ? ', …' : ''}`, 'In the matrix ring, [1 0 | 0 0] × [0 0 | 0 1] is the zero matrix too, and its factors are singular (determinant 0).'] : [`No zero divisors: ${n} is prime, so ab ≡ 0 forces a ≡ 0 or b ≡ 0.`]);
    };
    refresh();
    return { refresh };
  },
  controls: [
    { title: 'Multiply mod n' },
    { key: 'n', label: 'Modulus, n', min: 2, max: 12, step: 1 },
    { readout: [
      ['Zero divisors', (s) => (zeroDivisors(s.n).length ? zeroDivisors(s.n).join(', ') : 'none')],
      ['How many', (s) => String(zeroDivisors(s.n).length)],
      ['Units (have an inverse)', (s) => String([...Array(s.n).keys()].filter((a) => gcd(a, s.n) === 1).length)],
      ['n is', (s) => ({ text: zeroDivisors(s.n).length ? 'composite' : 'prime', good: zeroDivisors(s.n).length === 0 })],
    ] },
  ],
  tex: (s) => `ab\\equiv 0\\ (\\bmod ${s.n}),\\ a,b\\not\\equiv 0${zeroPairs(s.n).length ? `:\\ ${zeroPairs(s.n)[0][0]}\\cdot ${zeroPairs(s.n)[0][1]}=${zeroPairs(s.n)[0][0] * zeroPairs(s.n)[0][1]}` : '\\ \\text{never}'}`,
});
