import { createStepper } from '../../lib/stepper.js';
import { liveFormula } from '../../lib/formula.js';

// Each system: two equations as functions (left minus right = 0), the solutions, and the worked lines.
const SYSTEMS = {
  a: { name: 'x + y = 5, xy = 6', f: [(x, y) => x + y - 5, (x, y) => x * y - 6], sol: [[2, 3], [3, 2]], tex: 'x+y=5,\\ xy=6',
    steps: [
      ['Substitution: the linear equation gives y in terms of x.', 'y=5-x'],
      ['Put it in the other equation. A quadratic in x appears.', 'x(5-x)=6\\ \\Rightarrow\\ x^2-5x+6=0'],
      ['Factorise and solve.', '(x-2)(x-3)=0\\ \\Rightarrow\\ x=2\\ \\text{or}\\ x=3'],
      ['Find y for each x.', 'x=2\\Rightarrow y=3;\\quad x=3\\Rightarrow y=2'],
    ] },
  b: { name: 'x² + y² = 25, x − y = 1', f: [(x, y) => x * x + y * y - 25, (x, y) => x - y - 1], sol: [[4, 3], [-3, -4]], tex: 'x^2+y^2=25,\\ x-y=1',
    steps: [
      ['Substitution: solve the linear equation for x.', 'x=y+1'],
      ['Put it in the circle.', '(y+1)^2+y^2=25\\ \\Rightarrow\\ 2y^2+2y-24=0\\ \\Rightarrow\\ y^2+y-12=0'],
      ['Factorise and solve.', '(y-3)(y+4)=0\\ \\Rightarrow\\ y=3\\ \\text{or}\\ y=-4'],
      ['Find x for each y.', 'y=3\\Rightarrow x=4;\\quad y=-4\\Rightarrow x=-3'],
    ] },
  c: { name: 'x² − y² = 7, x + y = 7', f: [(x, y) => x * x - y * y - 7, (x, y) => x + y - 7], sol: [[4, 3]], tex: 'x^2-y^2=7,\\ x+y=7',
    steps: [
      ['Elimination: factorise the difference of squares.', '(x-y)(x+y)=7'],
      ['Use x + y = 7.', '(x-y)\\cdot7=7\\ \\Rightarrow\\ x-y=1'],
      ['Now there are two linear equations. Add them.', '2x=8\\ \\Rightarrow\\ x=4,\\quad y=3'],
    ] },
  d: { name: 'x² + y² = 10, xy = 3', f: [(x, y) => x * x + y * y - 10, (x, y) => x * y - 3], sol: [[1, 3], [3, 1], [-1, -3], [-3, -1]], tex: 'x^2+y^2=10,\\ xy=3',
    steps: [
      ['Elimination: build (x + y)² from the two equations.', '(x+y)^2=x^2+y^2+2xy=10+6=16\\ \\Rightarrow\\ x+y=\\pm4'],
      ['Case x + y = 4 with xy = 3: x and y are the roots of t² − 4t + 3 = 0.', 't=1\\ \\text{or}\\ 3\\ \\Rightarrow\\ (1,3),\\ (3,1)'],
      ['Case x + y = −4 with xy = 3: roots of t² + 4t + 3 = 0.', 't=-1\\ \\text{or}\\ -3\\ \\Rightarrow\\ (-1,-3),\\ (-3,-1)'],
    ] },
};
const state = { which: 'a' };
const sys = (s) => SYSTEMS[s.which];

function steps(s) {
  const e = sys(s);
  const list = [{ text: 'The system. One equation is not linear, so we cannot just row-reduce.', tex: e.tex }];
  e.steps.forEach(([text, tex]) => list.push({ text, tex }));
  list.push({ text: 'Check every solution in both original equations. The residuals should be zero.', tex: e.sol.map(([x, y]) => `(${x},${y}):\\ ${e.f[0](x, y)},\\ ${e.f[1](x, y)}`).join(';\\quad ') });
  list.push({ text: `A graph check: the two curves should meet in exactly ${e.sol.length} point${e.sol.length > 1 ? 's' : ''}.`, tex: e.sol.map(([x, y]) => `(${x},\\ ${y})`).join(',\\ ') });
  return list;
}

const formula = liveFormula(document.querySelector('#formula'), (s) => sys(s).tex);
formula.update(state);

createStepper({
  stage: document.querySelector('#stage'),
  panel: document.querySelector('#panel'),
  state,
  steps,
  controls: [
    { title: 'Pick a system' },
    { key: 'which', label: 'System', options: Object.entries(SYSTEMS).map(([key, v]) => [key, v.name]) },
    { readout: [
      ['Number of solutions', (s) => String(sys(s).sol.length)],
      ['All residuals zero?', (s) => { const e = sys(s); const ok = e.sol.every(([x, y]) => e.f[0](x, y) === 0 && e.f[1](x, y) === 0); return { text: ok ? 'yes' : 'no', good: ok }; }],
    ] },
  ],
  onChange: (s) => formula.update(s),
});
