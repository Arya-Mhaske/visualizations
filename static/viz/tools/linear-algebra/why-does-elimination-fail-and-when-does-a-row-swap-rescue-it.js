import { createStepper } from '../../lib/stepper.js';
import { liveFormula } from '../../lib/formula.js';
import { bmat, eliminate, texNum } from './_la-math.js';
import { TROUBLE } from './_elimination-lu-math.js';

const state = { which: 'swap', swaps: true };
const tex = (M) => bmat(M, texNum);

function steps(s) {
  const A = TROUBLE[s.which].A;
  const { steps: log, failed } = eliminate(A, { allowSwap: s.swaps });
  const list = [{ text: 'Eliminate below each pivot, working left to right.', tex: tex(A) }];
  for (const st of log) {
    if (st.kind === 'elim') list.push({ text: `Subtract ${texNum(st.l)} × row ${st.col + 1} from row ${st.row + 1}. The multiplier is ${texNum(st.l)}.`, tex: tex(st.M) });
    if (st.kind === 'swap') list.push({ text: `The pivot in column ${st.col === undefined ? st.a + 1 : st.col + 1} is 0, but row ${st.b + 1} has a non-zero entry below it. Swap rows ${st.a + 1} and ${st.b + 1}.`, tex: tex(st.M) });
    if (st.kind === 'stuck') list.push({ text: `The pivot in column ${st.col + 1} is 0 and swaps are off. Elimination is stuck, though a swap with row ${st.row + 1} would rescue it.`, tex: tex(st.M) });
    if (st.kind === 'fail') list.push({ text: `Column ${st.col + 1} has no non-zero pivot at or below the diagonal, and no row swap can make one. The matrix is singular: stop.`, tex: tex(st.M) });
  }
  if (!failed) {
    const { U } = eliminate(A, { allowSwap: s.swaps });
    list.push({ text: 'Three pivots, all non-zero: back-substitution can finish the job.', tex: `\\text{pivots: }${[0, 1, 2].map((i) => texNum(U[i][i])).join(',\\ ')}` });
  }
  return list;
}

const formula = liveFormula(document.querySelector('#formula'), (s) => `A=${tex(TROUBLE[s.which].A)}`);
formula.update(state);

createStepper({
  stage: document.querySelector('#stage'),
  panel: document.querySelector('#panel'),
  state,
  steps,
  controls: [
    { title: 'Try elimination' },
    { key: 'which', label: 'Matrix', options: Object.entries(TROUBLE).map(([key, v]) => [key, v.name]) },
    { key: 'swaps', label: 'Allow row swaps', toggle: true },
    { readout: [
      ['Outcome', (s) => {
        const r = eliminate(TROUBLE[s.which].A, { allowSwap: s.swaps });
        const kinds = r.steps.map((st) => st.kind);
        if (kinds.includes('fail')) return { text: 'singular: no 3rd pivot', good: false };
        if (kinds.includes('stuck')) return { text: 'stuck at a zero pivot', good: false };
        return { text: kinds.includes('swap') ? 'works, thanks to a swap' : 'works, no swap needed', good: true };
      }],
    ] },
  ],
  onChange: (s) => formula.update(s),
});
