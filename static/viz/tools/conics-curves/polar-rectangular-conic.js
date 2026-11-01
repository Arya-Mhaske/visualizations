import { createStepper } from '../../lib/stepper.js';
import { liveFormula } from '../../lib/formula.js';
import { fixed } from '../../lib/format.js';
import { contour } from '../vectors-3d/_quadric-surfaces-math.js';
import { conicValue } from './_conics-math.js';
import { rectangular, typeOf } from './_rotation-math.js';
import { equalFigure } from './_conics-view.js';

const state = { mode: 'toRect', e: 0.5, l: 2 };
const n = (v) => fixed(v, 3);
const near = (e) => Math.round(e * 100) / 100;

const stageEl = document.querySelector('#stage');
stageEl.setAttribute('role', 'group');
stageEl.setAttribute('aria-label', 'The conic drawn from its rectangular equation, followed by the worked conversion between polar and rectangular form');
const figure = equalFigure(stageEl, 'The conic with its focus at the origin', 6, (ctx, plot, c) => {
  contour((x, y) => conicValue(rectangular(state.l, state.e), x, y), -9, 9, 160).forEach(([p, r]) => plot.segment(p[0], p[1], r[0], r[1], { color: c.a, width: 4 }));
  plot.point(0, 0, { fill: c.c, r: 7 });
}, [0, 0]);

function steps(s) {
  const q = rectangular(s.l, s.e);
  const eq = `${n(q.A)}x^2${q.D < 0 ? '-' : '+'}${n(Math.abs(q.D))}x+y^2=${n(s.l * s.l)}`;
  if (s.mode === 'toRect') {
    return [
      { text: 'Start with the polar equation and clear the fraction.', tex: `r=\\dfrac{${s.l}}{1-${n(s.e)}\\cos\\theta}\\ \\Rightarrow\\ r-${n(s.e)}\\,r\\cos\\theta=${s.l}` },
      { text: 'Use x = r cos θ and r = √(x² + y²), so r = ℓ + e x.', tex: `r=${s.l}+${n(s.e)}x` },
      { text: 'Square both sides and use r² = x² + y².', tex: `x^2+y^2=(${s.l}+${n(s.e)}x)^2` },
      { text: 'Collect the terms.', tex: eq },
      { text: `The coefficient of x² is 1 − e² = ${n(1 - s.e * s.e)}. Positive and not 1 means an ellipse, 0 a parabola, negative a hyperbola. Here: ${typeOf(near(s.e))}.`, tex: `1-e^2=${n(1 - s.e * s.e)}` },
    ];
  }
  return [
    { text: 'Start with the rectangular equation of a conic with a focus at the origin.', tex: eq },
    { text: 'Rewrite x² + y² as r² and x as r cos θ.', tex: `r^2-${n(s.e * s.e)}\\,x^2${q.D < 0 ? '-' : '+'}${n(Math.abs(q.D))}x=${n(s.l * s.l)}` },
    { text: 'Spot the perfect square: x² + y² = (ℓ + e x)² gives r = ℓ + e x (taking the positive root).', tex: `r=${s.l}+${n(s.e)}\\,r\\cos\\theta` },
    { text: 'Solve for r.', tex: `r=\\dfrac{${s.l}}{1-${n(s.e)}\\cos\\theta}` },
    { text: 'Read off the eccentricity from the number beside cos θ.', tex: `e=${n(s.e)}\\ \\Rightarrow\\ \\text{${typeOf(near(s.e))}}` },
  ];
}

const formula = liveFormula(document.querySelector('#formula'), (s) => `r=\\dfrac{${s.l}}{1-${n(s.e)}\\cos\\theta}\\iff ${n(rectangular(s.l, s.e).A)}x^2-${n(2 * s.l * s.e)}x+y^2=${n(s.l * s.l)}`);
formula.update(state);

createStepper({
  stage: stageEl,
  panel: document.querySelector('#panel'),
  state,
  steps,
  controls: [
    { title: 'Convert' },
    { key: 'mode', label: 'Direction', options: [['toRect', 'Polar → rectangular'], ['toPolar', 'Rectangular → polar']] },
    { key: 'e', label: 'Eccentricity, e', min: 0.2, max: 2, step: 0.1, format: (v) => v.toFixed(1) },
    { key: 'l', label: 'ℓ (the number on top)', min: 1, max: 4, step: 1 },
    { readout: [
      ['Shape', (s) => typeOf(near(s.e))],
      ['Coefficient of x²', (s) => n(1 - s.e * s.e)],
    ] },
  ],
  onChange(s) { formula.update(s); figure.invalidate(); },
});
