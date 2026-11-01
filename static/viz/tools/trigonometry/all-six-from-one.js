import { createStepper } from '../../lib/stepper.js';
import { createStage } from '../../lib/stage.js';
import { readColors } from '../../lib/colors.js';
import { liveFormula } from '../../lib/formula.js';
import { dot, label, line, poly } from '../../lib/draw.js';
import { TRIPLES, allSix, fractionTex, fractionText } from './_identities-math.js';

const state = { fn: 'sin', k: 0, q: 2 };
const c = readColors();
const six = (s = state) => allSix(s.fn, TRIPLES[s.k], s.q);
const NAMES = ['sin', 'cos', 'tan', 'csc', 'sec', 'cot'];
const POSITIVE = { sin: [1, 2], cos: [1, 4], tan: [1, 3] };
const SYMBOL = { sin: 'y/r', cos: 'x/r', tan: 'y/x', csc: 'r/y', sec: 'r/x', cot: 'x/y' };

function drawTriangle(ctx, size, stage) {
  const t = six();
  const k = Math.min(stage.w, stage.h) / 2 / (t.r * 1.5);
  const O = [stage.w / 2, stage.h / 2];
  const P = [O[0] + t.x * k, O[1] - t.y * k];
  line(ctx, 8, O[1], stage.w - 8, O[1], { color: c.ink, width: 2 });
  line(ctx, O[0], 8, O[0], stage.h - 8, { color: c.ink, width: 2 });
  poly(ctx, [O, [P[0], O[1]], P], { fill: c.fillC, stroke: c.ink, width: 3 });
  line(ctx, ...O, ...P, { color: c.d, width: 4 });
  dot(ctx, ...P, 7, c.a, c.ink);
  label(ctx, `x = ${t.x}`.replace('-', '−'), (O[0] + P[0]) / 2, O[1] + (t.y > 0 ? 14 : -14), c, { size: 11, color: c.b, bounds: stage, patch: false });
  label(ctx, `y = ${t.y}`.replace('-', '−'), P[0] + (t.x > 0 ? 8 : -8), (O[1] + P[1]) / 2, c, { size: 11, color: c.a, bounds: stage, patch: false, align: t.x > 0 ? 'left' : 'right' });
  label(ctx, `r = ${t.r}`, (O[0] + P[0]) / 2 - (t.x > 0 ? 18 : -18), (O[1] + P[1]) / 2 - (t.y > 0 ? 12 : -12), c, { size: 11, color: c.d, bounds: stage, patch: false });
  label(ctx, `Quadrant ${state.q}`, stage.w / 2, 12, c, { size: 11, bounds: stage });
}

const stageEl = document.querySelector('#stage');
stageEl.setAttribute('role', 'group');
stageEl.setAttribute('aria-label', 'A right triangle drawn in the chosen quadrant, followed by the worked steps that find all six trig functions');
const figureEl = document.createElement('div');
figureEl.className = 'viz-figure';
stageEl.appendChild(figureEl);
const figure = createStage(figureEl, drawTriangle, { label: 'A triangle from the origin to a point in the chosen quadrant' });

function steps(s) {
  const t = six(s);
  const [a, b, h] = TRIPLES[s.k];
  const given = t[s.fn];
  const sign = POSITIVE[s.fn].includes(s.q) ? 'positive' : 'negative';
  const signed = (v) => (v < 0 ? `-${Math.abs(v)}` : `${v}`);
  return [
    { text: `Given: ${s.fn} θ = ${fractionText(given)}, with θ in quadrant ${s.q}. ${s.fn} is ${sign} there, so the sign agrees.`, tex: `\\${s.fn}\\theta=${fractionTex(given)}` },
    { text: s.fn !== 'tan' ? `Pythagoras finds the missing side: the other leg is √(${h}² − ${a}²) = ${b}.` : `Pythagoras finds the hypotenuse: √(${a}² + ${b}²) = ${h}.`, tex: s.fn === 'tan' ? `r=\\sqrt{${t.opp}^2+${t.adj}^2}=${h}` : `\\text{other leg}=\\sqrt{${h}^2-${a}^2}=${b}` },
    { text: `Quadrant ${s.q} fixes the signs: x is ${t.x < 0 ? 'negative' : 'positive'}, y is ${t.y < 0 ? 'negative' : 'positive'}. The point is (${signed(t.x)}, ${signed(t.y)}) with r = ${h}.`, tex: `(x,y)=(${signed(t.x)},\\ ${signed(t.y)}),\\ r=${h}` },
    { text: 'Read the three main ratios from the point:', tex: `\\sin\\theta=\\dfrac{y}{r}=${fractionTex(t.sin)},\\ \\cos\\theta=\\dfrac{x}{r}=${fractionTex(t.cos)},\\ \\tan\\theta=\\dfrac{y}{x}=${fractionTex(t.tan)}` },
    { text: 'Flip each one for its reciprocal:', tex: `\\csc\\theta=${fractionTex(t.csc)},\\ \\sec\\theta=${fractionTex(t.sec)},\\ \\cot\\theta=${fractionTex(t.cot)}` },
    { text: 'Check with the first Pythagorean identity:', tex: `\\sin^2\\theta+\\cos^2\\theta=\\dfrac{${t.y ** 2}}{${t.r ** 2}}+\\dfrac{${t.x ** 2}}{${t.r ** 2}}=1` },
  ];
}

const formula = liveFormula(document.querySelector('#formula'), (s) => {
  const t = six(s);
  return `\\sin\\theta=${fractionTex(t.sin)},\\ \\cos\\theta=${fractionTex(t.cos)},\\ \\tan\\theta=${fractionTex(t.tan)}`;
});
formula.update(state);

createStepper({
  stage: stageEl,
  panel: document.querySelector('#panel'),
  state,
  steps,
  controls: [
    { title: 'What do you know?' },
    { key: 'fn', label: 'Given', options: [['sin', 'sin θ'], ['cos', 'cos θ'], ['tan', 'tan θ']] },
    { key: 'k', label: 'Triangle', min: 0, max: TRIPLES.length - 1, step: 1, format: (n) => TRIPLES[n].join('-') },
    { key: 'q', label: 'Quadrant', options: [[1, '1'], [2, '2'], [3, '3'], [4, '4']] },
    { readout: NAMES.map((name) => [`${name} θ`, (s) => fractionText(six(s)[name])]) },
  ],
  onChange(s) {
    formula.update(s);
    figure.invalidate();
  },
});
