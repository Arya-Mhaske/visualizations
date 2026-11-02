import { createTool } from '../../lib/tool.js';
import { cellGrid } from '../../lib/discrete.js';
import { gcd } from './_aa-math.js';
import { figure, host, textBox } from './_aa-view.js';

// Colour the four corners of a square. Two colourings count as the same if a symmetry turns one into the other.
// Burnside: the number of different colourings = (1/|G|) × (sum over symmetries g of the colourings g leaves unchanged).
const state = { k: 2, group: 'rot' };
const ROT = [[0, 1, 2, 3], [1, 2, 3, 0], [2, 3, 0, 1], [3, 0, 1, 2]];
const FLIP = [[0, 3, 2, 1], [1, 0, 3, 2], [2, 1, 0, 3], [3, 2, 1, 0]];
const NAMES = { rot: ['e', 'r', 'r²', 'r³'], dih: ['e', 'r', 'r²', 'r³', 's1', 's2', 's3', 's4'] };
const perms = (g) => (g === 'rot' ? ROT : [...ROT, ...FLIP]);
const cyclesCount = (p) => { const seen = new Set(); let n = 0; for (let i = 0; i < 4; i++) if (!seen.has(i)) { n++; for (let j = i; !seen.has(j); j = p[j]) seen.add(j); } return n; };
export const fixedCount = (p, k) => k ** cyclesCount(p);
export const burnside = (g, k) => perms(g).reduce((sum, p) => sum + fixedCount(p, k), 0) / perms(g).length;
function orbits(g, k) {
  const total = k ** 4;
  const code = (col) => col.reduce((acc, x) => acc * k + x, 0);
  const decode = (n) => { const col = []; for (let i = 3; i >= 0; i--) { col[i] = n % k; n = Math.floor(n / k); } return col; };
  const seen = new Set();
  const out = [];
  for (let n = 0; n < total; n++) {
    if (seen.has(n)) continue;
    const members = new Map();
    for (const p of perms(g)) {
      const col = decode(n);
      const moved = [];
      col.forEach((x, i) => { moved[p[i]] = x; });
      members.set(code(moved), moved);
    }
    members.forEach((_, key) => seen.add(key));
    out.push([...members.values()]);
  }
  return out;
}

const tool = createTool({
  state,
  label: 'Every way to colour the four corners of a square, grouped into boxes. Colourings in the same box can be turned into each other by a symmetry. The number of boxes is the number of truly different colourings. A table gives the Burnside count.',
  dom(el, c) {
    el.classList.add('viz-stage--flow');
    const pic = figure(el, c, (ctx, st) => {
      const list = orbits(state.group, state.k);
      const colour = [c.paper, c.ink, c.fillA];
      const m = state.k === 2 ? 20 : 14;
      let [x, y] = [8, 8];
      const rowH = m * 2 + 14;
      list.forEach((orbit) => {
        const wide = orbit.length * (m * 2 + 5) + 8;
        if (x + wide > st.w - 4 && x > 8) { x = 8; y += rowH; }
        ctx.strokeStyle = c.ink;
        ctx.lineWidth = 2;
        ctx.fillStyle = c.fillY;
        ctx.fillRect(x, y, wide - 4, m * 2 + 8);
        ctx.strokeRect(x, y, wide - 4, m * 2 + 8);
        orbit.forEach((col, j) => {
          const bx = x + 4 + j * (m * 2 + 5);
          [[0, 0], [1, 0], [1, 1], [0, 1]].forEach(([dx, dy], i) => {
            ctx.fillStyle = colour[col[i]];
            ctx.fillRect(bx + dx * m, y + 4 + dy * m, m, m);
          });
          ctx.strokeStyle = c.ink;
          ctx.lineWidth = 1.5;
          ctx.strokeRect(bx, y + 4, m * 2, m * 2);
        });
        x += wide + 2;
      });
    }, 'All the colourings of a square grouped into orbits.', true);
    const holder = host(el);
    const box = textBox(el);
    let grid = null;
    let built = '';
    const refresh = () => {
      pic.invalidate();
      const id = `${state.group}${state.k}`;
      if (built !== id) {
        holder.replaceChildren();
        built = id;
        const ps = perms(state.group);
        grid = cellGrid(holder, {
          rows: ps.length + 1, cols: 3,
          cell: (r, col) => {
            const now = perms(state.group);
            if (r === 0) return { text: ['symmetry', 'cycles', `colourings fixed`][col], state: 'off' };
            if (col === 0) return { text: NAMES[state.group][r - 1], state: 'mark' };
            return { text: String(col === 1 ? cyclesCount(now[r - 1]) : fixedCount(now[r - 1], state.k)), state: '' };
          },
        });
      }
      grid.refresh();
      const ps = perms(state.group);
      const sum = ps.reduce((acc, p) => acc + fixedCount(p, state.k), 0);
      box.set([`Sum of fixed colourings = ${sum}.  ${sum} ÷ ${ps.length} = ${sum / ps.length} truly different colourings.`, `Out of ${state.k ** 4} raw colourings. Boxes drawn: ${orbits(state.group, state.k).length}.`]);
    };
    refresh();
    return { refresh };
  },
  controls: [
    { title: 'Colour the corners' },
    { key: 'k', label: 'Number of colours', options: [[2, '2 (black, white)'], [3, '3 (adds coral)']] },
    { key: 'group', label: 'Allowed symmetries', options: [['rot', 'Turns only (4)'], ['dih', 'Turns and flips (8)']] },
    { readout: [
      ['Raw colourings', (s) => String(s.k ** 4)],
      ['Truly different (Burnside)', (s) => String(burnside(s.group, s.k))],
      ['Boxes drawn', (s) => String(orbits(s.group, s.k).length)],
    ] },
  ],
  tex: (s) => `\\frac1{|G|}\\sum_g |\\mathrm{Fix}(g)|=\\frac{${perms(s.group).reduce((a, p) => a + fixedCount(p, s.k), 0)}}{${perms(s.group).length}}=${burnside(s.group, s.k)}`,
});
void tool;
void gcd;
