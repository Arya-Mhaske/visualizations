import { createTool } from '../../lib/tool.js';
import { bars } from '../../lib/quick.js';
import { nPr, nCr, multichoose } from './_counting.js';

const state = { n: 10, r: 3, order: true, rep: false };
const vals = (s) => ({ pr: nPr(s.n, Math.min(s.r, s.n)), pow: s.n ** s.r, cr: nCr(s.n, Math.min(s.r, s.n)), mc: multichoose(s.n, s.r) });
const pick = (s) => (s.order ? (s.rep ? 'pow' : 'pr') : s.rep ? 'mc' : 'cr');

createTool({
  state,
  label: 'Bars for the four counting formulas. The one selected by the answers to the two questions is highlighted.',
  draw(ctx, stage, c) {
    const v = vals(state);
    const rows = [['P(n, r)', v.pr, 'pr'], ['n^r', v.pow, 'pow'], ['C(n, r)', v.cr, 'cr'], ['C(n+r−1, r)', v.mc, 'mc']];
    bars(ctx, stage, c, rows.map(([n, x, k]) => [n, x, k === pick(state) ? c.a : c.fillB, String(x)]), { max: Math.max(...rows.map((r) => r[1])), left: 0.3 });
  },
  controls: [
    { title: 'Two questions' },
    { key: 'order', label: 'Does the order matter?', toggle: true },
    { key: 'rep', label: 'Can things repeat?', toggle: true },
    { key: 'n', label: 'Things to choose from n', min: 2, max: 12, step: 1 },
    { key: 'r', label: 'Number chosen r', min: 1, max: 6, step: 1 },
    { readout: [
      ['Use', (s) => ({ pr: 'P(n, r) = n!/(n − r)!', pow: 'nʳ', cr: 'C(n, r)', mc: 'C(n + r − 1, r)' }[pick(s)])],
      ['Answer', (s) => String(vals(s)[pick(s)])],
    ] },
  ],
  tex: (s) => `${{ pr: `P(${s.n},${s.r})`, pow: `${s.n}^{${s.r}}`, cr: `C(${s.n},${s.r})`, mc: `C(${s.n + s.r - 1},${s.r})` }[pick(s)]}=${vals(s)[pick(s)]}`,
});
