import { createStepper } from '../../lib/stepper.js';
import { createStage } from '../../lib/stage.js';
import { readColors } from '../../lib/colors.js';
import { liveFormula } from '../../lib/formula.js';
import { arc, label, line, poly } from '../../lib/draw.js';
import { sig } from '../../lib/format.js';
import { CASES, rad, solveRight } from './_right-triangle-math.js';

// C is the right angle. a is opposite A, b is next to A, c is the hypotenuse.
const state = { kind: 'ha', A: 35, c: 10, b: 8, a: 5 };
const c = readColors();
const GIVEN = { ha: ['c', 'A'], la: ['b', 'A'], ll: ['a', 'b'], hl: ['c', 'a'] };
const SHOWN = { ha: [1, 2], la: [1, 3], ll: [3, 4], hl: [2, 4] };
const solve = (s = state) => solveRight(s.kind, s);
const n = (x) => sig(x, 3);

function drawTriangle(ctx, size, stage) {
  const t = solve();
  const k = Math.min((stage.w * 0.7) / t.b, (stage.h * 0.62) / t.a);
  const A = [stage.w * 0.14, stage.h * 0.82];
  const C = [A[0] + t.b * k, A[1]];
  const B = [C[0], A[1] - t.a * k];
  poly(ctx, [A, C, B], { fill: c.fillC, stroke: c.ink, width: 3 });
  const given = GIVEN[state.kind];
  const colour = (name) => (given.includes(name) ? c.b : c.a);
  line(ctx, ...C, ...B, { color: colour('a'), width: 6 });
  line(ctx, ...A, ...C, { color: colour('b'), width: 6 });
  line(ctx, ...A, ...B, { color: colour('c'), width: 6 });
  arc(ctx, ...A, 30, -rad(t.A), 0, { color: colour('A'), width: 5 });
  line(ctx, C[0] - 12, C[1], C[0] - 12, C[1] - 12, { color: c.ink, width: 2 });
  line(ctx, C[0] - 12, C[1] - 12, C[0], C[1] - 12, { color: c.ink, width: 2 });
  label(ctx, `a = ${n(t.a)}`, C[0] + 6, (C[1] + B[1]) / 2, c, { size: 11, align: 'left', color: colour('a'), bounds: stage, patch: false });
  label(ctx, `b = ${n(t.b)}`, (A[0] + C[0]) / 2, A[1] + 15, c, { size: 11, color: colour('b'), bounds: stage, patch: false });
  label(ctx, `c = ${n(t.c)}`, (A[0] + B[0]) / 2 - 24, (A[1] + B[1]) / 2 - 10, c, { size: 11, color: colour('c'), bounds: stage, patch: false });
  label(ctx, `A = ${n(t.A)}°`, A[0] + 56, A[1] - 10, c, { size: 11, color: colour('A'), bounds: stage, patch: false });
  label(ctx, 'blue: given   coral: to find', 6, 10, c, { size: 10, align: 'left', bounds: stage, patch: false });
}

const stageEl = document.querySelector('#stage');
stageEl.setAttribute('role', 'group');
stageEl.setAttribute('aria-label', 'A right triangle with the given parts in blue and the parts to find in coral, followed by the worked solution');
const figureEl = document.createElement('div');
figureEl.className = 'viz-figure';
stageEl.appendChild(figureEl);
const figure = createStage(figureEl, drawTriangle, { label: 'A right triangle with sides a, b and c and angle A at the left corner' });

