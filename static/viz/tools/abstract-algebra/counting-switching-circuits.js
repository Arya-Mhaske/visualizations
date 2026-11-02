import { createTool } from '../../lib/tool.js';
import { cellGrid } from '../../lib/discrete.js';
import { allPerms, cyclesOf } from './_aa-math.js';
import { host, textBox } from './_aa-view.js';

// A switching function of n inputs is a rule {0,1}^n → {0,1}: there are 2^(2^n) of them. Relabelling the inputs (a permutation
// of the n wires) can turn one function into another. Count the functions that are truly different with Burnside:
// a wire permutation σ fixes 2^(c) functions, where c is the number of cycles of σ acting on the 2^n input patterns.
const state = { n: 3 };
const inputsCycles = (n, perm) => {
  const total = 1 << n;
  const move = (x) => { let y = 0; for (let i = 0; i < n; i++) if ((x >> i) & 1) y |= 1 << perm[i]; return y; };
  const map = [...Array(total).keys()].map(move);
  return cyclesOf(map).length;
};
export function table(n) {
  const groups = new Map();
  for (const p of allPerms(n)) {
    const type = cyclesOf(p).map((cy) => cy.length).sort((a, b) => b - a).join('+');
    const c = inputsCycles(n, p);
    const g = groups.get(type) || { type, count: 0, c, fixed: 2 ** c };
    g.count++;
    groups.set(type, g);
  }
  return [...groups.values()];
}
export const burnsideCount = (n) => table(n).reduce((sum, g) => sum + g.count * g.fixed, 0) / table(n).reduce((s, g) => s + g.count, 0);
const direct = {};
function orbitsDirect(n) {
  if (direct[n]) return direct[n];
  const total = 1 << n;
  const perms = allPerms(n);
  const moves = perms.map((perm) => [...Array(total).keys()].map((x) => { let y = 0; for (let i = 0; i < n; i++) if ((x >> i) & 1) y |= 1 << perm[i]; return y; }));
  const seen = new Set();
  let orbits = 0;
  for (let f = 0; f < 2 ** total; f++) {
    if (seen.has(f)) continue;
    orbits++;
    for (const m of moves) {
      let g = 0;
      for (let x = 0; x < total; x++) if ((f >> x) & 1) g |= 1 << m[x];
      seen.add(g);
    }
  }
  direct[n] = orbits;
  return orbits;
}

const tool = createTool({
  state,
  label: 'A table with one row for each kind of wire permutation. For each kind it gives how many such permutations there are, how many cycles they make on the input patterns, and how many switching functions they leave unchanged. The average of the last column is the number of truly different circuits.',
  dom(el) {
    el.classList.add('viz-stage--flow');
    const holder = host(el);
    const box = textBox(el);
    let grid = null;
    let built = 0;
    const refresh = () => {
      const rows = table(state.n);
      if (built !== state.n) {
        holder.replaceChildren();
        built = state.n;
        grid = cellGrid(holder, {
          rows: rows.length + 1, cols: 4,
          cell: (r, c) => {
            const t = table(state.n);
            if (r === 0) return { text: ['cycle type', 'how many', 'cycles on inputs', 'functions fixed'][c], state: 'off' };
            const g = t[r - 1];
            return { text: [g.type, String(g.count), String(g.c), String(g.fixed)][c], state: c === 3 ? 'mark' : '' };
          },
        });
      }
      grid.refresh();
      const total = rows.reduce((s, g) => s + g.count, 0);
      const sum = rows.reduce((s, g) => s + g.count * g.fixed, 0);
      box.set([`Sum = ${sum}.  ${sum} ÷ ${total} = ${sum / total} truly different circuits, out of ${2 ** (2 ** state.n)} functions.`, `Counting by listing every function and its relabellings gives ${orbitsDirect(state.n)}.`]);
    };
    refresh();
    return { refresh };
  },
  controls: [
    { title: 'How many wires?' },
    { key: 'n', label: 'Inputs, n', min: 2, max: 4, step: 1 },
    { readout: [
      ['Switching functions', (s) => String(2 ** (2 ** s.n))],
      ['Relabellings of the wires', (s) => String(allPerms(s.n).length)],
      ['Truly different (Burnside)', (s) => String(burnsideCount(s.n))],
    ] },
  ],
  tex: (s) => `\\frac{1}{${allPerms(s.n).length}}\\sum_\\sigma 2^{c(\\sigma)}=${burnsideCount(s.n)}`,
});
void tool;
