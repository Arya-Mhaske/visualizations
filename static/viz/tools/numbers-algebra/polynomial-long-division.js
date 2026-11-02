import { createTool } from '../../lib/tool.js';
import { stepsView } from './_steps-view.js';
import { longDivision, tex, evalP } from './_poly.js';

const PRE = [{ p: [1, 2, -5, -6], d: [1, 3] }, { p: [6, 7, -1, -2], d: [2, 1] }, { p: [1, 0, 0, -8], d: [1, -2] }, { p: [1, 3, 5, 2], d: [1, 1, 1] }];
const state = { i: 0, step: 1, x: 2 };
const cur = (s) => PRE[s.i];
let view;
let tool;
function lines(s) {
  const { p, d } = cur(s);
  const r = longDivision(p, d);
  const out = [{ tex: `\\dfrac{${tex(p)}}{${tex(d)}}`, note: 'start' }];
  let q = [];
  r.steps.forEach((st, k) => {
    q = r.q.slice(0, k + 1);
    out.push({ tex: `\\text{quotient so far: } ${tex([...q, ...Array(Math.max(0, p.length - d.length - k)).fill(0)])},\\quad \\text{left: } ${tex(st.rem)}`, note: `divide the leading terms: ${st.c} x^${st.k}; multiply back, subtract` });
  });
  out.push({ tex: `${tex(p)}=(${tex(d)})(${tex(r.q)})+${tex(r.rem.length ? r.rem : [0])}`, note: 'dividend = divisor × quotient + remainder' });
  return out;
}

tool = createTool({
  state,
  label: 'The worked steps of polynomial long division, revealed one at a time, and a numeric check of the final identity.',
  dom: (el) => {
    view = stepsView(el);
    return { refresh: () => view.show(lines(state), Math.min(state.step, lines(state).length)) };
  },
  controls: [
    { title: 'Divide' },
    { key: 'i', label: 'Problem', options: PRE.map((q, k) => [k, `${k + 1}`]) },
    { key: 'step', label: 'Steps shown', min: 1, max: 5, step: 1 },
    { key: 'x', label: 'Check at x', min: -3, max: 4, step: 1 },
    { readout: [
      ['Problem', (s) => `(${tex(cur(s).p)}) ÷ (${tex(cur(s).d)})`],
      ['Dividend at x', (s) => String(evalP(cur(s).p, s.x))],
      ['Divisor × quotient + remainder', (s) => { const r = longDivision(cur(s).p, cur(s).d); return String(evalP(cur(s).d, s.x) * evalP(r.q, s.x) + evalP(r.rem, s.x)); }],
    ] },
  ],
  tex: (s) => { const r = longDivision(cur(s).p, cur(s).d); return `\\text{quotient } ${tex(r.q)},\\ \\text{remainder } ${tex(r.rem.length ? r.rem : [0])}`; },
  onChange: (s) => {
    s.step = Math.min(s.step, lines(s).length);
    tool?.ui.refresh();
  },
});
