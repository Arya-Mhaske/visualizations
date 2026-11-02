import { createTool } from '../../lib/tool.js';
import { stepsView } from '../numbers-algebra/_steps-view.js';
import { fixed } from '../../lib/format.js';

const FN = {
  sq: { name: 'x²', f: (x) => x * x, d: (x) => 2 * x, steps: [['\\dfrac{(x+h)^2-x^2}{h}', 'the difference quotient'], ['=\\dfrac{x^2+2xh+h^2-x^2}{h}', 'expand'], ['=\\dfrac{2xh+h^2}{h}', 'simplify the top'], ['=2x+h', 'cancel h (h ≠ 0)'], ['\\to 2x\\ \\text{as}\\ h\\to0', 'let h → 0']] },
  cube: { name: 'x³', f: (x) => x ** 3, d: (x) => 3 * x * x, steps: [['\\dfrac{(x+h)^3-x^3}{h}', 'the difference quotient'], ['=\\dfrac{3x^2h+3xh^2+h^3}{h}', 'expand and cancel x³'], ['=3x^2+3xh+h^2', 'cancel h'], ['\\to 3x^2\\ \\text{as}\\ h\\to0', 'let h → 0']] },
  inv: { name: '1/x', f: (x) => 1 / x, d: (x) => -1 / (x * x), steps: [['\\dfrac{\\frac1{x+h}-\\frac1x}{h}', 'the difference quotient'], ['=\\dfrac{x-(x+h)}{x(x+h)h}', 'common denominator'], ['=\\dfrac{-h}{x(x+h)h}=\\dfrac{-1}{x(x+h)}', 'cancel h'], ['\\to-\\dfrac1{x^2}\\ \\text{as}\\ h\\to0', 'let h → 0']] },
  root: { name: '√x', f: Math.sqrt, d: (x) => 1 / (2 * Math.sqrt(x)), steps: [['\\dfrac{\\sqrt{x+h}-\\sqrt x}{h}', 'the difference quotient'], ['=\\dfrac{(x+h)-x}{h(\\sqrt{x+h}+\\sqrt x)}', 'multiply top and bottom by the conjugate'], ['=\\dfrac1{\\sqrt{x+h}+\\sqrt x}', 'cancel h'], ['\\to\\dfrac1{2\\sqrt x}\\ \\text{as}\\ h\\to0', 'let h → 0']] },
};
const state = { f: 'sq', step: 1, x: 2, h: 0.5 };
const cur = (s) => FN[s.f];
let view;
let tool;
const quot = (s) => (cur(s).f(s.x + s.h) - cur(s).f(s.x)) / s.h;

tool = createTool({
  state,
  label: 'The worked steps for finding a derivative from the definition, revealed one at a time, and a numeric difference quotient that approaches the derivative as h gets smaller.',
  dom: (el) => {
    view = stepsView(el);
    return { refresh: () => view.show(cur(state).steps.map(([t, n]) => ({ tex: t, note: n })), Math.min(state.step, cur(state).steps.length)) };
  },
  controls: [
    { title: 'From the definition' },
    { key: 'f', label: 'Function', options: Object.entries(FN).map(([k, v]) => [k, v.name]) },
    { key: 'step', label: 'Steps shown', min: 1, max: 5, step: 1 },
    { key: 'x', label: 'x', min: 0.5, max: 4, step: 0.5 },
    { key: 'h', label: 'h', min: 0.001, max: 1, step: 0.001 },
    { readout: [['Quotient at this h', (s) => fixed(quot(s), 5)], ['f′(x)', (s) => fixed(cur(s).d(s.x), 5)], ['Gap', (s) => fixed(Math.abs(quot(s) - cur(s).d(s.x)), 5)]] },
  ],
  tex: (s) => cur(s).steps[Math.min(s.step, cur(s).steps.length) - 1][0],
  onChange: (s) => {
    s.step = Math.min(s.step, cur(s).steps.length);
    tool?.ui.refresh();
  },
});
