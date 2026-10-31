import { createTool } from '../../lib/tool.js';
import { venn } from '../../lib/discrete.js';
import { label } from '../../lib/draw.js';

const state = { law: 'union', build: 'result' };
const LAWS = {
  union: { left: '(A ∪ B)′', right: 'A′ ∩ B′', shaded: ['none'], tex: "(A \\cup B)' = A' \\cap B'", join: 'both' },
  meet: { left: '(A ∩ B)′', right: 'A′ ∪ B′', shaded: ['a', 'b', 'none'], tex: "(A \\cap B)' = A' \\cup B'", join: 'either' },
};
const REGIONS = ['a', 'b', 'both', 'none'];
const paint = (list, fill) => Object.fromEntries(REGIONS.map((r) => [r, list.includes(r) ? fill : null]));
const NOT_A = ['b', 'none'];
const NOT_B = ['a', 'none'];

function rightFills(s, c) {
  if (s.build === 'notA') return { list: paint(NOT_A, c.fillB), word: 'A′ shaded' };
  if (s.build === 'notB') return { list: paint(NOT_B, c.fillY), word: 'B′ shaded' };
  return { list: paint(LAWS[s.law].shaded, c.fillC), word: LAWS[s.law].right };
}

createTool({
  state,
  label: 'Two Venn diagrams side by side. The left shades the complement of the whole, the right builds the same region from the two complements.',
  draw(ctx, stage, c) {
    const wide = stage.w > stage.h;
    const gap = 8;
    const size = wide ? (stage.w - gap * 3) / 2 : stage.w - gap * 2;
    const h = wide ? stage.h - 42 : (stage.h - 56) / 2;
    const left = { x: gap, y: 24, w: size, h };
    const right = wide ? { x: gap * 2 + size, y: 24, w: size, h } : { x: gap, y: h + 50, w: size, h };
    const law = LAWS[state.law];
    venn(ctx, left, c, paint(law.shaded, c.fillA));
    const { list, word } = rightFills(state, c);
    venn(ctx, right, c, list);
    label(ctx, law.left, left.x + left.w / 2, left.y - 12, c, { size: 13 });
    label(ctx, word, right.x + right.w / 2, right.y - 12, c, { size: 13 });
  },
  controls: [
    { title: 'Shade both sides' },
    { key: 'law', label: 'Law', options: [['union', "(A ∪ B)′"], ['meet', "(A ∩ B)′"]] },
    { key: 'build', label: 'Right side', options: [['notA', 'A′'], ['notB', 'B′'], ['result', 'Combine']] },
    { readout: [
      ['Left side', (s) => LAWS[s.law].left],
      ['Right side', (s) => LAWS[s.law].right],
      ['Regions shaded (of 4)', (s) => String(LAWS[s.law].shaded.length)],
      ['Combine means', (s) => (s.law === 'union' ? 'in A′ and in B′' : 'in A′ or in B′')],
      ['Same region?', (s) => (s.build === 'result' ? { text: 'yes', good: true } : 'combine to see')],
    ] },
  ],
  tex: (s) => LAWS[s.law].tex,
});
