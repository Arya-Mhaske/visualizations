import { createStepper } from '../../lib/stepper.js';
import { liveFormula } from '../../lib/formula.js';

// order = highest derivative. degree = its power, but only once the equation is a polynomial in the derivatives.
const EQS = {
  a: { name: "y″ + 3y′ + 2y = 0", tex: "y''+3y'+2y=0", derivs: 'y″ and y′', order: 2, power: 1, poly: true },
  b: { name: "(y′)³ + y = x", tex: "(y')^3+y=x", derivs: 'y′', order: 1, power: 3, poly: true },
  c: { name: "(y″)² + (y′)⁴ = x", tex: "(y'')^2+(y')^4=x", derivs: 'y″ and y′', order: 2, power: 2, poly: true },
  d: { name: "y‴ + (y″)² = 0", tex: "y'''+(y'')^2=0", derivs: 'y‴ and y″', order: 3, power: 1, poly: true },
  e: { name: "y″ = √(1 + (y′)²)", tex: "y''=\\sqrt{1+(y')^2}", derivs: 'y″ and y′', order: 2, poly: false, fixed: "(y'')^2=1+(y')^2", power: 2 },
  f: { name: "y‴ + sin(y′) = 0", tex: "y'''+\\sin(y')=0", derivs: 'y‴ and y′', order: 3, poly: false, power: null, why: 'sin(y′) cannot be written as a polynomial in y′' },
  g: { name: "e^(y′) + y = 0", tex: "e^{y'}+y=0", derivs: 'y′', order: 1, poly: false, power: null, why: 'e^(y′) cannot be written as a polynomial in y′' },
};
const state = { which: 'f' };
const eq = (s) => EQS[s.which];
const degreeText = (e) => (e.power === null ? 'not defined' : String(e.power));

function steps(s) {
  const e = eq(s);
  const list = [
    { text: 'Write the equation.', tex: e.tex },
    { text: `List the derivatives that appear: ${e.derivs}. The order is the highest one.`, tex: `\\text{order}=${e.order}` },
  ];
  if (e.poly) {
    list.push({ text: 'Is the equation a polynomial in its derivatives? Yes: no derivative sits inside sin, e or a root.' });
  } else if (e.fixed) {
    list.push({ text: 'A root hides the power. Square both sides to clear it, then read the power.', tex: e.fixed });
  } else {
    list.push({ text: `Is the equation a polynomial in its derivatives? No: ${e.why}.` });
  }
  list.push(e.power === null
    ? { text: 'So the degree is not defined for this equation.', tex: '\\text{degree: not defined}' }
    : { text: `The degree is the power of the highest derivative${e.fixed ? ' (after clearing the root)' : ''}.`, tex: `\\text{degree}=${e.power}` });
  return list;
}

const formula = liveFormula(document.querySelector('#formula'), (s) => eq(s).tex);
formula.update(state);

createStepper({
  stage: document.querySelector('#stage'),
  panel: document.querySelector('#panel'),
  state,
  steps,
  controls: [
    { title: 'Choose an equation' },
    { key: 'which', label: 'Equation', options: Object.entries(EQS).map(([key, v]) => [key, v.name]) },
    { readout: [
      ['Order', (s) => String(eq(s).order)],
      ['Degree', (s) => ({ text: degreeText(eq(s)), good: eq(s).power !== null })],
    ] },
  ],
  onChange: (s) => formula.update(s),
});
