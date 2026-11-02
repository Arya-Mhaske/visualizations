import { createStepper } from '../../lib/stepper.js';
import { liveFormula } from '../../lib/formula.js';
import { fixed } from '../../lib/format.js';
import { SEPARABLE, numericValue } from './_separable-math.js';

const state = { which: 'growth', y0: 2 };
const preset = (s) => SEPARABLE[s.which];

// The worked lines for each preset, with the starting value put in.
const WORK = {
  growth: (y0) => ({
    ode: "\\dfrac{dy}{dx}=2xy",
    sep: "\\dfrac{dy}{y}=2x\\,dx",
    integrate: "\\ln|y|=x^2+C",
    solve: "y=A\\,e^{x^2}\\qquad(A=\\pm e^{C})",
    condition: `y(0)=A=${y0}`,
    final: `y=${y0}\\,e^{x^2}`,
    at: `y(1)=${y0}e=${fixed(y0 * Math.E, 4)}`,
  }),
  circle: (y0) => ({
    ode: "\\dfrac{dy}{dx}=\\dfrac{x}{y}",
    sep: "y\\,dy=x\\,dx",
    integrate: "\\dfrac{y^2}{2}=\\dfrac{x^2}{2}+C",
    solve: "y^2=x^2+A\\qquad(A=2C)",
    condition: `y(0)=${y0}\\Rightarrow A=${y0 * y0}`,
    final: `y=\\sqrt{x^2+${y0 * y0}}`,
    at: `y(1)=\\sqrt{1+${y0 * y0}}=${fixed(Math.sqrt(1 + y0 * y0), 4)}`,
  }),
  hyper: (y0) => ({
    ode: "\\dfrac{dy}{dx}=-\\dfrac{y}{x}",
    sep: "\\dfrac{dy}{y}=-\\dfrac{dx}{x}",
    integrate: "\\ln|y|=-\\ln|x|+C",
    solve: "y=\\dfrac{A}{x}",
    condition: `y(1)=A=${y0}`,
    final: `y=\\dfrac{${y0}}{x}`,
    at: `y(2)=${fixed(y0 / 2, 4)}`,
  }),
  expo: (y0) => ({
    ode: "\\dfrac{dy}{dx}=e^{x-y}=e^{x}e^{-y}",
    sep: "e^{y}\\,dy=e^{x}\\,dx",
    integrate: "e^{y}=e^{x}+C",
    solve: "y=\\ln\\left(e^{x}+C\\right)",
    condition: `y(0)=${y0}\\Rightarrow e^{${y0}}=1+C\\Rightarrow C=${fixed(Math.exp(y0) - 1, 3)}`,
    final: `y=\\ln\\left(e^{x}+${fixed(Math.exp(y0) - 1, 3)}\\right)`,
    at: `y(1)=${fixed(Math.log(Math.E + Math.exp(y0) - 1), 4)}`,
  }),
};
const work = (s) => WORK[s.which](s.y0);

function steps(s) {
  const w = work(s);
  const p = preset(s);
  return [
    { text: `The equation, with y(${p.x0}) = ${s.y0}.`, tex: w.ode },
    { text: 'Separate: every y with dy on one side, every x with dx on the other.', tex: w.sep },
    { text: 'Integrate both sides. One constant is enough.', tex: w.integrate },
    { text: 'Solve for y.', tex: w.solve },
    { text: 'Put in the initial value to find the constant.', tex: w.condition },
    { text: 'The particular solution.', tex: w.final },
    { text: `Check at x = ${p.xEval}: the closed form against a numerical solution of the equation.`, tex: `${w.at}\\quad\\text{numerical: }${fixed(numericValue(p, s.y0), 4)}` },
  ];
}

const formula = liveFormula(document.querySelector('#formula'), (s) => `${work(s).ode},\\quad y(${preset(s).x0})=${s.y0}`);
formula.update(state);

createStepper({
  stage: document.querySelector('#stage'),
  panel: document.querySelector('#panel'),
  state,
  steps,
  controls: [
    { title: 'Choose an equation' },
    { key: 'which', label: 'Equation', options: Object.entries(SEPARABLE).map(([key, v]) => [key, v.name]) },
    { key: 'y0', label: 'Initial value y₀', min: 1, max: 5, step: 1, format: (n) => `${n}` },
    { readout: [
      ['Value at the check point', (s) => fixed(preset(s).sol(s.y0, preset(s).xEval), 4)],
    ] },
  ],
  onChange: (s) => formula.update(s),
});
