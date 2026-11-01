import { createStepper } from '../../lib/stepper.js';
import { liveFormula } from '../../lib/formula.js';
import { fixed } from '../../lib/format.js';
import { curve, equalFigure, trace } from '../conics-curves/_conics-view.js';

const CASES = [
  { name: 'f(x) = 2x + 3', f: (x) => 2 * x + 3, inv: (y) => (y - 3) / 2, tex: '2x+3', steps: [['Write y for f(x).', 'y=2x+3'], ['Swap x and y.', 'x=2y+3'], ['Solve for y.', 'x-3=2y\\ \\Rightarrow\\ y=\\dfrac{x-3}{2}'], ['Name it.', 'f^{-1}(x)=\\dfrac{x-3}{2}']] },
  { name: 'f(x) = (x − 1) ÷ (x + 2)', f: (x) => (x - 1) / (x + 2), inv: (y) => (2 * y + 1) / (1 - y), tex: '\\dfrac{x-1}{x+2}', steps: [['Write y for f(x).', 'y=\\dfrac{x-1}{x+2}'], ['Swap x and y.', 'x=\\dfrac{y-1}{y+2}'], ['Clear the fraction and collect the y terms.', 'xy+2x=y-1\\ \\Rightarrow\\ xy-y=-2x-1'], ['Factor out y and divide.', 'y(x-1)=-(2x+1)\\ \\Rightarrow\\ y=\\dfrac{2x+1}{1-x}'], ['Name it.', 'f^{-1}(x)=\\dfrac{2x+1}{1-x}']] },
  { name: 'f(x) = x³ + 1', f: (x) => x ** 3 + 1, inv: (y) => Math.cbrt(y - 1), tex: 'x^3+1', steps: [['Write y for f(x).', 'y=x^3+1'], ['Swap x and y.', 'x=y^3+1'], ['Solve for y.', 'y^3=x-1\\ \\Rightarrow\\ y=\\sqrt[3]{x-1}'], ['Name it.', 'f^{-1}(x)=\\sqrt[3]{x-1}']] },
  { name: 'f(x) = eˣ', f: Math.exp, inv: (y) => (y > 0 ? Math.log(y) : NaN), tex: 'e^x', steps: [['Write y for f(x).', 'y=e^x'], ['Swap x and y.', 'x=e^y'], ['Take the natural logarithm of both sides.', '\\ln x=y'], ['Name it. It exists for x > 0 only.', 'f^{-1}(x)=\\ln x']] },
];
const state = { which: 0, x: 1 };
const stageEl = document.querySelector('#stage');
stageEl.setAttribute('role', 'group');
stageEl.setAttribute('aria-label', 'The graph of f, its inverse and the mirror line y equals x, followed by the steps that find the inverse');
const figure = equalFigure(stageEl, 'The graph of f, its inverse and the line y = x', 5, (ctx, plot, c) => {
  const k = CASES[state.which];
  plot.segment(-9, -9, 9, 9, { color: c.grid, width: 2, dash: [6, 5] });
  curve(plot, trace((x) => (Number.isFinite(k.f(x)) && Math.abs(k.f(x)) < 12 ? [x, k.f(x)] : null), -5, 5, 400), { color: c.a, width: 3 });
  curve(plot, trace((x) => (Number.isFinite(k.inv(x)) && Math.abs(k.inv(x)) < 12 ? [x, k.inv(x)] : null), -5, 5, 400), { color: c.b, width: 3 });
}, [0, 0]);
const formula = liveFormula(document.querySelector('#formula'), (s) => `f(x)=${CASES[s.which].tex}`);
formula.update(state);
createStepper({
  stage: stageEl,
  panel: document.querySelector('#panel'),
  state,
  steps: (s) => CASES[s.which].steps.map(([text, tex]) => ({ text, tex })),
  controls: [
    { title: 'Choose a function' },
    { key: 'which', label: 'Function', min: 0, max: CASES.length - 1, step: 1, format: (v) => CASES[v].name },
    { key: 'x', label: 'Check at x =', min: -2, max: 3, step: 0.5 },
    { readout: [
      ['f⁻¹(f(x))', (s) => { const k = CASES[s.which]; const v = k.inv(k.f(s.x)); return { text: Number.isFinite(v) ? fixed(v, 4) : 'undefined', good: Math.abs(v - s.x) < 1e-9 }; }],
    ] },
  ],
  onChange(s) { formula.update(s); figure.invalidate(); },
});
