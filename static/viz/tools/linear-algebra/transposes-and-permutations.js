import { createStepper } from '../../lib/stepper.js';
import { liveFormula } from '../../lib/formula.js';
import { bmat, mul, transpose } from './_la-math.js';

const A = [[1, 2, 3], [0, 4, 5], [6, 0, 7]];
// Row order of each permutation matrix: P sends row k of A to position ORDERS[k]... P A has these rows of A, top to bottom.
const ORDERS = { 123: [0, 1, 2], 132: [0, 2, 1], 213: [1, 0, 2], 231: [1, 2, 0], 312: [2, 0, 1], 321: [2, 1, 0] };
const state = { order: '231' };
const tex = (M) => bmat(M, (x) => String(x));
const permutation = (order) => order.map((r) => [0, 1, 2].map((c) => (c === r ? 1 : 0)));

function steps(s) {
  const order = ORDERS[s.order];
  const P = permutation(order);
  return [
    { text: 'Start with A.', tex: `A=${tex(A)}` },
    { text: 'The transpose flips A across its diagonal: row i becomes column i.', tex: `A^{\\mathsf T}=${tex(transpose(A))}` },
    { text: `A permutation matrix is the identity with its rows reordered. This one puts the rows in the order ${order.map((r) => r + 1).join(', ')}.`, tex: `P=${tex(P)}` },
    { text: 'Multiplying by P on the left reorders the rows of A in that same way.', tex: `PA=${tex(mul(P, A))}` },
    { text: 'Undoing a permutation is just transposing it: P times its transpose is the identity.', tex: `P^{\\mathsf T}P=${tex(mul(transpose(P), P))}` },
    { text: 'There are 3! = 6 permutation matrices of this size, and the rows of every one of them are the rows of I in some order.' },
  ];
}

const formula = liveFormula(document.querySelector('#formula'), () => '(AB)^{\\mathsf T}=B^{\\mathsf T}A^{\\mathsf T},\\qquad P^{\\mathsf T}=P^{-1}');
formula.update(state);

createStepper({
  stage: document.querySelector('#stage'),
  panel: document.querySelector('#panel'),
  state,
  steps,
  controls: [
    { title: 'Flip and reorder' },
    { key: 'order', label: 'Row order of P', options: Object.keys(ORDERS).map((k) => [k, k]) },
    { readout: [['Rows of PA, top to bottom', (s) => ORDERS[s.order].map((r) => `row ${r + 1}`).join(', ')]] },
  ],
  onChange: (s) => formula.update(s),
});
