import { createStepper } from '../../lib/stepper.js';
import { liveFormula } from '../../lib/formula.js';
import { bmat, texNum } from './_la-math.js';
import { MATRICES, subspaces } from './_four-subspaces-math.js';

const state = { which: 'rank2' };
const tex = (M) => bmat(M, texNum);
const cols = (js) => js.map((j) => `\\text{col }${j + 1}`).join(',\\ ') || '\\text{none}';

function steps(s) {
  const A = MATRICES[s.which].A;
  const q = subspaces(A);
  return [
    { text: 'Reduce A all the way to R, the reduced row echelon form.', tex: `A=${tex(A)}\\ \\longrightarrow\\ R=${tex(q.R)}` },
    { text: `The pivot columns hold the leading 1s. Here there are r = ${q.r}.`, tex: `\\text{pivot columns: }${cols(q.pivots)}` },
    { text: `The other ${q.n - q.r} column${q.n - q.r === 1 ? ' is' : 's are'} free. A free column is a combination of the pivot columns before it.`, tex: `\\text{free columns: }${cols(q.free)}` },
    { text: 'The pivot columns of A are independent and give every other column, so they are a basis for the column space. Its dimension is r.', tex: `\\dim C(A)=r=${q.r}` },
    { text: 'Each free column gives one special solution of Ax = 0, so the nullspace has one basis vector per free column.', tex: `\\dim N(A)=n-r=${q.n}-${q.r}=${q.n - q.r}` },
    { text: 'The dimensions always add up to the number of columns.', tex: `r+(n-r)=${q.r}+${q.n - q.r}=${q.n}=n` },
  ];
}

const formula = liveFormula(document.querySelector('#formula'), (s) => `A=${tex(MATRICES[s.which].A)}`);
formula.update(state);

createStepper({
  stage: document.querySelector('#stage'),
  panel: document.querySelector('#panel'),
  state,
  steps,
  controls: [
    { title: 'Count the pivots' },
    { key: 'which', label: 'Matrix', options: Object.entries(MATRICES).map(([key, v]) => [key, v.name]) },
    { readout: [
      ['Pivots r', (s) => String(subspaces(MATRICES[s.which].A).r)],
      ['Free columns n − r', (s) => String(subspaces(MATRICES[s.which].A).free.length)],
    ] },
  ],
  onChange: (s) => formula.update(s),
});
