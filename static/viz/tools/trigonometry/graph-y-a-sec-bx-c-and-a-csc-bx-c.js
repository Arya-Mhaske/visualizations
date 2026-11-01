import { createStepper } from '../../lib/stepper.js';
import { createStage } from '../../lib/stage.js';
import { createPlot } from '../../lib/plot.js';
import { readColors } from '../../lib/colors.js';
import { liveFormula } from '../../lib/formula.js';
import { label } from '../../lib/draw.js';
import { fixed, piFrac } from '../../lib/format.js';
import { asymptotes, curve, guide, period, vertices } from './_tan-cot-math.js';

const state = { kind: 'sec', A: 1.5, B: 1, cn: 0 }; // C = cn × π/4
const c = readColors();
const LO = -2 * Math.PI;
const HI = 2 * Math.PI;
const C = (s) => (s.cn * Math.PI) / 4;
const pi = (x) => (piFrac(x) ?? fixed(x, 2)).replace('π', '\\pi ');
const num = (x) => fixed(x, 2);
const sgn = (x) => (x < 0 ? '-' : '+');
const list = (xs) => `${xs.slice(0, 4).map(pi).join(',\\ ')}${xs.length > 4 ? ',\\ \\dots' : ''}`;
const equation = (s) => `y=${num(s.A)}\\${s.kind}\\left(${num(s.B)}x${sgn(C(s))}${pi(Math.abs(C(s)))}\\right)`;
const guideName = (s) => (s.kind === 'sec' ? 'cosine' : 'sine');

let plot = null;
function draw(ctx, size, stage) {
  plot = plot || createPlot(stage, { x: [LO, HI], y: [-6, 6], c, ticks: 'pi', pad: 22 });
  plot.axes({ xLabel: 'x', yLabel: 'y' });
  const { kind, A, B } = state;
  asymptotes(kind, B, C(state), LO, HI).forEach((x) => plot.segment(x, -6, x, 6, { color: c.a, width: 2, dash: [6, 5] }));
  plot.fn(guide(kind, A, B, C(state)), { color: c.grid, width: 3 });
  plot.fn(curve(kind, A, B, C(state)), { color: c.b, width: 4 });
  vertices(kind, A, B, C(state), LO, HI).forEach((p) => plot.point(p.x, p.y, { fill: c.fillY, r: 6 }));
  label(ctx, 'grey: the guide wave   dashed: asymptotes   yellow: vertices', 8, 12, c, { size: 10, align: 'left', bounds: stage, patch: false });
}

const stageEl = document.querySelector('#stage');
stageEl.setAttribute('role', 'group');
stageEl.setAttribute('aria-label', 'A secant or cosecant graph drawn over its faint guide wave, with the vertices of the U-shapes marked, followed by the steps for graphing it by hand');
const figureEl = document.createElement('div');
figureEl.className = 'viz-figure';
stageEl.appendChild(figureEl);
const figure = createStage(figureEl, draw, { label: 'The graph of y equals A sec or A csc of Bx plus C over a faint guide wave' });

function steps(s) {
  const P = period(s.kind, s.B);
  const asym = asymptotes(s.kind, s.B, C(s), LO, HI);
  const vert = vertices(s.kind, s.A, s.B, C(s), LO, HI);
  const g = guideName(s);
  return [
    { text: `Draw the guide first, faintly: the ${g} wave A ${g === 'cosine' ? 'cos' : 'sin'}(Bx + C), with amplitude |A| = ${num(Math.abs(s.A))}. Its period is 2π ÷ B:`, tex: `\\text{period}=\\dfrac{2\\pi}{B}=\\dfrac{2\\pi}{${num(s.B)}}=${pi(P)}` },
    { text: `Where the guide crosses the x-axis, the reciprocal would divide by 0. Draw an asymptote there:`, tex: `x=${list(asym)}` },
    { text: 'Where the guide reaches its top or bottom, the reciprocal touches it. These points, at height ±A, are the vertices of the U-shapes:', tex: `(x,\\ y)=${vert.slice(0, 3).map((p) => `(${pi(p.x)},\\ ${num(p.y)})`).join(',\\ ')}${vert.length > 3 ? ',\\ \\dots' : ''}` },
    { text: 'Flip: wherever the guide is positive, draw a U opening up from its peak. Wherever it is negative, draw a ∩ opening down from its trough. Each curve bends away from the axis and runs along the asymptotes.', tex: equation(s) },
    { text: 'Rub out the guide, or keep it as a check. No part of the curve is between −A and A.', tex: `|y|\\ge ${num(Math.abs(s.A))}` },
  ];
}

const formula = liveFormula(document.querySelector('#formula'), equation);
formula.update(state);

createStepper({
  stage: stageEl,
  panel: document.querySelector('#panel'),
  state,
  steps,
  controls: [
    { title: 'Choose a function' },
    { key: 'kind', label: 'Function', options: [['sec', 'sec'], ['csc', 'csc']] },
    { key: 'A', label: 'Stretch, A (negative flips it)', min: -3, max: 3, step: 0.5, format: (v) => fixed(v, 1) },
    { key: 'B', label: 'B', min: 0.5, max: 2, step: 0.5, format: (v) => fixed(v, 1) },
    { key: 'cn', label: 'C, in steps of π/4', min: -4, max: 4, step: 1, format: (v) => (v === 0 ? '0' : `${piFrac((v * Math.PI) / 4)}`) },
    { readout: [
      ['Period', (s) => (piFrac(period(s.kind, s.B)) ?? fixed(period(s.kind, s.B), 2))],
      ['Guide wave', (s) => `${guideName(s)}, amplitude ${fixed(Math.abs(s.A), 1)}`],
      ['Lowest |y|', (s) => fixed(Math.abs(s.A), 1)],
    ] },
  ],
  onChange(s) {
    if (s.A === 0) s.A = 0.5;
    formula.update(s);
    figure.invalidate();
  },
});
