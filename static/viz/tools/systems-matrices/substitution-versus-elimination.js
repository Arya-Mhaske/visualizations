import { createStepper } from '../../lib/stepper.js';
import { liveFormula } from '../../lib/formula.js';
import { num, texNum } from './_sm-math.js';

// a1 x + b1 y = c1 and a2 x + b2 y = c2, both with a1 ≠ 0 and a unique solution.
const SYSTEMS = {
  a: { name: 'x + y = 7,  2x − y = 5', e: [1, 1, 7, 2, -1, 5] },
  b: { name: '2x + 3y = 12,  x − y = 1', e: [2, 3, 12, 1, -1, 1] },
  c: { name: 'x − 2y = 1,  3x + y = 17', e: [1, -2, 1, 3, 1, 17] },
};
const state = { which: 'a' };
const t = (v) => texNum(v, 3);
const eqn = (a, b, c) => `${a === 1 ? '' : a === -1 ? '-' : t(a)}x${b < 0 ? '-' : '+'}${Math.abs(b) === 1 ? '' : t(Math.abs(b))}y=${t(c)}`;

function steps(s) {
  const [a1, b1, c1, a2, b2, c2] = SYSTEMS[s.which].e;
  const D = a1 * b2 - a2 * b1;
  const x = (c1 * b2 - c2 * b1) / D;
  const y = (a1 * c2 - a2 * c1) / D;
  // substitution: x = (c1 − b1 y)/a1 into equation 2
  const yCoef = b2 - (a2 * b1) / a1;
  const yConst = c2 - (a2 * c1) / a1;
  return [
    { text: 'The system. We will solve it two ways and compare.', tex: `\\begin{cases}${eqn(a1, b1, c1)}\\\\${eqn(a2, b2, c2)}\\end{cases}` },
    { text: 'Substitution: solve the first equation for x.', tex: `x=\\dfrac{${t(c1)}-${t(b1)}y}{${t(a1)}}` },
    { text: 'Put that into the second equation. Only y is left.', tex: `${t(a2)}\\cdot\\dfrac{${t(c1)}-${t(b1)}y}{${t(a1)}}+${t(b2)}y=${t(c2)}\\ \\Rightarrow\\ ${t(yCoef)}\\,y=${t(yConst)}` },
    { text: 'Solve for y, then go back for x.', tex: `y=${t(yConst / yCoef)},\\quad x=${t(x)}` },
    { text: 'Elimination: multiply the equations so the y-terms match, then subtract.', tex: `${t(b2)}(\\text{eq 1})-${t(b1)}(\\text{eq 2}):\\ (${t(a1 * b2 - a2 * b1)})\\,x=${t(c1 * b2 - c2 * b1)}` },
    { text: 'Solve for x, then use either equation for y.', tex: `x=${t(x)},\\quad y=${t(y)}` },
    { text: 'Both ways give the same point. Check it in both equations.', tex: `${t(a1)}(${t(x)})+${t(b1)}(${t(y)})=${t(a1 * x + b1 * y)},\\quad ${t(a2)}(${t(x)})+${t(b2)}(${t(y)})=${t(a2 * x + b2 * y)}` },
  ];
}

const formula = liveFormula(document.querySelector('#formula'), (s) => `\\begin{cases}${eqn(...SYSTEMS[s.which].e.slice(0, 3))}\\\\${eqn(...SYSTEMS[s.which].e.slice(3))}\\end{cases}`);
formula.update(state);

createStepper({
  stage: document.querySelector('#stage'),
  panel: document.querySelector('#panel'),
  state,
  steps,
  controls: [
    { title: 'Pick a system' },
    { key: 'which', label: 'System', options: Object.entries(SYSTEMS).map(([key, v]) => [key, v.name]) },
    { readout: [['Solution (x, y)', (s) => { const [a1, b1, c1, a2, b2, c2] = SYSTEMS[s.which].e; const D = a1 * b2 - a2 * b1; return `(${num((c1 * b2 - c2 * b1) / D)}, ${num((a1 * c2 - a2 * c1) / D)})`; }]] },
  ],
  onChange: (s) => formula.update(s),
});
