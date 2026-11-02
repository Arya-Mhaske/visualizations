import { createStepper } from '../../lib/stepper.js';
import { liveFormula } from '../../lib/formula.js';
import { bmat, eliminate, identity, inverse, mul, texNum } from './_la-math.js';

const PRESETS = {
  two: { name: '2 × 2', A: [[2, 1], [5, 3]] },
  three: { name: '3 × 3', A: [[1, 0, 2], [2, -1, 3], [4, 1, 8]] },
  tri: { name: 'Tridiagonal', A: [[2, 1, 0], [1, 2, 1], [0, 1, 2]] },
};
const state = { which: 'two' };
const aug = (M, n) => `\\left[\\begin{array}{${'c'.repeat(n)}|${'c'.repeat(n)}}${M.map((r) => r.map((x) => texNum(x)).join('&')).join('\\\\')}\\end{array}\\right]`;

// Forward elimination (from eliminate), then scale each pivot row to 1 and clear above it.
function log(A) {
  const n = A.length;
  const M0 = A.map((r, i) => [...r, ...identity(n)[i]]);
  const out = [{ text: 'Write A beside the identity: [ A | I ]. Whatever we do to the left half, we do to the right.', M: M0 }];
  const fwd = eliminate(M0);
  for (const st of fwd.steps) {
    if (st.kind === 'elim') out.push({ text: `Row ${st.row + 1} minus ${texNum(st.l)} × row ${st.col + 1}.`, M: st.M });
    if (st.kind === 'swap') out.push({ text: `Swap rows ${st.a + 1} and ${st.b + 1}.`, M: st.M });
  }
  let M = fwd.U.map((r) => [...r]);
  for (let c = n - 1; c >= 0; c--) {
    const p = M[c][c];
    if (Math.abs(p - 1) > 1e-12) { M[c] = M[c].map((x) => x / p); out.push({ text: `Divide row ${c + 1} by its pivot ${texNum(p)} to make the pivot 1.`, M: M.map((r) => [...r]) }); }
    for (let r = 0; r < c; r++) {
      const f = M[r][c];
      if (Math.abs(f) < 1e-12) continue;
      M[r] = M[r].map((x, k) => x - f * M[c][k]);
      out.push({ text: `Row ${r + 1} minus ${texNum(f)} × row ${c + 1}, to clear above the pivot.`, M: M.map((row) => [...row]) });
    }
  }
  return out;
}

function steps(s) {
  const A = PRESETS[s.which].A;
  const n = A.length;
  const list = log(A).map(({ text, M }) => ({ text, tex: aug(M, n) }));
  const inv = inverse(A);
  list.push({ text: 'The left half is now I, so the right half is A⁻¹. Check: A times it gives I.', tex: `A^{-1}=${bmat(inv, texNum)},\\quad AA^{-1}=${bmat(mul(A, inv).map((r) => r.map((x) => Math.round(x * 1e9) / 1e9)), texNum)}` });
  return list;
}

const formula = liveFormula(document.querySelector('#formula'), () => '\\left[\\,A\\mid I\\,\\right]\\ \\longrightarrow\\ \\left[\\,I\\mid A^{-1}\\,\\right]');
formula.update(state);

createStepper({
  stage: document.querySelector('#stage'),
  panel: document.querySelector('#panel'),
  state,
  steps,
  controls: [
    { title: 'Find the inverse' },
    { key: 'which', label: 'Matrix', options: Object.entries(PRESETS).map(([key, v]) => [key, v.name]) },
    { readout: [['Row operations', (s) => String(log(PRESETS[s.which].A).length - 1)]] },
  ],
  onChange: (s) => formula.update(s),
});
