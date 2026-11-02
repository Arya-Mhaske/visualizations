import { createStepper } from '../../lib/stepper.js';
import { liveFormula } from '../../lib/formula.js';
import { bmat, mul, texNum } from './_la-math.js';
import { PRESETS, elementary, lu } from './_elimination-lu-math.js';

const state = { which: 'classic' };
const tex = (M) => bmat(M, texNum);
const NAMES = (row, col) => `E_{${row + 1}${col + 1}}`;

function steps(s) {
  const A = PRESETS[s.which].A;
  const { mults, U } = lu(A);
  let M = A;
  const list = [{ text: 'Each elimination step is one multiplication by an elementary matrix: the identity with −ℓ in one spot.', tex: `A=${tex(A)}` }];
  const Es = [];
  mults.forEach((m) => {
    const E = elementary(3, m.row, m.col, m.l);
    Es.push(E);
    M = mul(E, M);
    list.push({ text: `Row ${m.row + 1} minus ${texNum(m.l)} × row ${m.col + 1} is the matrix ${NAMES(m.row, m.col)}. Multiply it on the left.`, tex: `${NAMES(m.row, m.col)}=${tex(E)},\\quad ${NAMES(m.row, m.col)}\\,(\\text{matrix so far})=${tex(M)}` });
  });
  let all = Es[0];
  for (let i = 1; i < Es.length; i += 1) all = mul(Es[i], all);
  list.push({ text: 'The elementary matrices multiplied together, last on the left, do the whole elimination in one go.', tex: `E=${Es.map((_, i) => NAMES(mults[Es.length - 1 - i].row, mults[Es.length - 1 - i].col)).join('')}=${tex(all)}` });
  list.push({ text: 'So E A = U.', tex: `EA=${tex(mul(all, A))}=${tex(U)}=U` });
  return list;
}

const formula = liveFormula(document.querySelector('#formula'), () => 'E_{32}E_{31}E_{21}A=U');
formula.update(state);

createStepper({
  stage: document.querySelector('#stage'),
  panel: document.querySelector('#panel'),
  state,
  steps,
  controls: [
    { title: 'Elimination as multiplication' },
    { key: 'which', label: 'Matrix', options: Object.entries(PRESETS).map(([key, v]) => [key, v.name]) },
    { readout: [['Elimination steps', (s) => String(lu(PRESETS[s.which].A).mults.length)]] },
  ],
  onChange: (s) => formula.update(s),
});
