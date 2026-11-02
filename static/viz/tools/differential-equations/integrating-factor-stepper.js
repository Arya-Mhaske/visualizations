import { createStepper } from '../../lib/stepper.js';
import { liveFormula } from '../../lib/formula.js';
import { fixed } from '../../lib/format.js';
import { solve } from './_de-math.js';

// Each preset is y' + P(x) y = Q(x), solved as y = yp(x) + C h(x), with the starting value taken at x0.
const PRESETS = {
  const: {
    name: "y′ + 2y = 6", ode: "y'+2y=6", P: '2', mu: 'e^{2x}', prod: "\\left(e^{2x}y\\right)'=6e^{2x}", integral: 'e^{2x}y=3e^{2x}+C', general: 'y=3+Ce^{-2x}',
    rule: (x, y) => 6 - 2 * y, yp: () => 3, h: (x) => Math.exp(-2 * x), x0: 0,
  },
  reciprocal: {
    name: "y′ + y/x = x (x > 0)", ode: "y'+\\dfrac{y}{x}=x", P: '\\dfrac{1}{x}', mu: 'e^{\\ln x}=x', prod: "(xy)'=x^2", integral: 'xy=\\dfrac{x^3}{3}+C', general: 'y=\\dfrac{x^2}{3}+\\dfrac{C}{x}',
    rule: (x, y) => x - y / x, yp: (x) => (x * x) / 3, h: (x) => 1 / x, x0: 1,
  },
  decay: {
    name: "y′ + y = e⁻ˣ", ode: "y'+y=e^{-x}", P: '1', mu: 'e^{x}', prod: "\\left(e^{x}y\\right)'=1", integral: 'e^{x}y=x+C', general: 'y=(x+C)e^{-x}',
    rule: (x, y) => Math.exp(-x) - y, yp: (x) => x * Math.exp(-x), h: (x) => Math.exp(-x), x0: 0,
  },
  grow: {
    name: "y′ − 2y = x", ode: "y'-2y=x", P: '-2', mu: 'e^{-2x}', prod: "\\left(e^{-2x}y\\right)'=x\\,e^{-2x}", integral: "e^{-2x}y=-\\left(\\dfrac{x}{2}+\\dfrac{1}{4}\\right)e^{-2x}+C", general: 'y=-\\dfrac{x}{2}-\\dfrac{1}{4}+Ce^{2x}',
    rule: (x, y) => x + 2 * y, yp: (x) => -x / 2 - 0.25, h: (x) => Math.exp(2 * x), x0: 0,
  },
};
const XCHECK = 2;
const state = { which: 'const', y0: 1 };
const preset = (s) => PRESETS[s.which];
const constant = (s) => (s.y0 - preset(s).yp(preset(s).x0)) / preset(s).h(preset(s).x0);
const value = (s, x) => preset(s).yp(x) + constant(s) * preset(s).h(x);

function steps(s) {
  const p = preset(s);
  const C = constant(s);
  const rk = solve((x, [y]) => [p.rule(x, y)], [s.y0], p.x0, XCHECK, 400).at(-1)[1];
  return [
    { text: "Standard form: y′ + P(x)·y = Q(x). Read off P.", tex: `${p.ode},\\qquad P(x)=${p.P}` },
    { text: 'The integrating factor is e to the integral of P.', tex: `\\mu=e^{\\int P\\,dx}=${p.mu}` },
    { text: 'Multiply the equation by μ. The left side is now exactly the derivative of μy.', tex: p.prod },
    { text: 'Integrate both sides.', tex: p.integral },
    { text: 'Divide by μ to solve for y.', tex: p.general },
    { text: `Use y(${p.x0}) = ${s.y0} to find C.`, tex: `C=${fixed(C, 4)}` },
    { text: `Check at x = ${XCHECK}: the formula against a numerical solution.`, tex: `y(${XCHECK})=${fixed(value(s, XCHECK), 4)}\\qquad\\text{numerical: }${fixed(rk, 4)}` },
  ];
}

const formula = liveFormula(document.querySelector('#formula'), (s) => `${preset(s).ode},\\quad y(${preset(s).x0})=${s.y0}`);
formula.update(state);

createStepper({
  stage: document.querySelector('#stage'),
  panel: document.querySelector('#panel'),
  state,
  steps,
  controls: [
    { title: 'Choose an equation' },
    { key: 'which', label: 'Equation', options: Object.entries(PRESETS).map(([key, v]) => [key, v.name]) },
    { key: 'y0', label: 'Starting value', min: 0, max: 5, step: 1, format: (n) => `${n}` },
    { readout: [
      ['Constant C', (s) => fixed(constant(s), 4)],
      [`y at x = ${XCHECK}`, (s) => ({ text: fixed(value(s, XCHECK), 4), good: true })],
    ] },
  ],
  onChange: (s) => formula.update(s),
});
