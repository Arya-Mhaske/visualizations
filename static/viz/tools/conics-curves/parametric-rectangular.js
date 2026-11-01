import { createStepper } from '../../lib/stepper.js';
import { liveFormula } from '../../lib/formula.js';
import { fixed } from '../../lib/format.js';
import { curve, equalFigure, trace } from './_conics-view.js';

// Each case: the parametric form, how to get the rectangular one (or the reverse), and the curve to draw.
const CASES = [
  { name: 'Line: x = 2t + 1, y = 3t − 2', dir: 'eliminate', f: (t) => [2 * t + 1, 3 * t - 2], range: [-3, 3],
    par: 'x=2t+1,\\ y=3t-2',
    steps: [['Solve one equation for t.', 't=\\dfrac{x-1}{2}'], ['Put it into the other.', 'y=3\\cdot\\dfrac{x-1}{2}-2'], ['Simplify.', 'y=\\dfrac32x-\\dfrac72'], ['A line with slope 3/2. Every t gives a point on it.', '2y=3x-7']] },
  { name: 'Parabola: x = t², y = 2t', dir: 'eliminate', f: (t) => [t * t, 2 * t], range: [-3, 3],
    par: 'x=t^2,\\ y=2t',
    steps: [['The y equation is simplest to solve for t.', 't=\\dfrac y2'], ['Put it into x = t².', 'x=\\left(\\dfrac y2\\right)^2'], ['Simplify.', 'y^2=4x'], ['A parabola. Note t can be negative, so both halves are drawn.', '\\text{focus }(1,0)']] },
  { name: 'Circle: x = 3 cos t, y = 3 sin t', dir: 'eliminate', f: (t) => [3 * Math.cos(t), 3 * Math.sin(t)], range: [0, 6.2832],
    par: 'x=3\\cos t,\\ y=3\\sin t',
    steps: [['t is inside trig functions, so square and add instead of solving.', 'x^2=9\\cos^2t,\\ y^2=9\\sin^2t'], ['Add them.', 'x^2+y^2=9(\\cos^2t+\\sin^2t)'], ['Use cos²t + sin²t = 1.', 'x^2+y^2=9'], ['A circle of radius 3. The equation forgets the direction and the speed.', 'r=3']] },
  { name: 'Ellipse: x = 4 cos t, y = 2 sin t', dir: 'eliminate', f: (t) => [4 * Math.cos(t), 2 * Math.sin(t)], range: [0, 6.2832],
    par: 'x=4\\cos t,\\ y=2\\sin t',
    steps: [['Isolate the cosine and sine.', '\\cos t=\\dfrac x4,\\ \\sin t=\\dfrac y2'], ['Square and add.', '\\dfrac{x^2}{16}+\\dfrac{y^2}{4}=\\cos^2t+\\sin^2t'], ['Use cos²t + sin²t = 1.', '\\dfrac{x^2}{16}+\\dfrac{y^2}{4}=1'], ['An ellipse with a = 4 and b = 2.', 'a=4,\\ b=2']] },
  { name: 'Parametrise y = x²', dir: 'parametrise', f: (t) => [t, t * t], range: [-3, 3],
    par: 'x=t,\\ y=t^2',
    steps: [['Let x be the parameter itself: x = t.', 'x=t'], ['Then y follows from the equation.', 'y=x^2=t^2'], ['That is a parametrisation. Many others work too, such as x = 2t, y = 4t².', 'x=2t,\\ y=4t^2']] },
  { name: 'Parametrise x²/9 + y²/4 = 1', dir: 'parametrise', f: (t) => [3 * Math.cos(t), 2 * Math.sin(t)], range: [0, 6.2832],
    par: 'x=3\\cos t,\\ y=2\\sin t',
    steps: [['Because cos²t + sin²t = 1, let x/3 be a cosine and y/2 be a sine.', '\\dfrac x3=\\cos t,\\ \\dfrac y2=\\sin t'], ['Solve for x and y.', 'x=3\\cos t,\\ y=2\\sin t'], ['Check by substituting back.', '\\cos^2t+\\sin^2t=1']] },
];
const state = { which: 0, t: 0.5 };
const tVal = (s = state) => CASES[s.which].range[0] + s.t * (CASES[s.which].range[1] - CASES[s.which].range[0]);

const stageEl = document.querySelector('#stage');
stageEl.setAttribute('role', 'group');
stageEl.setAttribute('aria-label', 'The curve with a marker at the chosen value of the parameter t, followed by the worked conversion between parametric and rectangular form');
const figure = equalFigure(stageEl, 'The curve with a marker at the chosen value of t', 5, (ctx, plot, c) => {
  const k = CASES[state.which];
  curve(plot, trace(k.f, k.range[0], k.range[1], 300), { color: c.a, width: 4 });
  const p = k.f(tVal());
  plot.point(p[0], p[1], { fill: c.fillY, r: 9 });
}, [0, 0]);

function steps(s) {
  const k = CASES[s.which];
  return k.steps.map(([text, tex]) => ({ text, tex }));
}

const formula = liveFormula(document.querySelector('#formula'), (s) => CASES[s.which].par);
formula.update(state);

createStepper({
  stage: stageEl,
  panel: document.querySelector('#panel'),
  state,
  steps,
  controls: [
    { title: 'Choose a curve' },
    { key: 'which', label: 'Curve', min: 0, max: CASES.length - 1, step: 1, format: (v) => CASES[v].name },
    { key: 't', label: 'Marker along the curve', min: 0, max: 1, step: 0.01, format: (v) => `${Math.round(v * 100)}%` },
    { readout: [
      ['Task', (s) => (CASES[s.which].dir === 'eliminate' ? 'Eliminate t' : 'Find a parametrisation')],
      ['Point at the marker', (s) => `(${fixed(CASES[s.which].f(tVal(s))[0], 2)}, ${fixed(CASES[s.which].f(tVal(s))[1], 2)})`],
    ] },
  ],
  onChange(s) { formula.update(s); figure.invalidate(); },
});
