import { createStepper } from '../../lib/stepper.js';
import { liveFormula } from '../../lib/formula.js';
import { fixed, gcd } from '../../lib/format.js';
import { divisors, evalP, showP, synth } from './_polynomial-math.js';
import { graphFigure } from '../numbers-algebra/_quadratic-equations-view.js';

const POLYS = [[1, -2, -5, 6], [2, -3, -11, 6], [1, 0, -5, 0, 4], [1, 0, 0, 0, -16]];
const state = { which: 0 };
const P = (s = state) => POLYS[s.which];
const tex = (c) => showP(c);

// Try candidates ±p/q in order; return the first that is an exact rational root
function firstRoot(c) {
  const [lead, constant] = [c[0], c[c.length - 1]];
  const cand = [];
  for (const p of divisors(constant)) for (const q of divisors(lead)) { const g = gcd(p, q); if (g === 1) cand.push([p, q], [-p, q]); }
  cand.sort((a, b) => Math.abs(a[0] / a[1]) - Math.abs(b[0] / b[1]));
  const n = c.length - 1;
  return cand.find(([p, q]) => c.reduce((s, k, i) => s + k * p ** (n - i) * q ** i, 0) === 0) || null;
}

function plan(c0) {
  const steps = [];
  let c = c0;
  const roots = [];
  steps.push({ text: 'List the possible rational roots: p divides the constant term, q divides the leading coefficient.', tex: `\\pm\\dfrac pq,\\ p\\mid ${Math.abs(c0.at(-1))},\\ q\\mid ${Math.abs(c0[0])}` });
  while (c.length > 3) {
    const r = firstRoot(c);
    if (!r) { steps.push({ text: 'No candidate works, so there is no rational root here. Stop and use the graph or a numerical method.', tex: tex(c) }); return { steps, roots, rest: c }; }
    const root = r[0] / r[1];
    if (r[1] !== 1) { steps.push({ text: `x = ${r[0]}/${r[1]} is a root; the factor is (${r[1]}x − ${r[0]}).`, tex: `P(${r[0]}/${r[1]})=0` }); roots.push(root); c = synth(c, root).q.map((k) => Math.round(k / r[1])); continue; }
    const d = synth(c, root);
    steps.push({ text: `Test x = ${root} by synthetic division: the remainder is 0, so (x − ${root}) is a factor.`, tex: `${d.row.join('\\quad ')}` });
    roots.push(root);
    c = d.q;
  }
  steps.push({ text: 'What is left is a quadratic. Finish with the quadratic formula.', tex: `${tex(c)}=0` });
  const [a, b, cc] = c.length === 3 ? c : [0, 0, 0];
  const disc = b * b - 4 * a * cc;
  steps.push({ text: disc >= 0 ? 'Its roots are real.' : 'The discriminant is negative, so the roots are a complex pair.', tex: `x=\\dfrac{${-b}\\pm\\sqrt{${disc}}}{${2 * a}}` });
  if (c.length === 3) roots.push(...(disc >= 0 ? [(-b - Math.sqrt(disc)) / (2 * a), (-b + Math.sqrt(disc)) / (2 * a)] : []));
  return { steps, roots, rest: c, disc };
}

const stageEl = document.querySelector('#stage');
stageEl.setAttribute('role', 'group');
stageEl.setAttribute('aria-label', 'The graph of the polynomial with its real zeros, followed by the steps that find every zero');
const figure = graphFigure(stageEl, 'The graph of the polynomial with its real zeros', [-5, 5], [-20, 20], (ctx, plot, c) => {
  plot.fn((x) => evalP(P(), x), { color: c.a, width: 3 });
  plan(P()).roots.forEach((r) => plot.point(r, 0, { fill: c.c, r: 7 }));
});
const formula = liveFormula(document.querySelector('#formula'), (s) => `P(x)=${tex(P(s))}`);
formula.update(state);
createStepper({
  stage: stageEl,
  panel: document.querySelector('#panel'),
  state,
  steps: (s) => plan(P(s)).steps,
  controls: [
    { title: 'Choose a polynomial' },
    { key: 'which', label: 'Polynomial', min: 0, max: POLYS.length - 1, step: 1, format: (v) => tex(POLYS[v]) },
    { readout: [['Real zeros found', (s) => plan(P(s)).roots.map((r) => fixed(r, 3)).join(', ') || 'none']] },
  ],
  onChange(s) { formula.update(s); figure.invalidate(); },
});
