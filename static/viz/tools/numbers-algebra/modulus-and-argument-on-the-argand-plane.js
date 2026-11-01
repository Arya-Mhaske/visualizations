import { createStepper } from '../../lib/stepper.js';
import { liveFormula } from '../../lib/formula.js';
import { arc, label } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { polarForm, texComplex } from './_complex-numbers-math.js';
import { planeFigure } from './_complex-numbers-view.js';

const state = { a: -3, b: 4 };
const z = (s = state) => [s.a, s.b];
const n = (x) => fixed(x, 2);

const stageEl = document.querySelector('#stage');
stageEl.setAttribute('role', 'group');
stageEl.setAttribute('aria-label', 'The complex plane with an arrow from zero to z, its length r and its angle theta, followed by the worked steps');
const figure = planeFigure(stageEl, 'The complex plane with an arrow to z, marked with its length r and angle theta', 6, (ctx, plot, c) => {
  const { r, theta } = polarForm(z());
  plot.segment(state.a, state.b, state.a, 0, { color: c.grid, width: 2, dash: [5, 4] });
  plot.segment(0, 0, state.a, state.b, { color: c.a, width: 5 });
  if (r > 0) {
    const O = plot.toPx(0, 0);
    const k = Math.abs(plot.toPx(1, 0)[0] - O[0]);
    arc(ctx, ...O, Math.min(k * 1.2, k * r * 0.6), -(theta * Math.PI) / 180, 0, { color: c.b, width: 4 });
  }
  plot.point(state.a, state.b, { fill: c.a, r: 9 });
  plot.text('r', state.a / 2 - 0.5, state.b / 2 + 0.6, { size: 13, color: c.a, patch: false });
  plot.text('θ', Math.cos(((theta / 2) * Math.PI) / 180) * 1.7, Math.sin(((theta / 2) * Math.PI) / 180) * 1.7, { size: 13, color: c.b, patch: false });
});

function steps(s) {
  const { r, theta } = polarForm(z(s));
  const quadrant = s.a >= 0 && s.b >= 0 ? 1 : s.a < 0 && s.b >= 0 ? 2 : s.a < 0 ? 3 : 4;
  const raw = (Math.atan(s.b / s.a) * 180) / Math.PI;
  return [
    { text: 'The length is Pythagoras on the real and imaginary parts:', tex: `r=\\sqrt{a^2+b^2}=\\sqrt{(${s.a})^2+(${s.b})^2}=${n(r)}` },
    s.a === 0
      ? { text: 'On the imaginary axis the angle is a right angle.', tex: `\\theta=${s.b > 0 ? '90' : '270'}^\\circ` }
      : { text: `The calculator gives tan⁻¹(b/a) = ${n(raw)}°. That only reaches quadrants 1 and 4, and z is in quadrant ${quadrant}.`, tex: `\\tan^{-1}\\dfrac{b}{a}=\\tan^{-1}\\dfrac{${s.b}}{${s.a}}=${n(raw)}^\\circ` },
    { text: 'Use the quadrant to get the true angle, from the positive real axis:', tex: `\\theta=${n(theta)}^\\circ` },
    { text: 'Polar form:', tex: `z=r(\\cos\\theta+i\\sin\\theta)=${n(r)}(\\cos ${n(theta)}^\\circ+i\\sin ${n(theta)}^\\circ)` },
    { text: 'Check by rebuilding a and b:', tex: `r\\cos\\theta=${n(r * Math.cos((theta * Math.PI) / 180))},\\ r\\sin\\theta=${n(r * Math.sin((theta * Math.PI) / 180))}` },
  ];
}

const formula = liveFormula(document.querySelector('#formula'), (s) => `|${texComplex(z(s))}|=${n(polarForm(z(s)).r)},\\quad \\arg=${n(polarForm(z(s)).theta)}^\\circ`);
formula.update(state);

createStepper({
  stage: stageEl,
  panel: document.querySelector('#panel'),
  state,
  steps,
  controls: [
    { title: 'Choose z = a + bi' },
    { key: 'a', label: 'a (real part)', min: -5, max: 5, step: 1 },
    { key: 'b', label: 'b (imaginary part)', min: -5, max: 5, step: 1 },
    { readout: [
      ['Modulus r', (s) => n(polarForm(z(s)).r)],
      ['Argument θ', (s) => (s.a === 0 && s.b === 0 ? 'undefined' : `${n(polarForm(z(s)).theta)}°`)],
    ] },
  ],
  onChange(s) {
    formula.update(s);
    figure.invalidate();
  },
});
