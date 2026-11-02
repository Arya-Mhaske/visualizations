import { createTool } from '../../lib/tool.js';
import { cellGrid } from '../../lib/discrete.js';
import { gcd, modinv, phi } from './_aa-math.js';
import { host, textBox } from './_aa-view.js';

// ℤₙ is a field when every non-zero a has an inverse: some x with ax ≡ 1 (mod n). Each cell shows a⁻¹, or – when none exists.
const state = { n: 6 };

const tool = createTool({
  state,
  label: 'A grid of the numbers 1 to n minus 1. Each cell shows its inverse mod n, in green, or a dash in coral if it has none. If every cell is green, the integers mod n form a field. That happens only when n is prime.',
  dom(el) {
    el.classList.add('viz-stage--flow');
    host(el, 'nb-label').textContent = 'Each cell: a, and its inverse a⁻¹ (mod n).';
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
          rows: Math.ceil((n - 1) / 6), cols: 6,
          cell: (r, c) => {
            const a = r * 6 + c + 1;
            if (a > state.n - 1) return { text: '', state: 'off' };
            const inv = modinv(a, state.n);
            return { text: `${a}→${inv === null ? '–' : inv}`, state: inv === null ? 'both' : 'on', label: inv === null ? `${a} has no inverse` : `inverse of ${a} is ${inv}` };
          },
        });
      }
      grid.refresh();
      const missing = [...Array(n - 1).keys()].map((k) => k + 1).filter((a) => gcd(a, n) > 1);
      if (!missing.length) box.set([`Every non-zero number has an inverse, so ℤ${n} is a field.`]);
      else {
        const a = missing[0];
        const b = n / gcd(a, n);
        box.set([`${missing.length} of ${n - 1} numbers have no inverse (${missing.slice(0, 5).join(', ')}${missing.length > 5 ? ', …' : ''}), so ℤ${n} is not a field.`, `Why: ${a} × ${b} = ${a * b} ≡ 0, so ${a} would have to turn a non-zero number into 0 and could never reach 1.`]);
      }
    };
    refresh();
    return { refresh };
  },
  controls: [
    { title: 'Look for inverses' },
    { key: 'n', label: 'Modulus, n', min: 2, max: 30, step: 1 },
    { readout: [
      ['Numbers with an inverse', (s) => `${phi(s.n)} of ${s.n - 1}`],
      ['ℤₙ is a field?', (s) => { const ok = phi(s.n) === s.n - 1; return { text: ok ? 'yes: n is prime' : 'no', good: ok }; }],
    ] },
  ],
  tex: (s) => `\\varphi(${s.n})=${phi(s.n)}${phi(s.n) === s.n - 1 ? '=n-1' : '<n-1'}`,
});
void tool;
