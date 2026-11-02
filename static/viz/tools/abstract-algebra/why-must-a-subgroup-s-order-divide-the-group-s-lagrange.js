import { createTool } from '../../lib/tool.js';
import { label } from '../../lib/draw.js';
import { cyclicGroup, dihedralGroup, generated, leftCosets, productGroup, quaternionGroup } from './_aa-math.js';
import { specFill } from './_aa-view.js';

// Pick a group and two elements. H is the subgroup they generate. Its left cosets gH all have |H| elements and share nothing,
// so |G| = (number of cosets) × |H|.
const GROUPS = {
  z12: { name: 'ℤ₁₂', G: cyclicGroup(12) },
  s3: { name: 'Triangle (D₃)', G: dihedralGroup(3) },
  d4: { name: 'Square (D₄)', G: dihedralGroup(4) },
  q8: { name: 'Q₈', G: quaternionGroup() },
  z26: { name: 'ℤ₂ × ℤ₆', G: productGroup(cyclicGroup(2), cyclicGroup(6)) },
};
const state = { group: 'd4', x: 2, y: 0 };
const G = () => GROUPS[state.group].G;
const sub = () => generated(G(), [Math.min(state.x, G().n - 1), Math.min(state.y, G().n - 1)]);

createTool({
  state,
  label: 'The elements of a group laid out in rows. Each row is one left coset of the subgroup H, drawn in its own colour. Every row has the same number of boxes, so the size of the group is the number of rows times the size of H.',
  draw(ctx, stage, c) {
    const H = sub();
    const cosets = leftCosets(G(), H);
    const rowH = Math.min(54, (stage.h - 50) / cosets.length);
    const cell = Math.min(52, (stage.w - 24) / H.length);
    cosets.forEach((coset, r) => {
      const y = 26 + r * rowH;
      coset.forEach((el, k) => {
        const x = 12 + k * cell;
        ctx.fillStyle = specFill(c, r);
        ctx.fillRect(x, y, cell - 3, rowH - 5);
        ctx.strokeStyle = c.ink;
        ctx.lineWidth = el === G().id ? 3.5 : 2;
        ctx.strokeRect(x, y, cell - 3, rowH - 5);
        label(ctx, G().names[el], x + (cell - 3) / 2, y + (rowH - 5) / 2, c, { size: cell < 34 ? 9 : 11, patch: false });
      });
    });
    label(ctx, `${cosets.length} cosets × ${H.length} elements = ${cosets.length * H.length}`, stage.w / 2, 12, c, { size: 13, bounds: stage });
  },
  controls: [
    { title: 'Generate a subgroup' },
    { key: 'group', label: 'Group', options: Object.entries(GROUPS).map(([k, v]) => [k, v.name]) },
    { key: 'x', label: 'First element', min: 0, max: 23, step: 1, format: (v) => G().names[Math.min(v, G().n - 1)] },
    { key: 'y', label: 'Second element', min: 0, max: 23, step: 1, format: (v) => G().names[Math.min(v, G().n - 1)] },
    { readout: [
      ['|G|', () => String(G().n)],
      ['|H|', () => String(sub().length)],
      ['Number of cosets', () => String(G().n / sub().length)],
      ['H divides G?', () => { const ok = G().n % sub().length === 0; return { text: ok ? 'always' : 'never', good: ok }; }],
    ] },
  ],
  tex: () => `|G|=|H|\\cdot[G:H]:\\quad ${G().n}=${sub().length}\\cdot ${G().n / sub().length}`,
});
