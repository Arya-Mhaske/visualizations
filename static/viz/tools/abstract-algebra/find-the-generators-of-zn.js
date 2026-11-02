import { createTool } from '../../lib/tool.js';
import { cellGrid } from '../../lib/discrete.js';
import { gcd, mod, phi } from './_aa-math.js';
import { host, textBox } from './_aa-view.js';

// k generates ℤₙ exactly when gcd(k, n) = 1. Green cells are generators; press a cell to see what k builds.
const state = { n: 12, k: 5 };
const orbit = (n, k) => { const out = []; for (let x = 0, i = 0; i === 0 || x !== 0; x = (x + k) % n, i++) out.push(x); return out; };

const tool = createTool({
  state,
  label: 'A grid of the numbers 1 to n minus 1. Green cells are generators of the integers mod n, meaning their multiples reach every residue. Pressing a cell shows the list of values it generates.',
  dom(el) {
    el.classList.add('viz-stage--flow');
    host(el, 'nb-label').textContent = 'Green = generator. Press a number to see what it builds.';
    const holder = host(el);
    const box = textBox(el);
    let grid = null;
    let built = 0;
    const refresh = () => {
      const { n } = state;
      state.k = Math.min(state.k, n - 1);
      if (built !== n) {
        holder.replaceChildren();
        built = n;
        grid = cellGrid(holder, {
          rows: Math.ceil((n - 1) / 6), cols: 6,
          cell: (r, c) => {
            const k = r * 6 + c + 1;
            if (k > state.n - 1) return { text: '', state: 'off' };
            const generator = gcd(k, state.n) === 1;
            return { text: String(k), state: k === state.k ? 'mark' : generator ? 'on' : '', label: `${k}${generator ? ' generates' : ' does not generate'}` };
          },
          onPress: (r, c) => {
            const k = r * 6 + c + 1;
            if (k <= state.n - 1) { state.k = k; tool.update(); }
          },
        });
      }
      grid.refresh();
      const cycle = orbit(n, state.k);
      box.set([`Multiples of ${state.k} in ℤ${n}: ${cycle.join(', ')}`, `That is ${cycle.length} of ${n} elements${cycle.length === n ? ': everything.' : '.'}`]);
    };
    refresh();
    return { refresh };
  },
  controls: [
    { title: 'Which k are generators?' },
    { key: 'n', label: 'n', min: 2, max: 30, step: 1 },
    { key: 'k', label: 'k', min: 1, max: 29, step: 1, format: (v) => String(Math.min(v, state.n - 1)) },
    { readout: [
      ['gcd(k, n)', (s) => String(gcd(Math.min(s.k, s.n - 1), s.n))],
      ['k generates ℤₙ?', (s) => { const ok = gcd(Math.min(s.k, s.n - 1), s.n) === 1; return { text: ok ? 'yes' : 'no', good: ok }; }],
      ['Generators in all', (s) => `φ(${s.n}) = ${phi(s.n)}`],
      ['Order of k', (s) => String(s.n / gcd(Math.min(s.k, s.n - 1), s.n))],
    ] },
  ],
  tex: (s) => `\\langle k\\rangle=\\mathbb Z_{${s.n}}\\iff\\gcd(k,${s.n})=1`,
});
void mod;
