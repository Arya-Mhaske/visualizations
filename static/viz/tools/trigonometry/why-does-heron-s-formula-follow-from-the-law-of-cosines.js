import { createStepper } from '../../lib/stepper.js';
import { liveFormula } from '../../lib/formula.js';
import { fixed } from '../../lib/format.js';
import { anglesOf, canClose, heron } from './_triangle-math.js';
import { triangleFigure } from './_tri-view.js';

const state = { a: 5, b: 7, c: 8 };
const n = (x, d = 2) => fixed(x, d);
const tri = (s) => (canClose(s.a, s.b, s.c) ? [{ ...anglesOf(s), a: s.a, b: s.b, c: s.c }] : []);

const figure = triangleFigure(document.querySelector('#stage'), () => tri(state), { label: 'A triangle with sides a, b and c' });

function steps(s) {
  if (!canClose(s.a, s.b, s.c)) return [{ text: 'Two sides must add to more than the third. These three sides cannot make a triangle.' }];
  const { a, b, c } = s;
  const cosC = (a * a + b * b - c * c) / (2 * a * b);
  const sinC = Math.sqrt(1 - cosC * cosC);
  const sp = (a + b + c) / 2;
  const inner = 4 * a * a * b * b - (a * a + b * b - c * c) ** 2;
  return [
    { text: 'The law of cosines gives cos C from the three sides:', tex: `\\cos C=\\dfrac{a^2+b^2-c^2}{2ab}=\\dfrac{${a * a}+${b * b}-${c * c}}{${2 * a * b}}=${n(cosC, 4)}` },
    { text: 'Then sin C follows from sin²C + cos²C = 1 (it is positive for an angle in a triangle):', tex: `\\sin C=\\sqrt{1-\\cos^2 C}=${n(sinC, 4)}` },
    { text: 'Put it into the area formula ½ab sin C:', tex: `\\text{Area}=\\tfrac12 ab\\sin C=\\tfrac12(${a})(${b})(${n(sinC, 4)})=${n(0.5 * a * b * sinC, 3)}` },
    { text: 'Now do the algebra with cos C kept as a fraction. The square root collapses to:', tex: `\\tfrac12 ab\\sqrt{1-\\cos^2C}=\\tfrac14\\sqrt{4a^2b^2-(a^2+b^2-c^2)^2}=\\tfrac14\\sqrt{${n(inner, 0)}}` },
    { text: 'The inside is a difference of squares, so it factors into four simple pieces:', tex: `4a^2b^2-(a^2+b^2-c^2)^2=(a+b+c)(a+b-c)(a-b+c)(-a+b+c)=${n(a + b + c, 0)}\\cdot${n(a + b - c, 0)}\\cdot${n(a - b + c, 0)}\\cdot${n(-a + b + c, 0)}` },
    { text: 'With the semi-perimeter s = (a + b + c) ÷ 2, each piece is 2s, 2(s − c), 2(s − b), 2(s − a). The 16 cancels with the ¼ squared:', tex: `\\text{Area}=\\sqrt{s(s-a)(s-b)(s-c)}=\\sqrt{${n(sp)}\\cdot${n(sp - a)}\\cdot${n(sp - b)}\\cdot${n(sp - c)}}=${n(heron(a, b, c), 3)}` },
  ];
}

const formula = liveFormula(document.querySelector('#formula'), (s) => (canClose(s.a, s.b, s.c)
  ? `\\sqrt{s(s-a)(s-b)(s-c)}=${n(heron(s.a, s.b, s.c), 3)}\\ \\text{and}\\ \\tfrac12 ab\\sin C=${n(0.5 * s.a * s.b * Math.sqrt(1 - ((s.a * s.a + s.b * s.b - s.c * s.c) / (2 * s.a * s.b)) ** 2), 3)}`
  : '\\text{no triangle}'));
formula.update(state);

createStepper({
  stage: document.querySelector('#stage'),
  panel: document.querySelector('#panel'),
  state,
  steps,
  controls: [
    { title: 'Choose the three sides' },
    { key: 'a', label: 'Side a', min: 2, max: 10, step: 1 },
    { key: 'b', label: 'Side b', min: 2, max: 10, step: 1 },
    { key: 'c', label: 'Side c', min: 2, max: 10, step: 1 },
    { readout: [
      ['Semi-perimeter, s', (s) => n((s.a + s.b + s.c) / 2)],
      ['Heron area', (s) => (canClose(s.a, s.b, s.c) ? n(heron(s.a, s.b, s.c), 3) : '—')],
    ] },
  ],
  onChange(s) {
    formula.update(s);
    figure.invalidate();
  },
});