function steps(s) {
  const t = solve(s);
  const common = { B: { text: 'The angles of a triangle add to 180°, and one is 90°, so B is what is left:', tex: `B=90^\\circ-${n(t.A)}^\\circ=${n(t.B)}^\\circ` } };
  const check = { text: 'Check with Pythagoras:', tex: `a^2+b^2=${n(t.a ** 2)}+${n(t.b ** 2)}=${n(t.a ** 2 + t.b ** 2)}\\approx c^2=${n(t.c ** 2)}` };
  if (s.kind === 'ha') {
    return [
      { text: 'Opposite over hypotenuse is the sine, so a = c sin A:', tex: `a=c\\sin A=${n(s.c)}\\sin ${n(s.A)}^\\circ=${n(t.a)}` },
      { text: 'Adjacent over hypotenuse is the cosine, so b = c cos A:', tex: `b=c\\cos A=${n(s.c)}\\cos ${n(s.A)}^\\circ=${n(t.b)}` },
      common.B, check,
    ];
  }
  if (s.kind === 'la') {
    return [
      { text: 'Opposite over adjacent is the tangent, so a = b tan A:', tex: `a=b\\tan A=${n(s.b)}\\tan ${n(s.A)}^\\circ=${n(t.a)}` },
      { text: 'Adjacent over hypotenuse is the cosine, so c = b ÷ cos A:', tex: `c=\\dfrac{b}{\\cos A}=\\dfrac{${n(s.b)}}{\\cos ${n(s.A)}^\\circ}=${n(t.c)}` },
      common.B, check,
    ];
  }
  if (s.kind === 'll') {
    return [
      { text: 'Pythagoras gives the hypotenuse:', tex: `c=\\sqrt{a^2+b^2}=\\sqrt{${n(s.a ** 2)}+${n(s.b ** 2)}}=${n(t.c)}` },
      { text: 'Opposite over adjacent is the tangent, so A is the angle whose tangent is a ÷ b:', tex: `A=\\tan^{-1}\\dfrac{a}{b}=\\tan^{-1}\\dfrac{${n(s.a)}}{${n(s.b)}}=${n(t.A)}^\\circ` },
      common.B,
      { text: 'Check with the sine:', tex: `\\sin A=\\dfrac{a}{c}=${n(t.a / t.c)},\\ \\sin ${n(t.A)}^\\circ=${n(Math.sin(rad(t.A)))}` },
    ];
  }
  return [
    { text: 'Pythagoras gives the other leg:', tex: `b=\\sqrt{c^2-a^2}=\\sqrt{${n(s.c ** 2)}-${n(s.a ** 2)}}=${n(t.b)}` },
    { text: 'Opposite over hypotenuse is the sine, so A is the angle whose sine is a ÷ c:', tex: `A=\\sin^{-1}\\dfrac{a}{c}=\\sin^{-1}\\dfrac{${n(s.a)}}{${n(s.c)}}=${n(t.A)}^\\circ` },
    common.B,
    { text: 'Check with the cosine:', tex: `\\cos A=\\dfrac{b}{c}=${n(t.b / t.c)},\\ \\cos ${n(t.A)}^\\circ=${n(Math.cos(rad(t.A)))}` },
  ];
}

const formula = liveFormula(document.querySelector('#formula'), (s) => {
  const t = solve(s);
  return `A=${n(t.A)}^\\circ,\\ B=${n(t.B)}^\\circ,\\ a=${n(t.a)},\\ b=${n(t.b)},\\ c=${n(t.c)}`;
});
formula.update(state);

const fields = [];
function showFields() {
  fields.forEach((field, i) => { field.hidden = i > 0 && !SHOWN[state.kind].includes(i); });
}

createStepper({
  stage: stageEl,
  panel: document.querySelector('#panel'),
  state,
  steps,
  controls: [
    { title: 'What do you know?' },
    { key: 'kind', label: 'Given', options: [['ha', 'c and A'], ['la', 'b and A'], ['ll', 'a and b'], ['hl', 'c and a']] },
    { key: 'A', label: 'Angle A', min: 10, max: 80, step: 1, format: (v) => `${v}°` },
    { key: 'c', label: 'Hypotenuse c', min: 2, max: 20, step: 0.5, format: (v) => `${v}` },
    { key: 'b', label: 'Leg b (next to A)', min: 1, max: 20, step: 0.5, format: (v) => `${v}` },
    { key: 'a', label: 'Leg a (opposite A)', min: 1, max: 20, step: 0.5, format: (v) => `${v}` },
    { readout: [
      ['You know', (s) => CASES[s.kind].given],
      ['Angle A', (s) => `${n(solve(s).A)}°`],
      ['Angle B', (s) => `${n(solve(s).B)}°`],
      ['Sides a, b, c', (s) => `${n(solve(s).a)}, ${n(solve(s).b)}, ${n(solve(s).c)}`],
    ] },
  ],
  onChange(s) {
    if (s.kind === 'hl' && s.a >= s.c) s.a = s.c - 0.5;
    showFields();
    formula.update(s);
    figure.invalidate();
  },
});
fields.push(...document.querySelectorAll('#panel .nb-field'));
showFields();
