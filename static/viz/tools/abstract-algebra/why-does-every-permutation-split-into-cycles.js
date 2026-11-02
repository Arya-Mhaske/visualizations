import { createTool } from '../../lib/tool.js';
import { arrow, dot, label } from '../../lib/draw.js';
import { createRng } from '../../lib/rng.js';
import { cycleText, cyclesOf, identityPerm, permOrder } from './_aa-math.js';
import { specFill, spec } from './_aa-view.js';

// Follow the arrows i → p(i) from any start. Each element has exactly one arrow in and one out, so the path must come back: a cycle.
const state = { n: 8, a: 1, b: 2 };
const rng = createRng(11);
let perm = [];
function shuffle(n) {
  const p = identityPerm(n);
  for (let i = n - 1; i > 0; i--) { const j = rng.int(0, i); [p[i], p[j]] = [p[j], p[i]]; }
  perm = p;
}
shuffle(state.n);

const tool = createTool({
  state,
  label: 'Numbers 1 to n on a ring with an arrow from each i to p of i. Following the arrows from any start returns to it. Each loop of arrows is one cycle and has its own colour.',
  draw(ctx, stage, c) {
    const [cx, cy, R] = [stage.w / 2, stage.h / 2, Math.min(stage.w, stage.h) * 0.36];
    const at = (i, r = R) => [cx + r * Math.cos(-Math.PI / 2 + (2 * Math.PI * i) / perm.length), cy + r * Math.sin(-Math.PI / 2 + (2 * Math.PI * i) / perm.length)];
    const cycles = cyclesOf(perm);
    cycles.forEach((cy2, idx) => {
      cy2.forEach((i) => {
        const j = perm[i];
        const [x1, y1] = at(i);
        const [x2, y2] = at(j);
        if (i === j) {
          dot(ctx, x1, y1, 20, 'transparent', spec(c, idx), 3);
          return;
        }
        const [dx, dy] = [x2 - x1, y2 - y1];
        const len = Math.hypot(dx, dy);
        arrow(ctx, x1 + (dx / len) * 14, y1 + (dy / len) * 14, x2 - (dx / len) * 15, y2 - (dy / len) * 15, { color: spec(c, idx), width: 3, head: 10 });
      });
    });
    perm.forEach((_, i) => {
      const [x, y] = at(i);
      const idx = cycles.findIndex((cy2) => cy2.includes(i));
      dot(ctx, x, y, 13, specFill(c, idx), c.ink);
      label(ctx, String(i + 1), x, y, c, { size: 12, patch: false });
    });
  },
  controls: (t) => [
    { title: 'Make a permutation' },
    { key: 'n', label: 'Elements, n', min: 3, max: 10, step: 1 },
    { row: [{ button: 'Shuffle', onClick() { shuffle(state.n); t.update(); } }] },
    { key: 'a', label: 'Swap the images of a …', min: 1, max: 10, step: 1, format: (v) => String(Math.min(v, state.n)) },
    { key: 'b', label: '… and of b', min: 1, max: 10, step: 1, format: (v) => String(Math.min(v, state.n)) },
    { row: [{ button: 'Swap', onClick() { const a = Math.min(state.a, state.n) - 1; const b = Math.min(state.b, state.n) - 1; [perm[a], perm[b]] = [perm[b], perm[a]]; t.update(); } }] },
    { readout: [
      ['In cycle notation', () => cycleText(perm)],
      ['Cycle lengths', () => cyclesOf(perm).map((cy) => cy.length).sort((x, y) => y - x).join(' + ')],
      ['Order of p', () => String(permOrder(perm))],
    ] },
  ],
  onChange: (s) => { if (perm.length !== s.n) shuffle(s.n); },
  tex: () => `p=${cycleText(perm)}`,
});
void tool;
