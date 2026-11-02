import { createStepper } from '../../lib/stepper.js';
import { liveFormula } from '../../lib/formula.js';
import { NONNEG, best, improvesForever, num, vertices } from './_sm-math.js';

const PROBLEMS = {
  max: { name: 'Maximise 3x + 2y (bounded)', a: 3, b: 2, maximise: true, cons: [{ a: 2, b: 1, c: 12, op: '<=' }, { a: 1, b: 2, c: 10, op: '<=' }, ...NONNEG] },
  min: { name: 'Minimise 3x + 2y (unbounded region)', a: 3, b: 2, maximise: false, cons: [{ a: 1, b: 1, c: 4, op: '>=' }, { a: 1, b: 3, c: 6, op: '>=' }, ...NONNEG] },
  none: { name: 'Minimise x − y (no minimum)', a: 1, b: -1, maximise: false, cons: [{ a: 1, b: 1, c: 4, op: '>=' }, { a: 1, b: 3, c: 6, op: '>=' }, ...NONNEG] },
};
const state = { which: 'max' };
const pr = (s) => PROBLEMS[s.which];
const obj = (s) => ([x, y]) => pr(s).a * x + pr(s).b * y;
const sym = (k) => (k.op === '<=' ? '\\le' : '\\ge');
const terms = (k) => `${k.a === 0 ? '' : `${k.a === 1 ? '' : k.a}x`}${k.b === 0 ? '' : `${k.a === 0 ? '' : '+'}${k.b === 1 ? '' : k.b}y`}`;

function steps(s) {
  const p = pr(s);
  const f = obj(s);
  const verts = vertices(p.cons);
  const endless = improvesForever(p.cons, f, p.maximise);
  const word = p.maximise ? 'largest' : 'smallest';
  const list = [
    { text: 'The constraints, with x ≥ 0 and y ≥ 0.', tex: p.cons.map((k) => `${terms(k)}${sym(k)}${k.c}`).join(',\\ ') },
    { text: 'Find the corner points: intersect pairs of boundary lines and keep the points that satisfy every constraint.', tex: verts.map(([x, y]) => `(${num(x)},\\,${num(y)})`).join(',\\ ') },
    { text: `Evaluate Z = ${p.a}x ${p.b < 0 ? '−' : '+'} ${Math.abs(p.b)}y at every corner.`, tex: verts.map(([x, y]) => `Z(${num(x)},${num(y)})=${num(f([x, y]))}`).join(',\\ ') },
  ];
  if (endless) {
    list.push({ text: 'The region is unbounded and Z can keep improving in a direction the region allows. So there is no optimum, whatever the corner values are.', tex: '\\text{no ' + (p.maximise ? 'maximum' : 'minimum') + '}' });
    return list;
  }
  const b = best(verts, f, p.maximise);
  list.push({ text: `The ${word} corner value is the candidate: ${num(f(b))} at (${num(b[0])}, ${num(b[1])}).`, tex: `M=${num(f(b))}` });
  if (verts.length && p.cons.length > 3 && !p.maximise) list.push({ text: 'The region is unbounded, so the candidate must be checked: the open half-plane Z < M must not meet the region. Here Z only grows along the region, so it does not.', tex: `\\text{minimum}=${num(f(b))}` });
  else list.push({ text: 'The region is bounded, so a maximum and a minimum both exist and sit at corners.', tex: `\\text{${p.maximise ? 'maximum' : 'minimum'}}=${num(f(b))}` });
  return list;
}

const formula = liveFormula(document.querySelector('#formula'), (s) => `Z=${pr(s).a}x${pr(s).b < 0 ? '-' : '+'}${Math.abs(pr(s).b)}y`);
formula.update(state);

createStepper({
  stage: document.querySelector('#stage'),
  panel: document.querySelector('#panel'),
  state,
  steps,
  controls: [
    { title: 'Choose a problem' },
    { key: 'which', label: 'Problem', options: Object.entries(PROBLEMS).map(([key, v]) => [key, v.name]) },
    { readout: [
      ['Corner points', (s) => String(vertices(pr(s).cons).length)],
      ['Optimum exists?', (s) => { const e = improvesForever(pr(s).cons, obj(s), pr(s).maximise); return { text: e ? 'no' : 'yes', good: !e }; }],
    ] },
  ],
  onChange: (s) => formula.update(s),
});
