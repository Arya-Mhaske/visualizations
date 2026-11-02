import { createTool } from '../../lib/tool.js';
import { venn } from '../../lib/discrete.js';
import { label, line } from '../../lib/draw.js';

// Logic (AND, OR, NOT with true/false) and sets (∩, ∪, complement with in/out) obey the same laws. A Venn region is "in" an
// expression exactly when the truth table row for that region makes the expression true.
const LAWS = {
  dm1: { name: 'De Morgan 1', left: (a, b) => !(a || b), right: (a, b) => !a && !b, ltex: '\\lnot(A\\lor B)', rtex: '\\lnot A\\land\\lnot B', sl: '(A ∪ B)ᶜ', sr: 'Aᶜ ∩ Bᶜ' },
  dm2: { name: 'De Morgan 2', left: (a, b) => !(a && b), right: (a, b) => !a || !b, ltex: '\\lnot(A\\land B)', rtex: '\\lnot A\\lor\\lnot B', sl: '(A ∩ B)ᶜ', sr: 'Aᶜ ∪ Bᶜ' },
  abs1: { name: 'Absorption 1', left: (a, b) => a || (a && b), right: (a) => a, ltex: 'A\\lor(A\\land B)', rtex: 'A', sl: 'A ∪ (A ∩ B)', sr: 'A' },
  abs2: { name: 'Absorption 2', left: (a, b) => a && (a || b), right: (a) => a, ltex: 'A\\land(A\\lor B)', rtex: 'A', sl: 'A ∩ (A ∪ B)', sr: 'A' },
  imp: { name: 'Implication', left: (a, b) => !a || b, right: (a, b) => !(a && !b), ltex: '\\lnot A\\lor B', rtex: '\\lnot(A\\land\\lnot B)', sl: 'Aᶜ ∪ B', sr: '(A ∖ B)ᶜ' },
  wrong: { name: 'A tempting mistake', left: (a, b) => !(a || b), right: (a, b) => !a || !b, ltex: '\\lnot(A\\lor B)', rtex: '\\lnot A\\lor\\lnot B', sl: '(A ∪ B)ᶜ', sr: 'Aᶜ ∪ Bᶜ' },
};
const state = { law: 'dm1' };
const REGIONS = [['none', false, false], ['a', true, false], ['b', false, true], ['both', true, true]];
const rowsOf = (law) => REGIONS.map(([key, a, b]) => ({ key, a, b, l: LAWS[law].left(a, b), r: LAWS[law].right(a, b) }));
const same = (law) => rowsOf(law).every((r) => r.l === r.r);
const bit = (x) => (x ? 1 : 0);

createTool({
  state,
  label: 'Two Venn diagrams side by side, one shaded for each side of a law, and the four rows of the truth table below. If the shaded regions match the rows match, and the law holds for sets and for logic alike.',
  draw(ctx, stage, c) {
    const law = LAWS[state.law];
    const rows = rowsOf(state.law);
    const boxW = (stage.w - 24) / 2;
    const boxH = Math.min(stage.h * 0.42, boxW * 0.8);
    ['l', 'r'].forEach((side, i) => {
      const fills = {};
      rows.forEach((r) => { fills[r.key] = r[side] ? c.fillC : null; });
      venn(ctx, { x: 8 + i * (boxW + 8), y: 28, w: boxW, h: boxH }, c, fills);
      label(ctx, i ? law.sr : law.sl, 8 + i * (boxW + 8) + boxW / 2, 14, c, { size: 12, bounds: stage });
    });
    const y0 = 28 + boxH + 26;
    const rowH = Math.min(26, (stage.h - y0 - 10) / 5);
    const xs = [0.12, 0.28, 0.48, 0.68, 0.88].map((f) => f * stage.w);
    ['A', 'B', 'left', 'right', 'equal?'].forEach((t, i) => label(ctx, t, xs[i], y0, c, { size: 11, patch: false }));
    line(ctx, 10, y0 + 10, stage.w - 10, y0 + 10, { color: c.ink, width: 2 });
    rows.forEach((r, k) => {
      const y = y0 + 10 + rowH * (k + 0.8);
      [bit(r.a), bit(r.b), bit(r.l), bit(r.r)].forEach((v, i) => label(ctx, String(v), xs[i], y, c, { size: 13, patch: false }));
      label(ctx, r.l === r.r ? '✓' : '✗', xs[4], y, c, { size: 14, color: r.l === r.r ? c.ink : c.a, patch: false });
    });
  },
  controls: [
    { title: 'Pick a law' },
    { key: 'law', label: 'Law', options: Object.entries(LAWS).map(([k, v]) => [k, v.name]) },
    { readout: [
      ['As logic', (s) => `${LAWS[s.law].ltex.replaceAll('\\lnot', '¬').replaceAll('\\land', '∧').replaceAll('\\lor', '∨')} = ${LAWS[s.law].rtex.replaceAll('\\lnot', '¬').replaceAll('\\land', '∧').replaceAll('\\lor', '∨')}`],
      ['As sets', (s) => `${LAWS[s.law].sl} = ${LAWS[s.law].sr}`],
      ['Holds?', (s) => ({ text: same(s.law) ? 'yes: all four rows agree' : 'no: some row differs', good: same(s.law) })],
    ] },
  ],
  tex: (s) => `${LAWS[s.law].ltex}${same(s.law) ? '=' : '\\ne'}${LAWS[s.law].rtex}`,
});
