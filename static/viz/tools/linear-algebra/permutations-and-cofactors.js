import { createStepper } from '../../lib/stepper.js';
import { liveFormula } from '../../lib/formula.js';
import { bmat, det, texNum } from './_la-math.js';
import { PERMS, PRESETS, bigFormula, cofactor, expandRow1, sign, term } from './_determinants-math.js';

const state = { which: 'a' };
const A = (s) => PRESETS[s.which].A;
const sgn = (v) => (v < 0 ? '-' : '+');
const n = (v) => texNum(v, 0);

function steps(s) {
  const M = A(s);
  const list = [{ text: 'The big formula: add up one term for every way to pick one entry from each row and each column, with a sign for the permutation.', tex: `A=${bmat(M, n)}` }];
  PERMS.forEach((p) => {
    const picked = p.map((col, row) => `a_{${row + 1}${col + 1}}`).join('');
    const nums = p.map((col, row) => n(M[row][col])).join('\\cdot');
    list.push({ text: `Columns ${p.map((c) => c + 1).join(', ')}: sign ${sign(p) > 0 ? '+' : '−'} (${sign(p) > 0 ? 'an even' : 'an odd'} number of swaps).`, tex: `${sgn(sign(p))}\\,${picked}=${sgn(sign(p))}${nums}=${n(term(M, p))}` });
  });
  list.push({ text: 'Add the six terms.', tex: `\\det A=${PERMS.map((p) => n(term(M, p))).join('+')}=${n(bigFormula(M))}` });
  list.push({ text: 'Cofactor expansion along row 1 groups the six terms into three: each entry times its cofactor (a smaller determinant with a sign).', tex: `\\det A=${[0, 1, 2].map((j) => `${n(M[0][j])}\\cdot(${n(cofactor(M, 0, j))})`).join('+')}=${n(expandRow1(M))}` });
  list.push({ text: 'Both agree with elimination.', tex: `\\det A=${n(Math.round(det(M) * 1e9) / 1e9)}` });
  return list;
}

const formula = liveFormula(document.querySelector('#formula'), (s) => `\\det A=\\sum_{\\text{permutations}}\\pm\\,a_{1\\alpha}a_{2\\beta}a_{3\\gamma}`);
formula.update(state);

createStepper({
  stage: document.querySelector('#stage'),
  panel: document.querySelector('#panel'),
  state,
  steps,
  controls: [
    { title: 'Expand a determinant' },
    { key: 'which', label: 'Matrix', options: Object.entries(PRESETS).map(([key, v]) => [key, v.name]) },
    { readout: [
      ['Terms in the big formula', () => '6 (that is 3!)'],
      ['det A', (s) => ({ text: n(bigFormula(A(s))), good: true })],
    ] },
  ],
  onChange: (s) => formula.update(s),
});
