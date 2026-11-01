import { createStepper } from '../../lib/stepper.js';
import { liveFormula } from '../../lib/formula.js';
import { fixed } from '../../lib/format.js';
import { graphFigure } from '../numbers-algebra/_quadratic-equations-view.js';

// f(x) = a (x − n1)(x − n2) / ((x − d1)(x − d2)); degrees are equal, so the horizontal asymptote is y = a
const state = { a: 2, n1: -1, n2: 3, d1: -2, d2: 2 };
const f = (s, x) => (s.a * (x - s.n1) * (x - s.n2)) / ((x - s.d1) * (x - s.d2));
const list = (xs) => (xs.length ? xs.join(', ') : 'none');
function analyse(s) {
  const num = [s.n1, s.n2];
  const den = [s.d1, s.d2];
  const holes = [...new Set(den)].filter((d) => num.filter((v) => v === d).length >= den.filter((v) => v === d).length);
  const walls = [...new Set(den)].filter((d) => !holes.includes(d));
  const zeros = [...new Set(num)].filter((v) => !den.includes(v));
  const crit = [...new Set([...zeros, ...walls])].sort((a, b) => a - b);
  const pts = [-Infinity, ...crit, Infinity];
  const mids = pts.slice(0, -1).map((p, i) => (pts[i] === -Infinity ? crit[0] - 1 : pts[i + 1] === Infinity ? crit[crit.length - 1] + 1 : (p + pts[i + 1]) / 2));
  return { holes, walls, zeros, crit, regions: crit.length ? mids.map((m) => ({ m, sign: Math.sign(f(s, m)) })) : [{ m: 0, sign: Math.sign(f(s, 0)) }] };
}
const holeY = (s, x) => { const nn = [s.n1, s.n2]; const dd = [s.d1, s.d2]; nn.splice(nn.indexOf(x), 1); dd.splice(dd.indexOf(x), 1); return (s.a * nn.reduce((p, r) => p * (x - r), 1)) / dd.reduce((p, r) => p * (x - r), 1); };

const stageEl = document.querySelector('#stage');
stageEl.setAttribute('role', 'group');
stageEl.setAttribute('aria-label', 'The graph of the rational function with its walls, holes and horizontal asymptote, followed by the checklist that finds them');
const figure = graphFigure(stageEl, 'The graph of the rational function', [-8, 8], [-10, 10], (ctx, plot, c) => {
  const A = analyse(state);
  plot.segment(-8, state.a, 8, state.a, { color: c.b, width: 2, dash: [6, 5] });
  A.walls.forEach((w) => plot.segment(w, -10, w, 10, { color: c.b, width: 2, dash: [6, 5] }));
  plot.fn((x) => f(state, x), { color: c.a, width: 3 });
  A.holes.forEach((h) => plot.point(h, holeY(state, h), { fill: c.paper, r: 6 }));
  A.zeros.forEach((z) => plot.point(z, 0, { fill: c.c, r: 6 }));
});
const steps = (s) => {
  const A = analyse(s);
  return [
    { text: 'Domain: every x except where the bottom is 0.', tex: `x\\ne ${list([...new Set([s.d1, s.d2])])}` },
    { text: 'x-intercepts: where the top is 0, unless the same factor is also on the bottom.', tex: `x=${list(A.zeros)}` },
    { text: 'y-intercept: put x = 0.', tex: s.d1 * s.d2 === 0 ? 'f(0)\\ \\text{is undefined}' : `f(0)=${fixed(f(s, 0), 3)}` },
    { text: 'Holes are factors that cancel. Walls (vertical asymptotes) are bottom zeros that do not cancel.', tex: `\\text{holes: }${list(A.holes)};\\ \\text{walls: }x=${list(A.walls)}` },
    { text: 'Horizontal asymptote: the degrees are equal (2 and 2), so it is the ratio of the leading coefficients, a ÷ 1.', tex: `y=${s.a}` },
    { text: 'Sign chart: the sign can only change at the zeros and walls. Test one point in each region.', tex: A.regions.map((r) => (r.sign > 0 ? '+' : r.sign < 0 ? '-' : '0')).join('\\ \\ ') },
    { text: 'Sketch: start from the signs, hug the asymptotes, and pass through the intercepts.' },
  ];
};
const formula = liveFormula(document.querySelector('#formula'), (s) => `f(x)=\\dfrac{${s.a}(x${s.n1 < 0 ? '+' : '-'}${Math.abs(s.n1)})(x${s.n2 < 0 ? '+' : '-'}${Math.abs(s.n2)})}{(x${s.d1 < 0 ? '+' : '-'}${Math.abs(s.d1)})(x${s.d2 < 0 ? '+' : '-'}${Math.abs(s.d2)})}`);
formula.update(state);
createStepper({
  stage: stageEl,
  panel: document.querySelector('#panel'),
  state,
  steps,
  controls: [
    { title: 'Build the function' },
    { key: 'a', label: 'a', min: -3, max: 3, step: 1 },
    { key: 'n1', label: 'Top zero 1', min: -4, max: 4, step: 1 },
    { key: 'n2', label: 'Top zero 2', min: -4, max: 4, step: 1 },
    { key: 'd1', label: 'Bottom zero 1', min: -4, max: 4, step: 1 },
    { key: 'd2', label: 'Bottom zero 2', min: -4, max: 4, step: 1 },
    { readout: [['Walls', (s) => list(analyse(s).walls)], ['Holes', (s) => list(analyse(s).holes)], ['Horizontal asymptote', (s) => `y = ${s.a}`]] },
  ],
  onChange(s) { if (s.a === 0) s.a = 1; formula.update(s); figure.invalidate(); },
});
