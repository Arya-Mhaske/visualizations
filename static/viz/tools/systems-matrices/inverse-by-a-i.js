import { createStepper } from '../../lib/stepper.js';
import { liveFormula } from '../../lib/formula.js';
import { bmat, eliminate, identity, inverse, matVec, mul, num, texNum } from './_sm-math.js';

const PRESETS = {
  two: { name: '2 × 2', A: [[2, 1], [5, 3]], B: [[3], [8]] },
  three: { name: '3 × 3', A: [[1, 0, 2], [2, -1, 3], [4, 1, 8]], B: [[1], [2], [3]] },
};
const state = { which: 'two' };
const t = (v) => texNum(v, 3);
const aug = (M, n) => `\\left[\\begin{array}{${'c'.repeat(n)}|${'c'.repeat(n)}}${M.map((r) => r.map(t).join('&')).join('\\\\')}\\end{array}\\right]`;

function log(A) {
  const n = A.length;
  const M0 = A.map((r, i) => [...r, ...identity(n)[i]]);
  const out = [{ text: 'Write A beside the identity. Every row operation is done to both halves.', M: M0 }];
  const fwd = eliminate(M0);
  for (const st of fwd.steps) {
    if (st.kind === 'elim') out.push({ text: `Row ${st.row + 1} minus ${t(st.l)} × row ${st.col + 1}.`, M: st.M });
    if (st.kind === 'swap') out.push({ text: `Swap rows ${st.a + 1} and ${st.b + 1}.`, M: st.M });
  }
  const M = fwd.U.map((r) => [...r]);
  for (let c = n - 1; c >= 0; c--) {
    const p = M[c][c];
    if (Math.abs(p - 1) > 1e-12) { M[c] = M[c].map((x) => x / p); out.push({ text: `Divide row ${c + 1} by ${t(p)} so the pivot is 1.`, M: M.map((r) => [...r]) }); }
    for (let r = 0; r < c; r++) {
      const f = M[r][c];
      if (Math.abs(f) < 1e-12) continue;
      M[r] = M[r].map((x, k) => x - f * M[c][k]);
      out.push({ text: `Row ${r + 1} minus ${t(f)} × row ${c + 1}, to clear above the pivot.`, M: M.map((row) => [...row]) });
    }
  }
  return out;
}

function steps(s) {
  const { A, B } = PRESETS[s.which];
  const n = A.length;
  const list = log(A).map(({ text, M }) => ({ text, tex: aug(M, n) }));
  const inv = inverse(A);
  list.push({ text: 'The left half is I. The right half is A⁻¹.', tex: `A^{-1}=${bmat(inv, t)}` });
  const X = mul(inv, B);
  list.push({ text: 'To solve A X = B, multiply both sides by A⁻¹ on the left: X = A⁻¹ B.', tex: `X=A^{-1}B=${bmat(inv, t)}${bmat(B, t)}=${bmat(X, t)}` });
  list.push({ text: 'Check: A X gives B back.', tex: `AX=${bmat(mul(A, X).map((r) => r.map((v) => Math.round(v * 1e9) / 1e9)), t)}=B` });
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
    { readout: [
      ['Solution X of AX = B', (s) => matVec(inverse(PRESETS[s.which].A), PRESETS[s.which].B.map((r) => r[0])).map((v) => num(v)).join(', ')],
    ] },
  ],
  onChange: (s) => formula.update(s),
});
