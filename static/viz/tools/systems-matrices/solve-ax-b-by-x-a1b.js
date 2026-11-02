import { createStepper } from '../../lib/stepper.js';
import { liveFormula } from '../../lib/formula.js';
import { bmat, det, inverse, matVec, rank, texNum, vecTex } from './_sm-math.js';
import { adjugate } from '../linear-algebra/_determinants-math.js';

const SYSTEMS = {
  unique: { name: '|A| ≠ 0', A: [[2, 1, 0], [1, 3, 1], [0, 1, 2]], B: [3, 5, 3] },
  none: { name: '|A| = 0, no solution', A: [[1, 2, 3], [2, 4, 6], [1, 0, 1]], B: [1, 3, 2] },
  many: { name: '|A| = 0, many solutions', A: [[1, 2, 3], [2, 4, 6], [1, 0, 1]], B: [1, 2, 2] },
};
const state = { which: 'unique' };
const n = (v) => texNum(Math.round(v * 1e9) / 1e9, 3);
const aug = (A, B) => A.map((r, i) => [...r, B[i]]);

function steps(s) {
  const { A, B } = SYSTEMS[s.which];
  const D = det(A);
  const list = [
    { text: 'Write the system as A X = B and compute |A|.', tex: `A=${bmat(A, n)},\\ B=${vecTex(B, n)},\\quad |A|=${n(D)}` },
  ];
  if (Math.abs(D) > 1e-9) {
    const X = matVec(inverse(A), B);
    list.push({ text: '|A| ≠ 0, so A⁻¹ exists and the system is consistent with exactly one solution: X = A⁻¹B.', tex: `A^{-1}=${bmat(inverse(A), n)},\\quad X=A^{-1}B=${vecTex(X, n)}` });
    return list;
  }
  const adjB = matVec(adjugate(A), B).map((v) => Math.round(v * 1e9) / 1e9);
  list.push({ text: '|A| = 0, so there is no inverse. Compute (adj A) B instead.', tex: `(\\operatorname{adj}A)B=${vecTex(adjB, n)}` });
  if (adjB.some((v) => v !== 0)) {
    list.push({ text: '(adj A) B is not the zero vector, so the system is inconsistent: it has no solution.', tex: `\\text{no solution}` });
  } else {
    list.push({ text: '(adj A) B is the zero vector. The test alone cannot tell, so check by comparing ranks.', tex: `\\operatorname{rank}A=${rank(A)},\\ \\operatorname{rank}[A\\,|\\,B]=${rank(aug(A, B))}` });
    list.push({ text: rank(A) === rank(aug(A, B)) ? 'The ranks are equal and less than 3, so the system is consistent with infinitely many solutions.' : 'The ranks differ, so there is no solution.', tex: rank(A) === rank(aug(A, B)) ? '\\text{infinitely many solutions}' : '\\text{no solution}' });
  }
  return list;
}

const formula = liveFormula(document.querySelector('#formula'), () => 'AX=B:\\quad |A|\\ne0\\Rightarrow X=A^{-1}B');
formula.update(state);

createStepper({
  stage: document.querySelector('#stage'),
  panel: document.querySelector('#panel'),
  state,
  steps,
  controls: [
    { title: 'Decide, then solve' },
    { key: 'which', label: 'System', options: Object.entries(SYSTEMS).map(([key, v]) => [key, v.name]) },
    { readout: [
      ['|A|', (s) => n(det(SYSTEMS[s.which].A))],
      ['Outcome', (s) => { const { A, B } = SYSTEMS[s.which]; if (Math.abs(det(A)) > 1e-9) return { text: 'one solution', good: true }; return rank(A) === rank(aug(A, B)) ? 'infinitely many' : { text: 'none', good: false }; }],
    ] },
  ],
  onChange: (s) => formula.update(s),
});
