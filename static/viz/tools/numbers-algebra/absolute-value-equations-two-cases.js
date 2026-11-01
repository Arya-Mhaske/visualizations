import { createStepper } from '../../lib/stepper.js';
import { liveFormula } from '../../lib/formula.js';
import { arrow } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { absSolve } from './_inequalities-math.js';
import { lineFigure } from './_inequalities-view.js';

const state = { m: 2, k: -3, r: 5 };
const n = (v) => fixed(v, 3);
const sg = (v) => (v < 0 ? `-${Math.abs(v)}` : `+${v}`);
const coef = (m) => (m === 1 ? '' : m === -1 ? '-' : m);
const sol = (s = state) => absSolve(s.m, s.k, s.r);

const stageEl = document.querySelector('#stage');
stageEl.setAttribute('role', 'group');
stageEl.setAttribute('aria-label', 'A number line with the centre of the absolute value marked and the two solutions at equal distances on either side, followed by the worked steps');
const figure = lineFigure(stageEl, 'A number line: the two solutions sit the same distance either side of the centre', [-10, 10], (ctx, nl, c) => {
  const s = sol();
  nl.dot(s.centre, { fill: c.fillY, r: 7 });
  nl.text('centre', s.centre, -20, { color: c.ink, size: 10 });
  if (s.xs) {
    s.xs.forEach((x) => {
      nl.dot(x, { fill: c.c, r: 10 });
      nl.text(n(x), x, 40, { color: c.ink });
    });
    if (s.xs.length === 2) {
      nl.arrow(s.centre, s.xs[0], { color: c.b, dy: -34 });
      nl.arrow(s.centre, s.xs[1], { color: c.a, dy: -34 });
    }
  }
}, { step: 2 });

function steps(s) {
  const out = [
    { text: `|A| = ${s.r} means A is ${s.r} away from 0, so A is ${s.r} or −${s.r}. That is two cases:`, tex: `|${coef(s.m)}x${sg(s.k)}|=${s.r}` },
  ];
  if (s.r < 0) {
    out.push({ text: 'A distance can never be negative. No x works.', tex: '\\text{no solution}' });
    return out;
  }
  const r = sol(s);
  out.push({ text: 'Case 1: the inside equals the positive value.', tex: `${coef(s.m)}x${sg(s.k)}=${s.r}\\ \\Rightarrow\\ x=\\dfrac{${s.r - s.k}}{${s.m}}=${n((s.r - s.k) / s.m)}` });
  out.push(s.r === 0 ? { text: 'Case 2 is the same equation, since −0 = 0. One solution.', tex: `x=${n(r.centre)}` } : { text: 'Case 2: the inside equals the negative value.', tex: `${coef(s.m)}x${sg(s.k)}=${-s.r}\\ \\Rightarrow\\ x=\\dfrac{${-s.r - s.k}}{${s.m}}=${n((-s.r - s.k) / s.m)}` });
  out.push({ text: 'Check each in the original equation:', tex: r.xs.map((x) => `|${coef(s.m)}(${n(x)})${sg(s.k)}|=${n(Math.abs(s.m * x + s.k))}`).join(',\\ ') });
  return out;
}

const formula = liveFormula(document.querySelector('#formula'), (s) => `|${coef(s.m)}x${sg(s.k)}|=${s.r}\\ \\Rightarrow\\ x=${sol(s).xs ? sol(s).xs.map(n).join(',\\ ') : '\\text{none}'}`);
formula.update(state);

createStepper({
  stage: stageEl,
  panel: document.querySelector('#panel'),
  state,
  steps,
  controls: [
    { title: '|m x + k| = r' },
    { key: 'm', label: 'm', min: -4, max: 4, step: 1 },
    { key: 'k', label: 'k', min: -8, max: 8, step: 1 },
    { key: 'r', label: 'r', min: -2, max: 10, step: 1 },
    { readout: [
      ['Centre, −k/m', (s) => n(sol(s).centre)],
      ['Solutions', (s) => (sol(s).xs ? sol(s).xs.map(n).join(', ') : 'none')],
    ] },
  ],
  onChange(s) {
    if (s.m === 0) s.m = 1;
    formula.update(s);
    figure.invalidate();
  },
});
