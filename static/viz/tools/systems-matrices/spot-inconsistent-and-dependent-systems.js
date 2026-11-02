import { createStepper } from '../../lib/stepper.js';
import { liveFormula } from '../../lib/formula.js';
import { num, rref, texNum } from './_sm-math.js';
import { SYSTEMS, VARS, augTex, equationsTex } from './_rowred-data.js';

const state = { which: 'none' };
const M = (s) => SYSTEMS[s.which].M;
const t = (x) => texNum(x, 3);

function reading(M3) {
  const { R, pivots } = rref(M3);
  if (pivots.includes(3)) return { kind: 'none', R, pivots };
  if (pivots.length === 3) return { kind: 'one', R, pivots };
  return { kind: 'many', R, pivots };
}

function steps(s) {
  const { R, pivots, kind } = reading(M(s));
  const list = [
    { text: 'The system.', tex: equationsTex(M(s)) },
    { text: 'Reduce the augmented matrix all the way (reduced row echelon form).', tex: augTex(R, t) },
  ];
  if (kind === 'none') {
    const bad = R.findIndex((r) => r.slice(0, 3).every((v) => Math.abs(v) < 1e-9) && Math.abs(r[3]) > 1e-9);
    list.push({ text: `Row ${bad + 1} says 0x + 0y + 0z = ${num(R[bad][3])}, which is false. A system containing a false equation has no solution: it is inconsistent.`, tex: `0=${t(R[bad][3])}\\ \\text{ is impossible}` });
  } else if (kind === 'one') {
    list.push({ text: 'Every column has a pivot and no row says 0 = 1. The solution can be read straight off.', tex: `x=${t(R[0][3])},\\ y=${t(R[1][3])},\\ z=${t(R[2][3])}` });
  } else {
    const free = [0, 1, 2].filter((j) => !pivots.includes(j));
    list.push({ text: `A row of zeros means one equation was a combination of the others. Column ${free.map((j) => VARS[j]).join(', ')} has no pivot, so ${free.map((j) => VARS[j]).join(', ')} is a free variable: choose it freely, and the others follow.`, tex: `${VARS[free[0]]}=t\\ \\text{(any number)}` });
    const sol = [0, 1, 2].map((j) => {
      if (j === free[0]) return 't';
      const row = pivots.indexOf(j);
      return `${t(R[row][3])}${R[row][free[0]] === 0 ? '' : `${-R[row][free[0]] < 0 ? '-' : '+'}${t(Math.abs(R[row][free[0]]))}t`}`;
    });
    list.push({ text: 'So there are infinitely many solutions, one for each value of t.', tex: `(x,\\ y,\\ z)=(${sol.join(',\\ ')})` });
  }
  return list;
}

const formula = liveFormula(document.querySelector('#formula'), (s) => augTex(M(s), t));
formula.update(state);

createStepper({
  stage: document.querySelector('#stage'),
  panel: document.querySelector('#panel'),
  state,
  steps,
  controls: [
    { title: 'Read the reduced matrix' },
    { key: 'which', label: 'System', options: ['none', 'many', 'unique'].map((k) => [k, SYSTEMS[k].name]) },
    { readout: [
      ['Verdict', (s) => { const k = reading(M(s)).kind; return { text: k === 'none' ? 'no solution' : k === 'one' ? 'exactly one' : 'infinitely many', good: k === 'one' }; }],
      ['Pivot columns', (s) => reading(M(s)).pivots.map((j) => (j === 3 ? 'right side' : VARS[j])).join(', ')],
    ] },
  ],
  onChange: (s) => formula.update(s),
});
