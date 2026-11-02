import { createStepper } from '../../lib/stepper.js';
import { liveFormula } from '../../lib/formula.js';
import { dot } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { BASIC, rad, solveBasic } from './_inverses-math.js';
import { graphFigure } from './_kit.js';

const state = { fn: 'sin', p: 2, q: 1, r: 2 };
const value = (s) => (s.r - s.q) / s.p;
const n = (x) => fixed(x, 1);
const lhs = (s) => `${s.p === 1 ? '' : s.p}\\${s.fn}\\,x${s.q === 0 ? '' : s.q > 0 ? `+${s.q}` : `${s.q}`}=${s.r}`;
const QUADS = {
  sin: ['positive in quadrants I and II', 'negative in quadrants III and IV'],
  cos: ['positive in quadrants I and IV', 'negative in quadrants II and III'],
  tan: ['positive in quadrants I and III', 'negative in quadrants II and IV'],
};

const figure = graphFigure(document.querySelector('#stage'), {
  label: 'The graph of the chosen function from 0 to 360 degrees, a horizontal line at the value it must equal, and a dot at each solution',
  y: [-2, 2],
  draw(ctx, stage, c, plot) {
    const tall = state.fn === 'tan' ? 4 : 1.5;
    plot.setRange([0, 360], [-tall, tall]);
    plot.axes({ xLabel: 'x (°)', yLabel: 'y' });
    plot.fn((x) => BASIC[state.fn](rad(x)), { color: c.b, width: 4 });
    const k = value(state);
    plot.segment(0, k, 360, k, { color: c.a, width: 3 });
    for (const x of solveBasic(state.fn, k).sols) dot(ctx, ...plot.toPx(x, k), 8, c.a, c.ink);
  },
});

function steps(s) {
  const k = value(s);
  const sol = solveBasic(s.fn, k);
  const out = [{ text: 'Get the function on its own:', tex: `${lhs(s)}\\ \\Rightarrow\\ \\${s.fn}\\,x=\\dfrac{${s.r}${s.q < 0 ? `+${-s.q}` : s.q > 0 ? `-${s.q}` : ''}}{${s.p}}=${fixed(k, 3)}` }];
  if (!sol.ok) {
    out.push({ text: `${s.fn} x can only be between −1 and 1, so there is no solution.` });
    return out;
  }
  out.push({ text: 'Ignore the sign and find the reference angle:', tex: `\\alpha=\\${s.fn}^{-1}\\left|${fixed(k, 3)}\\right|=${n(sol.ref)}^\\circ` });
  out.push({ text: `The sign of ${s.fn} x decides the quadrants: ${s.fn} is ${k >= 0 ? QUADS[s.fn][0] : QUADS[s.fn][1]}. Here the value is ${k >= 0 ? 'positive' : 'negative'}.` });
  out.push({ text: 'Use α in those quadrants, for 0° to 360°:', tex: `x=${sol.sols.map((v) => `${n(v)}^\\circ`).join(',\\ ')}` });
  out.push({ text: 'Every full turn gives the same values again, so the general solution is:', tex: `x=${sol.general.join('\\ \\text{or}\\ ')},\\quad k\\in\\mathbb Z` });
  return out;
}

const formula = liveFormula(document.querySelector('#formula'), (s) => {
  const sol = solveBasic(s.fn, value(s));
  return sol.ok ? `${lhs(s)}\\ \\Rightarrow\\ x=${sol.sols.map((v) => `${n(v)}^\\circ`).join(',\\ ')}\\ (0^\\circ\\le x<360^\\circ)` : `${lhs(s)}\\ \\Rightarrow\\ \\text{no solution}`;
});
formula.update(state);

createStepper({
  stage: document.querySelector('#stage'),
  panel: document.querySelector('#panel'),
  state,
  steps,
  controls: [
    { title: 'p · f(x) + q = r' },
    { key: 'fn', label: 'Function', options: [['sin', 'sin'], ['cos', 'cos'], ['tan', 'tan']] },
    { key: 'p', label: 'p', min: 1, max: 5, step: 1 },
    { key: 'q', label: 'q', min: -3, max: 3, step: 1 },
    { key: 'r', label: 'r', min: -3, max: 5, step: 1 },
    { readout: [
      ['f(x) must equal', (s) => fixed(value(s), 3)],
      ['Solutions in 0° to 360°', (s) => { const sol = solveBasic(s.fn, value(s)); return sol.ok ? sol.sols.map(n).join('°, ') + '°' : 'none'; }],
    ] },
  ],
  onChange(s) {
    formula.update(s);
    figure.invalidate();
  },
});
