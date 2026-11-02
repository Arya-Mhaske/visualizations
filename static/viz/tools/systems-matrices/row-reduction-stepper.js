import { createStepper } from '../../lib/stepper.js';
import { liveFormula } from '../../lib/formula.js';
import { eliminate, num, texNum } from './_sm-math.js';
import { SYSTEMS, augTex } from './_rowred-data.js';

const OPTIONS = ['unique', 'swap'];
const state = { which: 'unique' };
const M = (s) => SYSTEMS[s.which].M;
const t = (x) => texNum(x, 3);

function steps(s) {
  const A = M(s);
  const log = eliminate(A);
  const U = log.U;
  const list = [{ text: 'The augmented matrix. We make zeros below each pivot, working left to right.', tex: augTex(A, t) }];
  for (const st of log.steps) {
    if (st.kind === 'swap') list.push({ text: `The pivot position in column ${st.a + 1} holds 0. Swap rows ${st.a + 1} and ${st.b + 1}.`, tex: augTex(st.M, t) });
    if (st.kind === 'elim') list.push({ text: `Row ${st.row + 1} minus ${t(st.l)} × row ${st.col + 1}.`, tex: augTex(st.M, t) });
  }
  list.push({ text: 'Echelon form: a staircase of pivots with zeros below. The last row now has only z in it.', tex: augTex(U, t) });
  const z = U[2][3] / U[2][2];
  const y = (U[1][3] - U[1][2] * z) / U[1][1];
  const x = (U[0][3] - U[0][1] * y - U[0][2] * z) / U[0][0];
  list.push({ text: 'Back-substitute from the bottom row up.', tex: `z=${t(z)},\\quad y=${t(y)},\\quad x=${t(x)}` });
  list.push({ text: 'Check the solution in the original rows.', tex: A.map((r) => `${t(r[0] * x + r[1] * y + r[2] * z)}=${t(r[3])}`).join(',\\ \\ ') });
  return list;
}

const formula = liveFormula(document.querySelector('#formula'), (s) => augTex(M(s), t));
formula.update(state);

createStepper({
  stage: document.querySelector('#stage'),
  panel: document.querySelector('#panel'),
  state,
  steps,
  controls: [
    { title: 'Reduce to echelon form' },
    { key: 'which', label: 'System', options: OPTIONS.map((k) => [k, SYSTEMS[k].name]) },
    { readout: [
      ['Row operations', (s) => String(eliminate(M(s)).steps.length)],
      ['Solution (x, y, z)', (s) => { const U = eliminate(M(s)).U; const z = U[2][3] / U[2][2]; const y = (U[1][3] - U[1][2] * z) / U[1][1]; const x = (U[0][3] - U[0][1] * y - U[0][2] * z) / U[0][0]; return `${num(x)}, ${num(y)}, ${num(z)}`; }],
    ] },
  ],
  onChange: (s) => formula.update(s),
});
