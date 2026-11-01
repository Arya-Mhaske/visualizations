import { createStepper } from '../../lib/stepper.js';
import { liveFormula } from '../../lib/formula.js';
import { fixed } from '../../lib/format.js';
import { ellipsePoint } from './_conics-math.js';
import { curve, equalFigure, trace } from './_conics-view.js';

// (x − h)² / p² + (y − k)² / q² = 1; the larger of p and q is the semi-major axis
const state = { h: 1, k: -1, p: 5, q: 3 };
const n = (v) => fixed(v, 2);
const br = (letter, v) => (v === 0 ? letter : `(${letter}${v < 0 ? '+' : '-'}${Math.abs(v)})`);
function geo(s = state) {
  const horizontal = s.p >= s.q;
  const a = Math.max(s.p, s.q);
  const b = Math.min(s.p, s.q);
  const c = Math.sqrt(a * a - b * b);
  const u = horizontal ? [1, 0] : [0, 1];
  const v = horizontal ? [0, 1] : [1, 0];
  const at = (k1, k2) => [s.h + k1 * u[0] + k2 * v[0], s.k + k1 * u[1] + k2 * v[1]];
  return { horizontal, a, b, c, centre: [s.h, s.k], vertices: [at(-a, 0), at(a, 0)], co: [at(0, -b), at(0, b)], foci: [at(-c, 0), at(c, 0)] };
}
const pt = (p) => `(${n(p[0])}, ${n(p[1])})`;

const stageEl = document.querySelector('#stage');
stageEl.setAttribute('role', 'group');
stageEl.setAttribute('aria-label', 'The ellipse with its centre, vertices, co-vertices and foci marked, followed by the worked reading of the equation');
const figure = equalFigure(stageEl, 'The ellipse with centre, vertices and foci', 7, (ctx, plot, c) => {
  const g = geo();
  curve(plot, trace((t) => {
    const e = ellipsePoint(g.a, g.b, t);
    return g.horizontal ? [state.h + e[0], state.k + e[1]] : [state.h + e[1], state.k + e[0]];
  }, 0, Math.PI * 2, 200), { color: c.a, width: 4 });
  g.vertices.forEach((p) => plot.point(p[0], p[1], { fill: c.fillY, r: 6 }));
  g.co.forEach((p) => plot.point(p[0], p[1], { fill: c.fillB, r: 5 }));
  g.foci.forEach((p) => plot.point(p[0], p[1], { fill: c.c, r: 7 }));
  plot.point(g.centre[0], g.centre[1], { fill: c.ink, r: 4 });
}, [0, 0]);

function steps(s) {
  const g = geo(s);
  return [
    { text: 'The centre is where each bracket is zero.', tex: `C=(${s.h},\\ ${s.k})` },
    { text: `The larger denominator is a², so a = ${n(g.a)}. It sits under ${g.horizontal ? 'x: the major axis is horizontal' : 'y: the major axis is vertical'}. The other gives b = ${n(g.b)}.`, tex: `a=\\sqrt{${g.a * g.a}}=${n(g.a)},\\ b=\\sqrt{${g.b * g.b}}=${n(g.b)}` },
    { text: `Vertices are a from the centre along the major axis; co-vertices are b along the minor axis.`, tex: `\\text{vertices }${pt(g.vertices[0])},\\ ${pt(g.vertices[1])}` },
    { text: 'The focal distance comes from c² = a² − b².', tex: `c=\\sqrt{${g.a * g.a}-${g.b * g.b}}=${n(g.c)}` },
    { text: `The foci are c from the centre along the major axis.`, tex: `F=${pt(g.foci[0])}\\ \\text{and}\\ ${pt(g.foci[1])}` },
  ];
}

const formula = liveFormula(document.querySelector('#formula'), (s) => `\\dfrac{${br('x', s.h)}^2}{${s.p * s.p}}+\\dfrac{${br('y', s.k)}^2}{${s.q * s.q}}=1`.replace(/\(x-(-?\d)\)/, '(x-$1)'));
formula.update(state);

createStepper({
  stage: stageEl,
  panel: document.querySelector('#panel'),
  state,
  steps,
  controls: [
    { title: 'Choose an ellipse' },
    { key: 'h', label: 'Centre x, h', min: -3, max: 3, step: 1 },
    { key: 'k', label: 'Centre y, k', min: -3, max: 3, step: 1 },
    { key: 'p', label: 'Under x: root of the denominator', min: 1, max: 5, step: 1 },
    { key: 'q', label: 'Under y: root of the denominator', min: 1, max: 5, step: 1 },
    { readout: [
      ['a, b, c', (s) => `${n(geo(s).a)}, ${n(geo(s).b)}, ${n(geo(s).c)}`],
      ['Foci', (s) => `${pt(geo(s).foci[0])}, ${pt(geo(s).foci[1])}`],
    ] },
  ],
  onChange(s) { formula.update(s); figure.invalidate(); },
});
