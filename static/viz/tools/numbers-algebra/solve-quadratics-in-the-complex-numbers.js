import { createStepper } from '../../lib/stepper.js';
import { liveFormula } from '../../lib/formula.js';
import { fixed } from '../../lib/format.js';
import { quadraticRoots, showComplex, texComplex } from './_complex-numbers-math.js';
import { planeFigure } from './_complex-numbers-view.js';

const state = { a: 1, b: 2, c: 5 };
const solve = (s = state) => quadraticRoots(s.a, s.b, s.c);
const n = (x) => fixed(x, 3);

const stageEl = document.querySelector('#stage');
stageEl.setAttribute('role', 'group');
stageEl.setAttribute('aria-label', 'The complex plane showing the two roots of the quadratic, followed by the worked solution');
const figure = planeFigure(stageEl, 'The complex plane with the two roots of the quadratic', 6, (ctx, plot, c) => {
  const { roots, real } = solve();
  plot.segment(roots[0][0], roots[0][1], roots[1][0], roots[1][1], { color: c.grid, width: 2, dash: [5, 4] });
  roots.forEach(([x, y], i) => {
    plot.point(x, y, { fill: real ? c.c : c.b, r: 8 });
    plot.text(`x${i + 1}`, x + 0.6, y + (i ? 0.6 : -0.6), { size: 12, patch: false });
  });
});

function steps(s) {
  const { d, roots, real } = solve(s);
  const list = [
    { text: 'The quadratic formula needs the discriminant first:', tex: `b^2-4ac=${s.b}^2-4(${s.a})(${s.c})=${d}` },
    d < 0
      ? { text: 'It is negative, so the square root is imaginary: √(−D) times i.', tex: `\\sqrt{${d}}=\\sqrt{${-d}}\\,i=${n(Math.sqrt(-d))}\\,i` }
      : { text: d === 0 ? 'It is zero, so there is one repeated root.' : 'It is positive, so both roots are real.', tex: `\\sqrt{${d}}=${n(Math.sqrt(d))}` },
    { text: 'Put it in the formula:', tex: `x=\\dfrac{-${s.b < 0 ? `(${s.b})` : s.b}\\pm\\sqrt{${d}}}{2(${s.a})}` },
    { text: real ? 'The two real roots:' : 'The two roots are conjugates:', tex: `x=${texComplex(roots[0], 3)}\\ \\text{and}\\ x=${texComplex(roots[1], 3)}` },
    { text: 'Check: the roots add to −b/a and multiply to c/a.', tex: `x_1+x_2=${n(roots[0][0] + roots[1][0])}=\\dfrac{-${s.b < 0 ? `(${s.b})` : s.b}}{${s.a}},\\ x_1x_2=${n(roots[0][0] * roots[1][0] - roots[0][1] * roots[1][1])}=\\dfrac{${s.c}}{${s.a}}` },
  ];
  return list;
}

const formula = liveFormula(document.querySelector('#formula'), (s) => `${s.a}x^2+${s.b}x+${s.c}=0\\ \\Rightarrow\\ x=${texComplex(solve(s).roots[0], 3)},\\ ${texComplex(solve(s).roots[1], 3)}`.replace('+-', '-'));
formula.update(state);

createStepper({
  stage: stageEl,
  panel: document.querySelector('#panel'),
  state,
  steps,
  controls: [
    { title: 'Choose a quadratic' },
    { key: 'a', label: 'a', min: 1, max: 4, step: 1 },
    { key: 'b', label: 'b', min: -8, max: 8, step: 1 },
    { key: 'c', label: 'c', min: -8, max: 12, step: 1 },
    { readout: [
      ['Discriminant', (s) => `${solve(s).d}`],
      ['Roots are', (s) => ({ text: solve(s).real ? 'real' : 'complex pair', good: solve(s).real })],
      ['x', (s) => `${showComplex(solve(s).roots[0], 3)},  ${showComplex(solve(s).roots[1], 3)}`],
    ] },
  ],
  onChange(s) {
    formula.update(s);
    figure.invalidate();
  },
});
