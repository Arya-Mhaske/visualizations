import { createStepper } from '../../lib/stepper.js';
import { liveFormula } from '../../lib/formula.js';
import { poly } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { hyperbolaC } from './_conics-math.js';
import { curve, equalFigure, trace } from './_conics-view.js';

// (x − h)²/p² − (y − k)²/q² = 1  (opens left-right), or (y − k)²/q² − (x − h)²/p² = 1 (opens up-down)
const state = { dir: 'x', h: 1, k: 0, p: 3, q: 2 };
const n = (v) => fixed(v, 2);
const br = (letter, v) => (v === 0 ? letter : `(${letter}${v < 0 ? '+' : '-'}${Math.abs(v)})`);
function geo(s = state) {
  const horiz = s.dir === 'x';
  const a = horiz ? s.p : s.q;
  const b = horiz ? s.q : s.p;
  const c = hyperbolaC(a, b);
  const at = (u, v) => (horiz ? [s.h + u, s.k + v] : [s.h + v, s.k + u]);
  return { horiz, a, b, c, at, slope: horiz ? s.q / s.p : s.q / s.p };
}

const stageEl = document.querySelector('#stage');
stageEl.setAttribute('role', 'group');
stageEl.setAttribute('aria-label', 'The hyperbola with its box, asymptotes and branches, followed by the worked steps');
const figure = equalFigure(stageEl, 'The hyperbola with its box and asymptotes', 8, (ctx, plot, c) => {
  const g = geo();
  poly(ctx, [plot.toPx(...g.at(-g.a, -g.b)), plot.toPx(...g.at(g.a, -g.b)), plot.toPx(...g.at(g.a, g.b)), plot.toPx(...g.at(-g.a, g.b))], { fill: c.fillB, stroke: c.ink, width: 2, dash: [5, 4] });
  [-1, 1].forEach((s) => {
    const A = g.at(-12 * g.a, s * -12 * g.b);
    const B = g.at(12 * g.a, s * 12 * g.b);
    plot.segment(A[0], A[1], B[0], B[1], { color: c.b, width: 2, dash: [6, 5] });
    curve(plot, trace((t) => g.at(s * g.a * Math.cosh(t), g.b * Math.sinh(t)), -3, 3, 200), { color: c.a, width: 4 });
  });
  [-1, 1].forEach((s) => { const f = g.at(s * g.c, 0); plot.point(f[0], f[1], { fill: c.c, r: 6 }); const v = g.at(s * g.a, 0); plot.point(v[0], v[1], { fill: c.fillY, r: 6 }); });
}, [0, 0]);

function steps(s) {
  const g = geo(s);
  return [
    { text: `The minus sign sits between the terms, and the positive term is ${g.horiz ? 'x' : 'y'}, so the branches open ${g.horiz ? 'left and right' : 'up and down'}.`, tex: `\\text{centre }(${s.h},\\ ${s.k})` },
    { text: `a² is the denominator of the positive term, so a = ${s.dir === 'x' ? s.p : s.q}. The other gives b = ${g.b}.`, tex: `a=${g.a},\\ b=${g.b}` },
    { text: 'Draw the box: a to each side of the centre along the opening direction, b across. Its diagonals are the asymptotes.', tex: `${br('y', s.k)}=\\pm\\dfrac{${s.q}}{${s.p}}${br('x', s.h)}` },
    { text: 'The vertices touch the box. Draw each branch from a vertex, bending towards the asymptotes and never crossing them.', tex: `\\text{vertices at distance }a=${g.a}` },
    { text: 'The foci are c from the centre, where c² = a² + b² (the box diagonal).', tex: `c=\\sqrt{${g.a}^2+${g.b}^2}=${n(g.c)}` },
  ];
}

const formula = liveFormula(document.querySelector('#formula'), (s) => (s.dir === 'x'
  ? `\\dfrac{${br('x', s.h)}^2}{${s.p * s.p}}-\\dfrac{${br('y', s.k)}^2}{${s.q * s.q}}=1`
  : `\\dfrac{${br('y', s.k)}^2}{${s.q * s.q}}-\\dfrac{${br('x', s.h)}^2}{${s.p * s.p}}=1`));
formula.update(state);

createStepper({
  stage: stageEl,
  panel: document.querySelector('#panel'),
  state,
  steps,
  controls: [
    { title: 'Choose a hyperbola' },
    { key: 'dir', label: 'Positive term', options: [['x', 'x² (opens sideways)'], ['y', 'y² (opens up and down)']] },
    { key: 'h', label: 'Centre x, h', min: -3, max: 3, step: 1 },
    { key: 'k', label: 'Centre y, k', min: -3, max: 3, step: 1 },
    { key: 'p', label: 'Root under the x term', min: 1, max: 4, step: 1 },
    { key: 'q', label: 'Root under the y term', min: 1, max: 4, step: 1 },
    { readout: [
      ['a, b, c', (s) => `${geo(s).a}, ${geo(s).b}, ${n(geo(s).c)}`],
      ['Asymptote slopes', (s) => `±${n(s.q / s.p)}`],
    ] },
  ],
  onChange(s) { formula.update(s); figure.invalidate(); },
});
