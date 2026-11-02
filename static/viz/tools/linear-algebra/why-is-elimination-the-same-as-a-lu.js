import { createStepper } from '../../lib/stepper.js';
import { liveFormula } from '../../lib/formula.js';
import { bmat, mul, num, texNum } from './_la-math.js';
import { PRESETS, lowerFrom, lu } from './_elimination-lu-math.js';

const state = { which: 'classic' };
const tex = (M) => bmat(M, texNum);

function steps(s) {
  const A = PRESETS[s.which].A;
  const { U, mults } = lu(A);
  const list = [{ text: 'Start with A. As we eliminate, write each multiplier down.', tex: tex(A) }];
  mults.forEach((m, i) => {
    list.push({
      text: `Subtract ${texNum(m.l)} × row ${m.col + 1} from row ${m.row + 1}. Put ${texNum(m.l)} into row ${m.row + 1}, column ${m.col + 1} of L.`,
      tex: `L=${tex(lowerFrom(mults.slice(0, i + 1), 3))}`,
    });
  });
  list.push({ text: 'Elimination has finished. The matrix left behind is U, and every multiplier now sits in L.', tex: `U=${tex(U)},\\quad L=${tex(lowerFrom(mults, 3))}` });
  const L = lowerFrom(mults, 3);
  list.push({ text: 'Multiply L by U: the multipliers undo the elimination and give back A.', tex: `LU=${tex(mul(L, U))}=A` });
  return list;
}

const formula = liveFormula(document.querySelector('#formula'), (s) => `A=LU,\\quad A=${tex(PRESETS[s.which].A)}`);
formula.update(state);

createStepper({
  stage: document.querySelector('#stage'),
  panel: document.querySelector('#panel'),
  state,
  steps,
  controls: [
    { title: 'Record the multipliers' },
    { key: 'which', label: 'Matrix', options: Object.entries(PRESETS).map(([key, v]) => [key, v.name]) },
    { readout: [
      ['Multipliers used', (s) => String(lu(PRESETS[s.which].A).mults.length)],
      ['Pivots', (s) => [0, 1, 2].map((k) => num(lu(PRESETS[s.which].A).U[k][k])).join(', ')],
    ] },
  ],
  onChange: (s) => formula.update(s),
});
