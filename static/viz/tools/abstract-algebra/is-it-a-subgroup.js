import { createTool } from '../../lib/tool.js';
import { cellGrid } from '../../lib/discrete.js';
import { cyclicGroup, dihedralGroup } from './_aa-math.js';
import { host, textBox } from './_aa-view.js';

// Press elements to build a subset H, then test it with the subgroup criterion: H is not empty, and a·b⁻¹ is in H for all a, b in H.
const GROUPS = {
  z12: { name: 'ℤ₁₂ with +', G: cyclicGroup(12), presets: [['multiples of 3', [0, 3, 6, 9]], ['{0, 4, 8}', [0, 4, 8]], ['{0, 1, 2, 3}', [0, 1, 2, 3]], ['{0, 6}', [0, 6]]] },
  d3: { name: 'Triangle symmetries', G: dihedralGroup(3), presets: [['rotations', [0, 1, 2]], ['{e, f}', [0, 3]], ['{e, f, rf}', [0, 3, 4]], ['{r, r²}', [1, 2]]] },
};
const state = { group: 'z12' };
let H = new Set([0]);
let shown = '';
const G = () => GROUPS[state.group].G;

function test() {
  const g = G();
  const list = [...H].sort((a, b) => a - b);
  if (!list.length) return { ok: false, lines: ['H is empty. A subgroup must contain the identity.'] };
  for (const a of list) for (const b of list) {
    const ab = g.mul(a, g.inv(b));
    if (!H.has(ab)) return { ok: false, lines: [`Fails the test: a = ${g.names[a]}, b = ${g.names[b]}.`, `a·b⁻¹ = ${g.names[a]} ∘ ${g.names[g.inv(b)]} = ${g.names[ab]}, which is not in H.`] };
  }
  return { ok: true, lines: ['Every a·b⁻¹ with a, b in H lies in H, so H is a subgroup.', `Its order is ${list.length}, and ${g.n} ÷ ${list.length} = ${g.n / list.length}.`] };
}

const tool = createTool({
  state,
  label: 'Every element of the group is a button. Pressing it adds or removes it from the subset H. A message below says whether H passes the subgroup test, and if not, which pair breaks it.',
  dom(el) {
    el.classList.add('viz-stage--flow');
    host(el, 'nb-label').textContent = 'Press elements to put them in H (green).';
    const holder = host(el);
    let grid = null;
    let built = '';
    const box = textBox(el);
    const build = () => {
      holder.replaceChildren();
      const n = G().n;
      const cols = n > 8 ? 6 : n;
      grid = cellGrid(holder, {
        rows: Math.ceil(n / cols), cols,
        cell: (r, c) => {
          const k = r * cols + c;
          return k < n ? { text: G().names[k], state: H.has(k) ? 'on' : '', label: `${G().names[k]} ${H.has(k) ? 'in H' : 'not in H'}` } : { text: '', state: 'off' };
        },
        onPress: (r, c) => {
          const k = r * cols + c;
          if (k >= n) return;
          if (H.has(k)) H.delete(k); else H.add(k);
          tool.update();
        },
      });
    };
    const refresh = () => {
      if (shown !== state.group) { H = new Set([0]); shown = state.group; }
      if (built !== state.group) { build(); built = state.group; }
      grid.refresh();
      const t = test();
      box.set([t.ok ? 'Subgroup ✓' : 'Not a subgroup ✗', ...t.lines]);
    };
    shown = state.group;
    refresh();
    return { refresh };
  },
  controls: (t) => [
    { title: 'Test a subset' },
    { key: 'group', label: 'Group', options: Object.entries(GROUPS).map(([k, v]) => [k, v.name]) },
    { text: 'Ready-made subsets of ℤ₁₂:' },
    { row: GROUPS.z12.presets.map(([name, set]) => ({ button: name, ghost: true, onClick() { if (state.group !== 'z12') return; H = new Set(set); t.update(); } })) },
    { text: 'Ready-made subsets of the triangle group:' },
    { row: GROUPS.d3.presets.map(([name, set]) => ({ button: name, ghost: true, onClick() { if (state.group !== 'd3') return; H = new Set(set); t.update(); } })) },
    { readout: [
      ['Members of H', () => String(H.size)],
      ['Contains identity', () => ({ text: H.has(0) ? 'yes' : 'no', good: H.has(0) })],
      ['Subgroup?', () => ({ text: test().ok ? 'yes' : 'no', good: test().ok })],
    ] },
  ],
});
