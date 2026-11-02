import { createStepper } from '../../lib/stepper.js';
import { liveFormula } from '../../lib/formula.js';
import { compose, cycleText, invertPerm, permOrder } from './_aa-math.js';

// Permutations of {1,...,6} given as cycles. (στ)(x) = σ(τ(x)): do τ first, then σ.
const N = 6;
export function fromCycles(cycles) {
  const p = [...Array(N).keys()];
  for (const cy of cycles) cy.forEach((x, i) => { p[x - 1] = cy[(i + 1) % cy.length] - 1; });
  return p;
}
const PRESETS = [
  [(1), [[1, 2, 3]]],
  [(2), [[1, 2], [3, 4]]],
  [(3), [[1, 3, 5], [2, 4]]],
  [(4), [[1, 6, 2], [3, 5]]],
  [(5), [[2, 3, 4, 5]]],
].map(([, cycles]) => ({ cycles, p: fromCycles(cycles), name: cycles.map((cy) => `(${cy.join(' ')})`).join('') }));
const state = { s: 2, t: 3 };
const pick = (k) => PRESETS[k - 1];

function steps(st) {
  const sigma = pick(st.s).p;
  const tau = pick(st.t).p;
  const both = compose(sigma, tau);
  const out = [
    { text: 'Each permutation is a list of loops. A number not mentioned stays where it is.', tex: `\\sigma=${pick(st.s).name},\\quad \\tau=${pick(st.t).name}` },
    { text: 'To compose, follow each number through τ first and then through σ.' },
  ];
  for (let x = 0; x < N; x++) out.push({ text: `Follow ${x + 1}: τ sends it to ${tau[x] + 1}, then σ sends that to ${sigma[tau[x]] + 1}.`, tex: `${x + 1}\\xrightarrow{\\tau}${tau[x] + 1}\\xrightarrow{\\sigma}${both[x] + 1}` });
  out.push({ text: 'Now trace the arrows of στ from 1 and close each loop.', tex: `\\sigma\\tau=${cycleText(both).replaceAll(' ', '\\,')}` });
  out.push({ text: 'To invert a permutation, run each loop backwards.', tex: `\\sigma^{-1}=${cycleText(invertPerm(sigma)).replaceAll(' ', '\\,')}` });
  out.push({ text: `The order of στ is the lcm of its loop lengths: ${permOrder(both)}.` });
  return out;
}

const formula = liveFormula(document.querySelector('#formula'), (st) => `\\sigma\\tau=${pick(st.s).name.replaceAll(' ', '\\,')}${pick(st.t).name.replaceAll(' ', '\\,')}=${cycleText(compose(pick(st.s).p, pick(st.t).p)).replaceAll(' ', '\\,')}`);
formula.update(state);

createStepper({
  stage: document.querySelector('#stage'),
  panel: document.querySelector('#panel'),
  state,
  steps,
  controls: [
    { title: 'Choose two permutations' },
    { key: 's', label: 'σ', options: PRESETS.map((p, i) => [i + 1, p.name]) },
    { key: 't', label: 'τ', options: PRESETS.map((p, i) => [i + 1, p.name]) },
    { readout: [['στ', (st) => cycleText(compose(pick(st.s).p, pick(st.t).p))], ['τσ', (st) => cycleText(compose(pick(st.t).p, pick(st.s).p))]] },
  ],
  onChange: (st) => formula.update(st),
});
