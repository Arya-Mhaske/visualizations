import { createStepper } from '../../lib/stepper.js';
import { liveFormula } from '../../lib/formula.js';
import { fixed } from '../../lib/format.js';
import { inForm } from './_quadratic-equations-math.js';
import { graphFigure } from './_quadratic-equations-view.js';

const state = { p: -5, q: 4 };
const sg = (n) => (n < 0 ? `-${Math.abs(n)}` : `+${n}`);
const f = (n) => fixed(n, 3);

const stageEl = document.querySelector('#stage');
stageEl.setAttribute('role', 'group');
stageEl.setAttribute('aria-label', 'The graph of the quartic with its real roots marked, followed by the substitution u equals x squared and the worked steps');
const figure = graphFigure(stageEl, 'The graph of x to the fourth plus p x squared plus q, with its real roots', [-4, 4], [-12, 12], (ctx, plot, c) => {
  plot.fn((x) => x ** 4 + state.p * x * x + state.q, { color: c.a, width: 3 });
  inForm(state.p, state.q).xs.forEach((x) => plot.point(x, 0, { fill: c.c, r: 7 }));
});

function steps(s) {
  const r = inForm(s.p, s.q);
  const out = [
    { text: 'x⁴ is (x²)². Let u = x² and the equation is an ordinary quadratic in u:', tex: `u^2${sg(s.p)}u${sg(s.q)}=0` },
    { text: 'Solve for u:', tex: r.d < 0 ? `u=\\dfrac{${-s.p}\\pm\\sqrt{${r.d}}}{2}\\ \\text{(complex)}` : `u=${r.us.map(f).join('\\ \\text{ or }\\ ')}` },
  ];
  if (r.us.length) {
    out.push({ text: 'Now put x² back in place of u. A positive u gives two real x (±√u), and a negative u gives none:', tex: r.us.map((u) => `x^2=${f(u)}${u > 0 ? `\\Rightarrow x=\\pm${f(Math.sqrt(u))}` : u === 0 ? '\\Rightarrow x=0' : `\\Rightarrow x=\\pm${f(Math.sqrt(-u))}\\,i`}`).join(',\\ ') });
  }
  out.push({ text: `Real roots: ${r.xs.length ? r.xs.map(f).join(', ') : 'none'}. Each is a place the graph meets the axis.`, tex: `x\\in\\{${r.xs.map(f).join(',\\ ')}\\}` });
  return out;
}

const formula = liveFormula(document.querySelector('#formula'), (s) => `x^4${sg(s.p)}x^2${sg(s.q)}=0\\ \\Rightarrow\\ u^2${sg(s.p)}u${sg(s.q)}=0,\\ u=x^2`);
formula.update(state);

createStepper({
  stage: stageEl,
  panel: document.querySelector('#panel'),
  state,
  steps,
  controls: [
    { title: 'x⁴ + p x² + q = 0' },
    { key: 'p', label: 'p', min: -10, max: 6, step: 1 },
    { key: 'q', label: 'q', min: -10, max: 12, step: 1 },
    { readout: [
      ['u values', (s) => inForm(s.p, s.q).us.map(f).join(', ') || 'complex'],
      ['Real x values', (s) => inForm(s.p, s.q).xs.map(f).join(', ') || 'none'],
    ] },
  ],
  onChange(s) {
    formula.update(s);
    figure.invalidate();
  },
});
