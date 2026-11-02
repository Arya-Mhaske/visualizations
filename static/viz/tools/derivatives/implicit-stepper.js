import { createStepper } from '../../lib/stepper.js';
import { liveFormula } from '../../lib/formula.js';
import { fixed } from '../../lib/format.js';
import { CURVES, nudge, slopeAt } from './_implicit-math.js';

const state = { which: 'circle', p: 1 };
const curveOf = (s) => CURVES[s.which];
const pointOf = (s) => curveOf(s).points[s.p - 1];

function steps(s) {
  const curve = curveOf(s);
  const [x, y] = pointOf(s);
  const m = slopeAt(curve, x, y);
  return [
    { text: 'Start with the curve. It is not solved for y, but near any point y is a function of x.', tex: curve.tex },
    { text: "Differentiate both sides with respect to x. Each y-term gets a y′ by the chain rule.", tex: curve.diff },
    { text: "Collect the terms with y′ on one side.", tex: curve.collect },
    { text: "Solve for y′.", tex: curve.solve },
    { text: `Put in the point (${x}, ${y}). It lies on the curve: the left side minus the right is ${fixed(curve.F(x, y), 6)}.`, tex: `y'=${fixed(m, 4)}` },
    { text: 'Check: nudge x either side, slide y back onto the curve, and measure the slope.', tex: `\\dfrac{\\Delta y}{\\Delta x}\\approx${fixed(nudge(curve, x, y), 4)}` },
  ];
}

const formula = liveFormula(document.querySelector('#formula'), (s) => {
  const [x, y] = pointOf(s);
  return `${curveOf(s).tex}\\ \\text{at}\\ (${x},\\ ${y})`;
});
formula.update(state);

createStepper({
  stage: document.querySelector('#stage'),
  panel: document.querySelector('#panel'),
  state,
  steps,
  controls: [
    { title: 'Choose a curve' },
    { key: 'which', label: 'Curve', options: Object.entries(CURVES).map(([key, v]) => [key, v.name]) },
    { key: 'p', label: 'Point on the curve', min: 1, max: 4, step: 1, format: (n) => `${n}` },
    { readout: [
      ['Point (x, y)', (s) => `(${pointOf(s)[0]}, ${pointOf(s)[1]})`],
      ['dy/dx there', (s) => ({ text: fixed(slopeAt(curveOf(s), ...pointOf(s)), 4), good: true })],
    ] },
  ],
  onChange: (s) => formula.update(s),
});
