import { createStepper } from '../../lib/stepper.js';
import { createStage } from '../../lib/stage.js';
import { createPlot } from '../../lib/plot.js';
import { readColors } from '../../lib/colors.js';
import { liveFormula } from '../../lib/formula.js';
import { label } from '../../lib/draw.js';
import { fixed, piFrac } from '../../lib/format.js';
import { keyPoints, period, shift, wave } from './_sine-cosine-math.js';

const state = { A: 2, B: 2, cn: 1, k: 1 }; // C = cn × π/4
const c = readColors();
const C = (s) => (s.cn * Math.PI) / 4;
const pi = (x) => (piFrac(x) ?? fixed(x, 2)).replace('π', '\\pi ');
const num = (x) => fixed(x, 2);
const sgn = (x) => (x < 0 ? '-' : '+');
const equation = (s) => `y=${num(s.k)}${sgn(s.A)}${num(Math.abs(s.A))}\\sin\\left(${num(s.B)}x${sgn(C(s))}${pi(Math.abs(C(s)))}\\right)`;

let plot = null;
function draw(ctx, size, stage) {
  plot = plot || createPlot(stage, { x: [-2 * Math.PI, 2 * Math.PI], y: [-5, 5], c, ticks: 'pi', pad: 22 });
  plot.axes({ xLabel: 'x', yLabel: 'y' });
  const { A, B, k } = state;
  plot.segment(-7, k, 7, k, { color: c.ink, width: 1, dash: [5, 4] });
  plot.fn(wave(A, B, C(state), k), { color: c.a, width: 4 });
  keyPoints(A, B, C(state), k).forEach((p, i) => {
    plot.point(p.x, p.y, { fill: c.fillY, r: 7 });
    plot.text(String(i + 1), p.x, p.y + (i === 1 ? 0.6 : i === 3 ? -0.6 : 0.6), { size: 11, patch: false });
  });
  label(ctx, 'yellow dots: the five key points', 8, 12, c, { size: 10, align: 'left', bounds: stage, patch: false });
}

const stageEl = document.querySelector('#stage');
stageEl.setAttribute('role', 'group');
stageEl.setAttribute('aria-label', 'A sine graph with its five key points marked, followed by the steps for graphing it by hand');
const figureEl = document.createElement('div');
figureEl.className = 'viz-figure';
stageEl.appendChild(figureEl);
const figure = createStage(figureEl, draw, { label: 'The graph of y equals k plus A sine of Bx plus C, with five key points marked' });

function steps(s) {
  const P = period(s.B);
  const start = shift(s.B, C(s));
  const pts = keyPoints(s.A, s.B, C(s), s.k);
  return [
    { text: 'Match the equation to the pattern y = k + A sin(Bx + C):', tex: equation(s) },
    { text: `The middle line is y = k, and the wave goes ${num(Math.abs(s.A))} above it and below it. That is the amplitude |A|${s.A < 0 ? ', and A is negative, so the wave starts by going down' : ''}.`, tex: `\\text{middle line } y=${num(s.k)},\\quad |A|=${num(Math.abs(s.A))},\\quad \\text{max}=${num(s.k + Math.abs(s.A))},\\ \\text{min}=${num(s.k - Math.abs(s.A))}` },
    { text: 'One cycle takes 2π ÷ B:', tex: `\\text{period}=\\dfrac{2\\pi}{B}=\\dfrac{2\\pi}{${num(s.B)}}=${pi(P)}` },
    { text: 'A cycle starts where the bracket is 0, Bx + C = 0:', tex: `x=-\\dfrac{C}{B}=-\\dfrac{${pi(C(s))}}{${num(s.B)}}=${pi(start)}` },
    { text: 'Cut the cycle into four equal steps of period ÷ 4. These are the x-values of the five key points:', tex: `x=${pts.map((p) => pi(p.x)).join(',\\ ')}` },
    { text: `The heights go middle, ${s.A < 0 ? 'low, middle, high' : 'high, middle, low'}, middle:`, tex: `y=${pts.map((p) => num(p.y)).join(',\\ ')}` },
    { text: 'Plot the five points and join them with a smooth wave. Then repeat it left and right. Compare with the live plot above.', tex: equation(s) },
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
    { title: 'Choose a wave' },
    { key: 'A', label: 'Amplitude, A (negative flips it)', min: -3, max: 3, step: 0.5, format: (v) => fixed(v, 1) },
    { key: 'B', label: 'B', min: 0.5, max: 4, step: 0.5, format: (v) => fixed(v, 1) },
    { key: 'cn', label: 'C, in steps of π/4', min: -4, max: 4, step: 1, format: (v) => (v === 0 ? '0' : `${piFrac((v * Math.PI) / 4)}`) },
    { key: 'k', label: 'Lift, k', min: -1.5, max: 1.5, step: 0.5, format: (v) => fixed(v, 1) },
    { readout: [
      ['Period', (s) => (piFrac(period(s.B)) ?? fixed(period(s.B), 2))],
      ['A cycle starts at', (s) => (piFrac(shift(s.B, C(s))) ?? fixed(shift(s.B, C(s)), 2))],
      ['Middle line', (s) => `y = ${fixed(s.k, 1)}`],
    ] },
  ],
  onChange(s) {
    if (s.A === 0) s.A = 0.5;
    formula.update(s);
    figure.invalidate();
  },
});
