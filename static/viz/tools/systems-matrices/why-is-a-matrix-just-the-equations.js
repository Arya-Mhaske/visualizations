import { createStepper } from '../../lib/stepper.js';
import { liveFormula } from '../../lib/formula.js';
import { SYSTEMS, augTex, equationsTex } from './_rowred-data.js';

const state = { which: 'unique' };
const M = (s) => SYSTEMS[s.which].M;

function steps(s) {
  return [
    { text: 'A system of three equations in x, y and z.', tex: equationsTex(M(s)) },
    { text: 'The letters x, y, z and the plus signs only mark which column a number belongs to. If every number stays in its own place, we can leave them out.', tex: `\\text{coefficients of }x,\\ y,\\ z\\ \\text{and the right side, in their columns}` },
    { text: 'Keep just the numbers, with a bar where the equals signs were. This is the augmented matrix.', tex: augTex(M(s)) },
    { text: 'Each row is one equation. Each column on the left belongs to one unknown. The column after the bar is the right-hand side.', tex: `\\text{row }i=\\text{equation }i,\\quad \\text{column }j=\\text{unknown }${['x', 'y', 'z'].join(',\\ ')}` },
    { text: 'A row operation on the matrix is the same move on the equations, so nothing is lost by dropping the letters.' },
  ];
}

const formula = liveFormula(document.querySelector('#formula'), (s) => augTex(M(s)));
formula.update(state);

createStepper({
  stage: document.querySelector('#stage'),
  panel: document.querySelector('#panel'),
  state,
  steps,
  controls: [
    { title: 'Choose a system' },
    { key: 'which', label: 'System', options: Object.entries(SYSTEMS).map(([key, v]) => [key, v.name]) },
    { readout: [['Matrix size', () => '3 rows, 4 columns']] },
  ],
  onChange: (s) => formula.update(s),
});
