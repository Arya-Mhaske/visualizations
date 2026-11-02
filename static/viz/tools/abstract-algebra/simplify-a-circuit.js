import { createStepper } from '../../lib/stepper.js';
import { liveFormula } from '../../lib/formula.js';

// Each step uses a law of Boolean algebra. The tool also checks the truth table after every step, so a wrong move would show.
const PRESETS = {
  a: { name: 'AB + AB′', steps: [
    { law: 'Start', tex: 'AB+AB\'', f: (a, b) => (a && b) || (a && !b), switches: 4 },
    { law: 'Distributive law: take out the common A', tex: 'A(B+B\')', f: (a, b) => a && (b || !b), switches: 3 },
    { law: 'Complement law: B + B′ = 1', tex: 'A\\cdot 1', f: (a) => a && true, switches: 1 },
    { law: 'Identity law: A · 1 = A', tex: 'A', f: (a) => a, switches: 1 },
  ] },
  b: { name: 'A + A′B', steps: [
    { law: 'Start', tex: 'A+A\'B', f: (a, b) => a || (!a && b), switches: 3 },
    { law: 'Distributive law: A + XY = (A + X)(A + Y)', tex: '(A+A\')(A+B)', f: (a, b) => (a || !a) && (a || b), switches: 4 },
    { law: 'Complement law: A + A′ = 1', tex: '1\\cdot(A+B)', f: (a, b) => true && (a || b), switches: 2 },
    { law: 'Identity law: 1 · X = X', tex: 'A+B', f: (a, b) => a || b, switches: 2 },
  ] },
  c: { name: '(A + B)(A + B′)', steps: [
    { law: 'Start', tex: '(A+B)(A+B\')', f: (a, b) => (a || b) && (a || !b), switches: 4 },
    { law: 'Distributive law: A + BB′', tex: 'A+BB\'', f: (a, b) => a || (b && !b), switches: 3 },
    { law: 'Complement law: B · B′ = 0', tex: 'A+0', f: (a) => a || false, switches: 1 },
    { law: 'Identity law: A + 0 = A', tex: 'A', f: (a) => a, switches: 1 },
  ] },
  d: { name: 'A + AB', steps: [
    { law: 'Start', tex: 'A+AB', f: (a, b) => a || (a && b), switches: 3 },
    { law: 'Distributive law: A = A · 1', tex: 'A\\cdot 1+A\\cdot B', f: (a, b) => (a && true) || (a && b), switches: 3 },
    { law: 'Distributive law: take out A', tex: 'A(1+B)', f: (a, b) => a && (true || b), switches: 2 },
    { law: 'Domination law: 1 + B = 1', tex: 'A\\cdot 1=A', f: (a) => a, switches: 1 },
  ] },
};
const state = { which: 'a' };
const table = (f) => [[0, 0], [0, 1], [1, 0], [1, 1]].map(([a, b]) => (f(!!a, !!b) ? 1 : 0)).join('');
export const checks = (which) => { const S = PRESETS[which].steps; return S.map((st) => table(st.f) === table(S[0].f)); };

function steps(s) {
  const S = PRESETS[s.which].steps;
  return S.map((st, i) => ({
    text: `${st.law}. Truth table (00, 01, 10, 11): ${table(st.f)}${i ? (table(st.f) === table(S[0].f) ? ' — same as the start ✓' : ' — different ✗') : ''}. Switches: ${st.switches}.`,
    tex: st.tex,
  }));
}

const formula = liveFormula(document.querySelector('#formula'), (s) => `${PRESETS[s.which].steps[0].tex}=${PRESETS[s.which].steps.at(-1).tex}`);
formula.update(state);

createStepper({
  stage: document.querySelector('#stage'),
  panel: document.querySelector('#panel'),
  state,
  steps,
  controls: [
    { title: 'Choose a circuit' },
    { key: 'which', label: 'Expression', options: Object.entries(PRESETS).map(([k, v]) => [k, v.name]) },
    { readout: [
      ['Switches at the start', (s) => String(PRESETS[s.which].steps[0].switches)],
      ['Switches at the end', (s) => String(PRESETS[s.which].steps.at(-1).switches)],
      ['Every step keeps the truth table', (s) => { const ok = checks(s.which).every(Boolean); return { text: ok ? 'yes' : 'no', good: ok }; }],
    ] },
  ],
  onChange: (s) => formula.update(s),
});
