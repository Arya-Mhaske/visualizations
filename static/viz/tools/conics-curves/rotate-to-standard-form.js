import { createStepper } from '../../lib/stepper.js';
import { liveFormula } from '../../lib/formula.js';
import { fixed } from '../../lib/format.js';
import { contour } from '../vectors-3d/_quadric-surfaces-math.js';
import { removeAngle, rotateConic } from './_rotation-math.js';
import { conicValue } from './_conics-math.js';
import { equalFigure } from './_conics-view.js';

// A x² + B xy + C y² = −F  (no x or y term), rotated until B′ = 0
const state = { A: 5, B: -6, C: 5, F: -8 };
const n = (v) => fixed(v, 3);
const q = (s = state) => ({ A: s.A, B: s.B, C: s.C, D: 0, E: 0, F: s.F });
const rad = (d) => (d * Math.PI) / 180;
const sg = (v) => (v < 0 ? `-${Math.abs(v)}` : `+${v}`);

const stageEl = document.querySelector('#stage');
stageEl.setAttribute('role', 'group');
stageEl.setAttribute('aria-label', 'The conic with the original axes and the rotated axes that remove the xy term, followed by the worked steps');
const figure = equalFigure(stageEl, 'The conic with the turned axes through its centre', 6, (ctx, plot, c) => {
  contour((x, y) => conicValue(q(), x, y), -9, 9, 160).forEach(([p, r]) => plot.segment(p[0], p[1], r[0], r[1], { color: c.a, width: 4 }));
  const th = removeAngle(q());
  const d = [Math.cos(rad(th)), Math.sin(rad(th))];
  plot.segment(-d[0] * 12, -d[1] * 12, d[0] * 12, d[1] * 12, { color: c.c, width: 3, dash: [6, 5] });
  plot.segment(d[1] * 12, -d[0] * 12, -d[1] * 12, d[0] * 12, { color: c.c, width: 3, dash: [6, 5] });
}, [0, 0]);

function steps(s) {
  if (s.B === 0) return [{ text: 'There is no xy term, so the axes are already in the right place. Read the type off the signs of A and C.', tex: `${s.A}x^2${sg(s.C)}y^2=${-s.F}` }];
  const th = removeAngle(q(s));
  const r = rotateConic(q(s), th);
  const rhs = -s.F;
  return [
    { text: 'The xy term needs a rotation. The angle comes from cot 2θ = (A − C)/B.', tex: `\\cot 2\\theta=\\dfrac{${s.A}-${s.C < 0 ? `(${s.C})` : s.C}}{${s.B < 0 ? `(${s.B})` : s.B}}=${n((s.A - s.C) / s.B)}\\ \\Rightarrow\\ \\theta=${n(th)}^\\circ` },
    { text: 'Substitute x = x′cos θ − y′sin θ and y = x′sin θ + y′cos θ. The new coefficients are:', tex: `A'=A\\cos^2\\theta+B\\sin\\theta\\cos\\theta+C\\sin^2\\theta=${n(r.A)}` },
    { text: 'And for the y′² term. The cross term B′ comes out as zero, because θ was chosen to make it so.', tex: `C'=A\\sin^2\\theta-B\\sin\\theta\\cos\\theta+C\\cos^2\\theta=${n(r.C)},\\ B'=${Math.abs(r.B) < 1e-9 ? '0' : n(r.B)}` },
    { text: 'The rotated equation has no xy term:', tex: `${n(r.A)}x'^2${r.C < 0 ? '-' : '+'}${n(Math.abs(r.C))}y'^2=${rhs}` },
    rhs !== 0 && r.A * rhs > 0 && r.C * rhs > 0
      ? { text: 'Divide by the right side to reach standard form. This is an ellipse.', tex: `\\dfrac{x'^2}{${n(rhs / r.A)}}+\\dfrac{y'^2}{${n(rhs / r.C)}}=1` }
      : { text: 'Compare the signs of A′ and C′ and the right side to read the type. The check B² − 4AC is unchanged.', tex: `B^2-4AC=${s.B * s.B - 4 * s.A * s.C}` },
  ];
}

const formula = liveFormula(document.querySelector('#formula'), (s) => `${s.A}x^2${s.B < 0 ? '-' : '+'}${Math.abs(s.B)}xy${sg(s.C)}y^2${sg(s.F)}=0`);
formula.update(state);

createStepper({
  stage: stageEl,
  panel: document.querySelector('#panel'),
  state,
  steps,
  controls: [
    { title: 'Choose a conic' },
    { key: 'A', label: 'A', min: -6, max: 6, step: 1 },
    { key: 'B', label: 'B', min: -8, max: 8, step: 1 },
    { key: 'C', label: 'C', min: -6, max: 6, step: 1 },
    { key: 'F', label: 'F', min: -12, max: 12, step: 1 },
    { readout: [
      ['Angle to remove xy', (s) => (s.B === 0 ? 'none needed' : `${n(removeAngle(q(s)))}°`)],
      ['A′, C′', (s) => { const r = rotateConic(q(s), removeAngle(q(s))); return `${n(r.A)}, ${n(r.C)}`; }],
    ] },
  ],
  onChange(s) { formula.update(s); figure.invalidate(); },
});
