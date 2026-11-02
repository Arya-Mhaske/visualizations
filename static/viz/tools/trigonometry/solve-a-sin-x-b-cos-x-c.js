import { createStepper } from '../../lib/stepper.js';
import { liveFormula } from '../../lib/formula.js';
import { dot } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { norm360, rad, solveSinCos } from './_inverses-math.js';
import { graphFigure } from './_kit.js';

const state = { a: 3, b: 4, c: 2.5 };
const n = (x) => fixed(x, 1);
const combo = (s) => (x) => s.a * Math.sin(rad(x)) + s.b * Math.cos(rad(x));
const term = (v, f) => (v === 0 ? '' : `${v < 0 ? '-' : '+'}${Math.abs(v) === 1 ? '' : Math.abs(v)}\\${f}\\,x`);
const lhs = (s) => `${(s.a === 0 ? '' : `${s.a === 1 ? '' : s.a === -1 ? '-' : s.a}\\sin x`) + term(s.b, 'cos')}`.replace(/^\+/, '') || '0';

const figure = graphFigure(document.querySelector('#stage'), {
  label: 'The graph of a sin x plus b cos x from 0 to 360 degrees, a horizontal line at c, and a dot at each solution',
  draw(ctx, stage, c, plot) {
    const { R } = solveSinCos(state.a, state.b, state.c);
    const top = Math.max(2, Math.ceil(R + 0.5));
    plot.setRange([0, 360], [-top, top]);
    plot.axes({ xLabel: 'x (°)', yLabel: 'y' });
    plot.fn(combo(state), { color: c.b, width: 4 });
    plot.segment(0, state.c, 360, state.c, { color: c.a, width: 3 });
    for (const x of solveSinCos(state.a, state.b, state.c).sols) dot(ctx, ...plot.toPx(x, state.c), 8, c.a, c.ink);
  },
});

function steps(s) {
  const r = solveSinCos(s.a, s.b, s.c);
  if (s.a === 0 && s.b === 0) return [{ text: 'With a = b = 0 the left side is always 0. Choose another a or b.' }];
  const out = [
    { text: 'Write the left side as one sine, R sin(x + α), using R = √(a² + b²) and tan α = b ÷ a:', tex: `R=\\sqrt{${s.a}^2+${s.b}^2}=${n(r.R)},\\quad \\alpha=${n(r.alphaD)}^\\circ` },
    { text: 'Check it by expanding:', tex: `${n(r.R)}\\sin(x+${n(r.alphaD)}^\\circ)=${n(r.R * Math.cos(rad(r.alphaD)))}\\sin x+${n(r.R * Math.sin(rad(r.alphaD)))}\\cos x` },
    { text: 'Divide both sides by R:', tex: `\\sin(x+\\alpha)=\\dfrac{${s.c}}{${n(r.R)}}=${fixed(r.k, 3)}` },
  ];
  if (!r.ok) {
    out.push({ text: `This is bigger than 1 (or less than −1), so there is no solution: the largest value of the left side is R = ${n(r.R)}.` });
    return out;
  }
  out.push({ text: 'Solve sin θ = that number, for θ = x + α:', tex: `\\theta=${r.base.map((v) => `${n(v)}^\\circ`).join(',\\ ')}\\ (\\text{plus whole turns})` });
  out.push({ text: 'Subtract α to get x, and bring it into 0° to 360°:', tex: `x=${r.sols.map((v) => `${n(v)}^\\circ`).join(',\\ ')}` });
  const x = r.sols[0];
  out.push({ text: 'Check one answer in the original equation:', tex: `${n(combo(s)(x))}\\approx ${s.c}` });
  return out;
}

const formula = liveFormula(document.querySelector('#formula'), (s) => {
  const r = solveSinCos(s.a, s.b, s.c);
  return r.ok ? `${lhs(s)}=${s.c}\\ \\Rightarrow\\ x=${r.sols.map((v) => `${n(v)}^\\circ`).join(',\\ ')}` : `${lhs(s)}=${s.c}\\ \\Rightarrow\\ \\text{no solution}`;
});
formula.update(state);

createStepper({
  stage: document.querySelector('#stage'),
  panel: document.querySelector('#panel'),
  state,
  steps,
  controls: [
    { title: 'a sin x + b cos x = c' },
    { key: 'a', label: 'a', min: -5, max: 5, step: 1 },
    { key: 'b', label: 'b', min: -5, max: 5, step: 1 },
    { key: 'c', label: 'c', min: -6, max: 6, step: 0.5, format: (v) => fixed(v, 1) },
    { readout: [
      ['R = √(a² + b²)', (s) => n(solveSinCos(s.a, s.b, s.c).R)],
      ['α', (s) => `${n(solveSinCos(s.a, s.b, s.c).alphaD)}°`],
      ['Solutions in 0° to 360°', (s) => { const r = solveSinCos(s.a, s.b, s.c); return r.ok ? r.sols.map(n).join('°, ') + '°' : 'none'; }],
    ] },
  ],
  onChange(s) {
    formula.update(s);
    figure.invalidate();
  },
});
void norm360;
