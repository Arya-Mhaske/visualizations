import { createTool } from '../../lib/tool.js';
import { cellGrid } from '../../lib/discrete.js';
import { host, textBox } from './_aa-view.js';

// Relabel ℤ₄ = {0, 1, 2, 3} with the four rotations of a square, R0, R90, R180, R270 (R_x then R_y is R_(x+y)).
// A relabelling is an isomorphism when it is a bijection and φ(a + b) = φ(a) ∘ φ(b) for every a, b.
const ROT = ['R0', 'R90', 'R180', 'R270'];
const state = { f0: 0, f1: 1, f2: 2, f3: 3 };
const f = (s) => [s.f0, s.f1, s.f2, s.f3];
const bad = (s) => { const img = f(s); const out = []; for (let a = 0; a < 4; a++) for (let b = 0; b < 4; b++) if (img[(a + b) % 4] !== (img[a] + img[b]) % 4) out.push([a, b]); return out; };
const bijective = (s) => new Set(f(s)).size === 4;
const set = (s, img) => img.forEach((v, i) => { s[`f${i}`] = v; });

const tool = createTool({
  state,
  label: 'A four by four table of ℤ₄ additions. Each cell compares the label of a plus b with the product of the labels of a and b. Green means they agree, coral means the relabelling breaks the pattern there.',
  dom(el) {
    el.classList.add('viz-stage--flow');
    host(el, 'nb-label').textContent = 'Cell (a, b): does φ(a + b) equal φ(a) ∘ φ(b)?';
    const grid = cellGrid(host(el), {
      rows: 5, cols: 5,
      cell: (r, c) => {
        if (r === 0 && c === 0) return { text: 'a \\ b', state: 'off' };
        if (r === 0 || c === 0) return { text: String((r === 0 ? c : r) - 1), state: 'off' };
        const [a, b] = [r - 1, c - 1];
        const img = f(state);
        const ok = img[(a + b) % 4] === (img[a] + img[b]) % 4;
        return { text: `${ROT[img[(a + b) % 4]]}${ok ? '' : '≠'}`.replace('R', ''), state: ok ? 'on' : 'both', label: `${a} + ${b}` };
      },
    });
    const box = textBox(el);
    const refresh = () => {
      grid.refresh();
      const img = f(state);
      const ok = bad(state).length === 0 && bijective(state);
      box.set([`φ: 0 → ${ROT[img[0]]},  1 → ${ROT[img[1]]},  2 → ${ROT[img[2]]},  3 → ${ROT[img[3]]}`, ok ? 'A bijection that keeps every sum: the two groups are the same up to relabelling (isomorphic).' : !bijective(state) ? 'Two elements share a label, so it is not a bijection.' : `${bad(state).length} of 16 sums are not kept.`]);
    };
    refresh();
    return { refresh };
  },
  controls: (t) => [
    { title: 'Relabel ℤ₄' },
    { key: 'f0', label: 'φ(0)', min: 0, max: 3, step: 1, format: (v) => ROT[v] },
    { key: 'f1', label: 'φ(1)', min: 0, max: 3, step: 1, format: (v) => ROT[v] },
    { key: 'f2', label: 'φ(2)', min: 0, max: 3, step: 1, format: (v) => ROT[v] },
    { key: 'f3', label: 'φ(3)', min: 0, max: 3, step: 1, format: (v) => ROT[v] },
    { text: 'Ready-made relabellings:' },
    { row: [
      { button: 'k → R(90k)', ghost: true, onClick() { set(state, [0, 1, 2, 3]); t.update(); } },
      { button: 'k → R(270k)', ghost: true, onClick() { set(state, [0, 3, 2, 1]); t.update(); } },
    ] },
    { row: [
      { button: 'k → R(180k)', ghost: true, onClick() { set(state, [0, 2, 0, 2]); t.update(); } },
      { button: 'k → R(90(k+1))', ghost: true, onClick() { set(state, [1, 2, 3, 0]); t.update(); } },
    ] },
    { readout: [
      ['Bijection', (s) => ({ text: bijective(s) ? 'yes' : 'no', good: bijective(s) })],
      ['Sums kept', (s) => ({ text: `${16 - bad(s).length} of 16`, good: bad(s).length === 0 })],
      ['Isomorphism', (s) => { const ok = bijective(s) && bad(s).length === 0; return { text: ok ? 'yes' : 'no', good: ok }; }],
    ] },
  ],
});
void tool;
