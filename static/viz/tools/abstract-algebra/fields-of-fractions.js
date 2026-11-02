import { createStepper } from '../../lib/stepper.js';
import { liveFormula } from '../../lib/formula.js';
import { gcd } from './_aa-math.js';

// ℚ built from ℤ: a fraction is a pair (a, b) with b ≠ 0, and (a, b) ~ (c, d) when ad = bc. Add and multiply pairs by the school rules.
const state = { a: 1, b: 2, c: 2, d: 3, k: 2 };
const same = (p, q) => p[0] * q[1] === p[1] * q[0];
const add = (p, q) => [p[0] * q[1] + p[1] * q[0], p[1] * q[1]];
const mul = (p, q) => [p[0] * q[0], p[1] * q[1]];
const lowest = (p) => { const g = gcd(p[0], p[1]) || 1; return [p[0] / g, p[1] / g]; };
const pr = (p) => `(${p[0]},\\,${p[1]})`;
const fr = (p) => (p[1] === 1 ? `${p[0]}` : `\\frac{${p[0]}}{${p[1]}}`);

export const sum = (s) => add([s.a, s.b], [s.c, s.d]);
export const product = (s) => mul([s.a, s.b], [s.c, s.d]);
export const sumWithBigger = (s) => add([s.k * s.a, s.k * s.b], [s.c, s.d]);

function steps(s) {
  const P = [s.a, s.b];
  const Q = [s.c, s.d];
  const bigger = [s.k * s.a, s.k * s.b];
  return [
    { text: 'A fraction is just a pair of integers (top, bottom) with a non-zero bottom.', tex: `P=${pr(P)},\\quad Q=${pr(Q)}` },
    { text: 'Two pairs are the same fraction when ad = bc, with no division needed.', tex: `${pr(P)}\\sim${pr(bigger)}:\\ ${P[0]}\\cdot ${bigger[1]}=${P[1]}\\cdot ${bigger[0]}\\ \\Rightarrow\\ ${P[0] * bigger[1]}=${P[1] * bigger[0]}` },
    { text: 'Add by the rule for common denominators.', tex: `P+Q=${pr(add(P, Q))}\\sim${pr(lowest(add(P, Q)))}=${fr(lowest(add(P, Q)))}` },
    { text: 'Multiply top by top and bottom by bottom.', tex: `PQ=${pr(mul(P, Q))}\\sim${pr(lowest(mul(P, Q)))}=${fr(lowest(mul(P, Q)))}` },
    { text: `Swap P for the equal pair ${pr(bigger)} and add again.`, tex: `${pr(bigger)}+Q=${pr(sumWithBigger(s))}\\sim${pr(lowest(sumWithBigger(s)))}` },
    { text: same(add(P, Q), sumWithBigger(s)) ? 'Same fraction as before. The sum does not depend on which pair you pick, so + is well defined on the classes.' : 'The two answers differ: the rule would not be well defined.', tex: `${pr(add(P, Q))}\\sim${pr(sumWithBigger(s))}:\\ ${add(P, Q)[0] * sumWithBigger(s)[1]}=${add(P, Q)[1] * sumWithBigger(s)[0]}` },
    { text: 'Every non-zero pair (a, b) has an inverse (b, a), so the classes form a field: the rational numbers.', tex: `${pr(P)}\\cdot (${P[1]},\\,${P[0]})=${pr(mul(P, [P[1], P[0]]))}\\sim(1,\\,1)` },
  ];
}

const formula = liveFormula(document.querySelector('#formula'), (s) => `\\frac{${s.a}}{${s.b}}+\\frac{${s.c}}{${s.d}}=${fr(lowest(sum(s)))},\\quad \\frac{${s.a}}{${s.b}}\\cdot\\frac{${s.c}}{${s.d}}=${fr(lowest(product(s)))}`);
formula.update(state);

createStepper({
  stage: document.querySelector('#stage'),
  panel: document.querySelector('#panel'),
  state,
  steps,
  controls: [
    { title: 'Two pairs' },
    { key: 'a', label: 'Top of P', min: 1, max: 9, step: 1 },
    { key: 'b', label: 'Bottom of P', min: 1, max: 9, step: 1 },
    { key: 'c', label: 'Top of Q', min: 1, max: 9, step: 1 },
    { key: 'd', label: 'Bottom of Q', min: 1, max: 9, step: 1 },
    { key: 'k', label: 'Swap P for k copies of it', min: 2, max: 6, step: 1 },
    { readout: [['P + Q in lowest terms', (s) => lowest(sum(s)).join(' / ')], ['P · Q in lowest terms', (s) => lowest(product(s)).join(' / ')]] },
  ],
  onChange: (s) => formula.update(s),
});
