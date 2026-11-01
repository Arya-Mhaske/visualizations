import { createStepper } from '../../lib/stepper.js';
import { createStage } from '../../lib/stage.js';
import { createPlot } from '../../lib/plot.js';
import { readColors } from '../../lib/colors.js';
import { liveFormula } from '../../lib/formula.js';
import { label } from '../../lib/draw.js';
import { fixed, piFrac } from '../../lib/format.js';
import { asymptotes, curve, period, quarterPoints, zeros } from './_tan-cot-math.js';

const state = { kind: 'tan', A: 1.5, B: 1, cn: 0 }; // C = cn × π/4
const c = readColors();
const LO = -2 * Math.PI;
const HI = 2 * Math.PI;
const C = (s) => (s.cn * Math.PI) / 4;
const pi = (x) => (piFrac(x) ?? fixed(x, 2)).replace('π', '\\pi ');
const num = (x) => fixed(x, 2);
const sgn = (x) => (x < 0 ? '-' : '+');
const list = (xs) => `${xs.slice(0, 4).map(pi).join(',\\ ')}${xs.length > 4 ? ',\\ \\dots' : ''}`;
const equation = (s) => `y=${num(s.A)}\\${s.kind}\\left(${num(s.B)}x${sgn(C(s))}${pi(Math.abs(C(s)))}\\right)`;
const middle = (xs) => xs.filter((x) => x >= LO && x <= HI);

let plot = null;
function draw(ctx, size, stage) {
  plot = plot || createPlot(stage, { x: [LO, HI], y: [-6, 6], c, ticks: 'pi', pad: 22 });
  plot.axes({ xLabel: 'x', yLabel: 'y' });
  const { kind, A, B } = state;
  asymptotes(kind, B, C(state), LO, HI).forEach((x) => plot.segment(x, -6, x, 6, { color: c.a, width: 2, dash: [6, 5] }));
  plot.fn(curve(kind, A, B, C(state)), { color: c.b, width: 4 });
  zeros(kind, B, C(state), LO, HI).forEach((x) => plot.point(x, 0, { fill: c.ink, r: 5 }));
  quarterPoints(kind, A, B, C(state), LO, HI).forEach((p) => plot.point(p.x, p.y, { fill: c.fillY, r: 6 }));
  label(ctx, 'dashed: asymptotes   black: zeros   yellow: y = ±A', 8, 12, c, { size: 10, align: 'left', bounds: stage, patch: false });
}

const stageEl = document.querySelector('#stage');
stageEl.setAttribute('role', 'group');
stageEl.setAttribute('aria-label', 'A tangent or cotangent graph with its asymptotes, zeros and plus or minus A points marked, followed by the steps for graphing it by hand');
const figureEl = document.createElement('div');
figureEl.className = 'viz-figure';
stageEl.appendChild(figureEl);
const figure = createStage(figureEl, draw, { label: 'The graph of y equals A tan or A cot of Bx plus C, with asymptotes drawn first' });

function steps(s) {
  const P = period(s.kind, s.B);
  const asym = asymptotes(s.kind, s.B, C(s), LO, HI);
  const zero = zeros(s.kind, s.B, C(s), LO, HI);
  const rule = s.kind === 'tan' ? 'Bx + C = \\dfrac{\\pi}{2} + n\\pi' : 'Bx + C = n\\pi';
  return [
    { text: 'The tangent and the cotangent repeat every π, so with B the period is π ÷ B. Asymptotes are one period apart:', tex: `\\text{period}=\\dfrac{\\pi}{B}=\\dfrac{\\pi}{${num(s.B)}}=${pi(P)}` },
    { text: s.kind === 'tan' ? 'Asymptotes first. The tangent is undefined when its bracket is π/2 plus a whole number of π:' : 'Asymptotes first. The cotangent is undefined when its bracket is a whole number of π:', tex: `${rule}\\ \\Rightarrow\\ x=${list(asym)}` },
    { text: s.kind === 'tan' ? 'Halfway between two asymptotes the curve crosses the x-axis. These are the zeros (the bracket is nπ):' : 'Halfway between two asymptotes the curve crosses the x-axis. These are the zeros (the bracket is π/2 + nπ):', tex: `x=${list(zero)}` },
    { text: `A quarter of the way along from each asymptote the curve is at y = ±A, which is ±${num(Math.abs(s.A))}:`, tex: `y=${s.kind === 'tan' ? 'A\\tan(\\pm\\pi/4)=\\pm A' : 'A\\cot(\\pi/4)=A,\\ A\\cot(3\\pi/4)=-A'}=\\pm ${num(Math.abs(s.A))}` },
    { text: `Join the points between each pair of asymptotes. ${(s.kind === 'tan') === (s.A > 0) ? 'The curve rises from left to right' : 'The curve falls from left to right'} in every piece, and never crosses an asymptote.`, tex: equation(s) },
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
    { key: 'kind', label: 'Function', options: [['tan', 'tan'], ['cot', 'cot']] },
    { key: 'A', label: 'Stretch, A (negative flips it)', min: -3, max: 3, step: 0.5, format: (v) => fixed(v, 1) },
    { key: 'B', label: 'B', min: 0.5, max: 2, step: 0.5, format: (v) => fixed(v, 1) },
    { key: 'cn', label: 'C, in steps of π/4', min: -4, max: 4, step: 1, format: (v) => (v === 0 ? '0' : `${piFrac((v * Math.PI) / 4)}`) },
    { readout: [
      ['Period', (s) => (piFrac(period(s.kind, s.B)) ?? fixed(period(s.kind, s.B), 2))],
      ['Asymptotes in view', (s) => middle(asymptotes(s.kind, s.B, C(s), LO, HI)).length],
      ['Zeros in view', (s) => middle(zeros(s.kind, s.B, C(s), LO, HI)).length],
    ] },
  ],
  onChange(s) {
    if (s.A === 0) s.A = 0.5;
    formula.update(s);
    figure.invalidate();
  },
});
