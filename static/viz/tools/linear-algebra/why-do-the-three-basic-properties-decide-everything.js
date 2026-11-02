import { createStepper } from '../../lib/stepper.js';
import { liveFormula } from '../../lib/formula.js';
import { fixed } from '../../lib/format.js';
import { det2 } from './_la-math.js';

const state = { a: 2, b: 3, c: 1, d: 4 };
const n = (v) => fixed(v, 0);
const d2 = (r1, r2) => `\\begin{vmatrix}${r1[0]}&${r1[1]}\\\\${r2[0]}&${r2[1]}\\end{vmatrix}`;

function steps(s) {
  const [a, b, c, d] = [n(s.a), n(s.b), n(s.c), n(s.d)];
  return [
    { text: 'Three rules decide det: (1) det I = 1. (2) Swapping two rows flips the sign. (3) det is linear in each row on its own.', tex: `\\det I=1,\\quad \\text{swap rows}\\Rightarrow-\\det,\\quad \\text{linear in each row}` },
    { text: 'Rule 3 on row 1: split (a, b) into (a, 0) + (0, b).', tex: `${d2([a, b], [c, d])}=${d2([a, 0], [c, d])}+${d2([0, b], [c, d])}` },
    { text: 'Rule 3 on row 2 for each piece: split (c, d) into (c, 0) + (0, d). That gives four determinants.', tex: `=${d2([a, 0], [c, 0])}+${d2([a, 0], [0, d])}+${d2([0, b], [c, 0])}+${d2([0, b], [0, d])}` },
    { text: 'Two of the four have both rows pointing along the same axis, so one row is a multiple of the other. Subtracting that multiple gives a zero row and det 0.', tex: `${d2([a, 0], [c, 0])}=0,\\qquad ${d2([0, b], [0, d])}=0` },
    { text: 'Pull the numbers out of the rows (rule 3). The first survivor becomes ad times det I = ad.', tex: `${d2([a, 0], [0, d])}=${a}\\cdot${d}\\cdot\\det I=${n(s.a * s.d)}` },
    { text: 'The other survivor is bc times the identity with its rows swapped (rule 2): one swap, one minus sign.', tex: `${d2([0, b], [c, 0])}=${b}\\cdot${c}\\cdot\\begin{vmatrix}0&1\\\\1&0\\end{vmatrix}=-${n(s.b * s.c)}` },
    { text: 'Add them up. That is the formula for a 2 × 2 determinant, built from nothing but the three rules.', tex: `\\det=ad-bc=${n(s.a * s.d)}-${n(s.b * s.c)}=${n(det2([[s.a, s.b], [s.c, s.d]]))}` },
  ];
}

const formula = liveFormula(document.querySelector('#formula'), (s) => `\\det\\begin{bmatrix}${n(s.a)}&${n(s.b)}\\\\${n(s.c)}&${n(s.d)}\\end{bmatrix}=ad-bc`);
formula.update(state);

createStepper({
  stage: document.querySelector('#stage'),
  panel: document.querySelector('#panel'),
  state,
  steps,
  controls: [
    { title: 'Choose a 2 × 2 matrix' },
    { key: 'a', label: 'a', min: -4, max: 4, step: 1, format: n },
    { key: 'b', label: 'b', min: -4, max: 4, step: 1, format: n },
    { key: 'c', label: 'c', min: -4, max: 4, step: 1, format: n },
    { key: 'd', label: 'd', min: -4, max: 4, step: 1, format: n },
    { readout: [['det', (s) => ({ text: n(det2([[s.a, s.b], [s.c, s.d]])), good: true })]] },
  ],
  onChange: (s) => formula.update(s),
});
