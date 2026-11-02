import { createStepper } from '../../lib/stepper.js';
import { liveFormula } from '../../lib/formula.js';
import { dot, label } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { arrowW, drawGrid, eqFrame, planeFigure } from './_kit.js';
import { cdiv, cmul, toPolar, toRect } from './_polar-math.js';

const state = { op: 'mul', a: 2, b: 3, c: 1, d: -2 };
const n = (x, k = 2) => fixed(x, k);
const Z = (s) => [s.a, s.b];
const W = (s) => [s.c, s.d];
const result = (s) => (s.op === 'mul' ? cmul(Z(s), W(s)) : cdiv(Z(s), W(s)));
const tex = (z, k = 2) => `${n(z[0], k)}${z[1] < 0 ? '-' : '+'}${n(Math.abs(z[1]), k)}i`;
const bad = (s) => s.op === 'div' && s.c === 0 && s.d === 0;

const figure = planeFigure(document.querySelector('#stage'), {
  label: 'The complex plane with z in coral, w in blue and the answer in green',
  draw(ctx, stage, c) {
    const f = eqFrame(stage, [-12, 12], [-12, 12], 6);
    drawGrid(ctx, f, c, stage, { step: 4, labels: false });
    if (bad(state)) { label(ctx, 'Cannot divide by zero', stage.w / 2, stage.h / 2, c, { size: 12, color: c.a, bounds: stage }); return; }
    const r = result(state);
    [[Z(state), c.a], [W(state), c.b], [r, c.c]].forEach(([q, col]) => {
      arrowW(ctx, f, [0, 0], q, { color: col, width: col === c.c ? 5 : 3, head: 9 });
      dot(ctx, ...f.px(q), 6, col, c.ink, 2);
    });
  },
});

function steps(s) {
  if (bad(s)) return [{ text: 'Division by 0 + 0i is not defined. Change c or d.' }];
  const [a, b, c, d] = [s.a, s.b, s.c, s.d];
  const p1 = toPolar([a, b]);
  const p2 = toPolar([c, d]);
  const R = result(s);
  const pr = toPolar(R);
  const rectBack = toRect(s.op === 'mul' ? p1.r * p2.r : p1.r / p2.r, s.op === 'mul' ? p1.thD + p2.thD : p1.thD - p2.thD);
  const out = [];
  if (s.op === 'mul') {
    out.push({ text: 'Rectangular: multiply out like brackets, then use i² = −1:', tex: `(${a}${b < 0 ? '' : '+'}${b}i)(${c}${d < 0 ? '' : '+'}${d}i)=(${a * c}-${b * d})+(${a * d}+${b * c})i=${tex(R)}` });
  } else {
    out.push({ text: 'Rectangular: multiply top and bottom by the conjugate of the bottom, so the bottom becomes real:', tex: `\\dfrac{${a}${b < 0 ? '' : '+'}${b}i}{${c}${d < 0 ? '' : '+'}${d}i}=\\dfrac{(${a}${b < 0 ? '' : '+'}${b}i)(${c}${-d < 0 ? '' : '+'}${-d}i)}{${c * c + d * d}}=${tex(R)}` });
  }
  out.push({ text: 'Polar: first write each number as length and angle:', tex: `z=${n(p1.r)}\\angle ${n(p1.thD, 1)}^\\circ,\\quad w=${n(p2.r)}\\angle ${n(p2.thD, 1)}^\\circ` });
  out.push(s.op === 'mul'
    ? { text: 'Lengths multiply and angles add:', tex: `zw=${n(p1.r)}\\cdot${n(p2.r)}\\angle(${n(p1.thD, 1)}^\\circ+${n(p2.thD, 1)}^\\circ)=${n(p1.r * p2.r)}\\angle ${n(p1.thD + p2.thD, 1)}^\\circ` }
    : { text: 'Lengths divide and angles subtract:', tex: `\\dfrac zw=\\dfrac{${n(p1.r)}}{${n(p2.r)}}\\angle(${n(p1.thD, 1)}^\\circ-${n(p2.thD, 1)}^\\circ)=${n(p1.r / p2.r)}\\angle ${n(p1.thD - p2.thD, 1)}^\\circ` });
  out.push({ text: 'Convert back to rectangular form:', tex: `${n(rectBack[0])}${rectBack[1] < 0 ? '-' : '+'}${n(Math.abs(rectBack[1]))}i` });
  out.push({ text: `Both methods give the same answer: length ${n(pr.r)}, angle ${n(pr.thD, 1)}°. Polar is shorter for products, quotients and powers. Rectangular is better for sums.` });
  return out;
}

const formula = liveFormula(document.querySelector('#formula'), (s) => (bad(s) ? '\\text{undefined}' : `${s.op === 'mul' ? 'zw' : '\\dfrac zw'}=${tex(result(s))}`));
formula.update(state);

createStepper({
  stage: document.querySelector('#stage'),
  panel: document.querySelector('#panel'),
  state,
  steps,
  controls: [
    { title: 'z = a + bi, w = c + di' },
    { key: 'op', label: 'Operation', options: [['mul', 'z × w'], ['div', 'z ÷ w']] },
    { key: 'a', label: 'a', min: -5, max: 5, step: 1 },
    { key: 'b', label: 'b', min: -5, max: 5, step: 1 },
    { key: 'c', label: 'c', min: -5, max: 5, step: 1 },
    { key: 'd', label: 'd', min: -5, max: 5, step: 1 },
    { readout: [
      ['Answer', (s) => (bad(s) ? 'undefined' : `${n(result(s)[0])} ${result(s)[1] < 0 ? '−' : '+'} ${n(Math.abs(result(s)[1]))}i`)],
      ['In polar form', (s) => (bad(s) ? '—' : `${n(toPolar(result(s)).r)} ∠ ${n(toPolar(result(s)).thD, 1)}°`)],
    ] },
  ],
  onChange(s) {
    formula.update(s);
    figure.invalidate();
  },
});
