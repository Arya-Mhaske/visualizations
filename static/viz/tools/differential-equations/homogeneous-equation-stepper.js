import { createStepper } from '../../lib/stepper.js';
import { liveFormula } from '../../lib/formula.js';
import { fixed } from '../../lib/format.js';
import { HOMOGENEOUS } from './_separable-math.js';

const state = { which: 'a', lambda: 2 };
const P = [1, 2]; // the test point (x, y)
const eq = (s) => HOMOGENEOUS[s.which];

const WORK = {
  a: { ode: "\\dfrac{dy}{dx}=\\dfrac{x+y}{x}", F: '1+v', sep: "dv=\\dfrac{dx}{x}", integrate: "v=\\ln|x|+C", final: "y=x\\left(\\ln|x|+C\\right)" },
  b: { ode: "\\dfrac{dy}{dx}=\\dfrac{x^2+y^2}{xy}", F: "\\dfrac{1}{v}+v", sep: "v\\,dv=\\dfrac{dx}{x}", integrate: "\\dfrac{v^2}{2}=\\ln|x|+C", final: "y^2=x^2\\left(2\\ln|x|+A\\right)" },
  c: { ode: "\\dfrac{dy}{dx}=\\dfrac{x^2+3y^2}{2xy}", F: "\\dfrac{1}{2v}+\\dfrac{3v}{2}", sep: "\\dfrac{2v\\,dv}{1+v^2}=\\dfrac{dx}{x}", integrate: "\\ln\\left(1+v^2\\right)=\\ln|x|+C", final: "x^2+y^2=A\\,|x|^{3}" },
  d: { ode: "\\dfrac{dy}{dx}=x+y" },
};

function steps(s) {
  const e = eq(s);
  const w = WORK[s.which];
  const [x, y] = P;
  const scaled = e.f(s.lambda * x, s.lambda * y);
  const plain = e.f(x, y);
  const same = Math.abs(scaled - plain) < 1e-9;
  const list = [
    { text: 'The equation.', tex: w.ode },
    { text: `Test: replace x by λx and y by λy at (${x}, ${y}) with λ = ${fixed(s.lambda, 1)}. Does the right side stay the same?`, tex: `f(\\lambda x,\\lambda y)=${fixed(scaled, 4)},\\qquad f(x,y)=${fixed(plain, 4)}` },
  ];
  if (!e.F) {
    list.push({ text: same ? 'λ = 1 changes nothing, so try another λ.' : 'They differ: the right side is not homogeneous of degree 0, so y = vx does not separate it. Stop.', tex: "f(\\lambda x,\\lambda y)=\\lambda\\,(x+y)\\ne f(x,y)" });
    return list;
  }
  list.push(
    { text: 'They agree for every λ (try others), so the slope depends only on v = y/x. Put y = vx, so y′ = v + x v′.', tex: `v+x\\,v'=${w.F}` },
    { text: 'Separate v and x.', tex: w.sep },
    { text: 'Integrate both sides.', tex: w.integrate },
    { text: 'Put v = y/x back.', tex: w.final },
  );
  return list;
}

const formula = liveFormula(document.querySelector('#formula'), (s) => WORK[s.which].ode);
formula.update(state);

createStepper({
  stage: document.querySelector('#stage'),
  panel: document.querySelector('#panel'),
  state,
  steps,
  controls: [
    { title: 'Choose an equation' },
    { key: 'which', label: 'Equation', options: Object.entries(HOMOGENEOUS).map(([key, v]) => [key, v.name]) },
    { key: 'lambda', label: 'Test factor λ', min: 1, max: 4, step: 0.5, format: (n) => fixed(n, 1) },
    { readout: [
      ['f(λx, λy) − f(x, y)', (s) => ({ text: fixed(eq(s).f(s.lambda * P[0], s.lambda * P[1]) - eq(s).f(...P), 4), good: Math.abs(eq(s).f(s.lambda * P[0], s.lambda * P[1]) - eq(s).f(...P)) < 1e-9 })],
      ['Homogeneous?', (s) => (eq(s).F ? 'yes' : 'no')],
    ] },
  ],
  onChange: (s) => formula.update(s),
});
