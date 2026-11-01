import { createStepper } from '../../lib/stepper.js';
import { liveFormula } from '../../lib/formula.js';
import { fixed } from '../../lib/format.js';
import { graphFigure } from '../numbers-algebra/_quadratic-equations-view.js';

const C = Math.cos;
const S = Math.sin;
const CASES = {
  tan: { f: Math.tan, d: (x) => 1 / C(x) ** 2, rule: '\\tan x=\\dfrac{\\sin x}{\\cos x}', steps: [['Write it as a quotient.', '\\tan x=\\dfrac{\\sin x}{\\cos x}'], ['Quotient rule: (u′v − uv′) ÷ v².', '\\dfrac{\\cos x\\cdot\\cos x-\\sin x\\cdot(-\\sin x)}{\\cos^2x}'], ['The top is cos²x + sin²x = 1.', '\\dfrac{1}{\\cos^2x}'], ['That is sec²x.', '(\\tan x)\'=\\sec^2x']] },
  cot: { f: (x) => 1 / Math.tan(x), d: (x) => -1 / S(x) ** 2, rule: '\\cot x=\\dfrac{\\cos x}{\\sin x}', steps: [['Write it as a quotient.', '\\cot x=\\dfrac{\\cos x}{\\sin x}'], ['Quotient rule.', '\\dfrac{(-\\sin x)\\sin x-\\cos x\\cos x}{\\sin^2x}'], ['The top is −(sin²x + cos²x) = −1.', '\\dfrac{-1}{\\sin^2x}'], ['That is −csc²x.', '(\\cot x)\'=-\\csc^2x']] },
  sec: { f: (x) => 1 / C(x), d: (x) => S(x) / C(x) ** 2, rule: '\\sec x=\\dfrac{1}{\\cos x}', steps: [['Write it as a quotient.', '\\sec x=\\dfrac{1}{\\cos x}'], ['Quotient rule with u = 1, so u′ = 0.', '\\dfrac{0\\cdot\\cos x-1\\cdot(-\\sin x)}{\\cos^2x}'], ['Simplify.', '\\dfrac{\\sin x}{\\cos^2x}'], ['Split into two fractions.', '(\\sec x)\'=\\dfrac{1}{\\cos x}\\cdot\\dfrac{\\sin x}{\\cos x}=\\sec x\\tan x']] },
  csc: { f: (x) => 1 / S(x), d: (x) => -C(x) / S(x) ** 2, rule: '\\csc x=\\dfrac{1}{\\sin x}', steps: [['Write it as a quotient.', '\\csc x=\\dfrac{1}{\\sin x}'], ['Quotient rule with u = 1.', '\\dfrac{0\\cdot\\sin x-1\\cdot\\cos x}{\\sin^2x}'], ['Simplify.', '\\dfrac{-\\cos x}{\\sin^2x}'], ['Split into two fractions.', '(\\csc x)\'=-\\csc x\\cot x']] },
};
const state = { fn: 'tan', x: 0.6 };
const stageEl = document.querySelector('#stage');
stageEl.setAttribute('role', 'group');
stageEl.setAttribute('aria-label', 'The graph of the chosen function with its tangent line at a point, followed by its derivative worked from sine and cosine');
const figure = graphFigure(stageEl, 'The function with its tangent line', [-1, 7], [-5, 5], (ctx, plot, c) => {
  const k = CASES[state.fn];
  plot.fn(k.f, { color: c.a, width: 3 });
  const y = k.f(state.x);
  const m = k.d(state.x);
  plot.segment(state.x - 0.7, y - 0.7 * m, state.x + 0.7, y + 0.7 * m, { color: c.c, width: 3 });
  plot.point(state.x, y, { fill: c.fillY, r: 7 });
});
const formula = liveFormula(document.querySelector('#formula'), (s) => CASES[s.fn].rule);
formula.update(state);
createStepper({
  stage: stageEl,
  panel: document.querySelector('#panel'),
  state,
  steps: (s) => CASES[s.fn].steps.map(([text, tex]) => ({ text, tex })),
  controls: [
    { title: 'Choose a function' },
    { key: 'fn', label: 'Function', options: [['tan', 'tan'], ['cot', 'cot'], ['sec', 'sec'], ['csc', 'csc']] },
    { key: 'x', label: 'Look at x =', min: 0.3, max: 6, step: 0.1, format: (v) => v.toFixed(1) },
    { readout: [
      ['Slope by the formula', (s) => fixed(CASES[s.fn].d(s.x), 4)],
      ['Measured slope', (s) => fixed((CASES[s.fn].f(s.x + 1e-6) - CASES[s.fn].f(s.x - 1e-6)) / 2e-6, 4)],
    ] },
  ],
  onChange(s) { formula.update(s); figure.invalidate(); },
});
