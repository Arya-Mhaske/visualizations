import { createStepper } from '../../lib/stepper.js';
import { liveFormula } from '../../lib/formula.js';
import { gcd, lcm, mod } from './_aa-math.js';

// Solve x ≡ a (mod m) and x ≡ b (mod n). List the numbers that fit the first, and test each against the second.
const state = { m: 3, n: 5, a: 2, b: 3 };

export function solve(s) {
  const [m, n] = [s.m, s.n];
  const a = mod(s.a, m);
  const b = mod(s.b, n);
  const g = gcd(m, n);
  const L = lcm(m, n);
  const tried = [];
  let found = null;
  for (let t = 0; t < L / m; t++) {
    const x = a + t * m;
    tried.push({ x, r: x % n });
    if (x % n === b) { found = x; break; }
  }
  return { a, b, g, L, tried, found };
}

function steps(s) {
  const o = solve(s);
  const out = [
    { text: `Rewrite with remainders in range.`, tex: `x\\equiv ${o.a}\\pmod{${s.m}},\\qquad x\\equiv ${o.b}\\pmod{${s.n}}` },
    { text: `The moduli share the factor ${o.g}. ${o.g === 1 ? 'They are coprime, so there is exactly one answer mod ' : 'A solution exists only if the remainders agree mod that factor; the answer is unique mod '}${o.L}.`, tex: `\\gcd(${s.m},${s.n})=${o.g},\\quad \\operatorname{lcm}=${o.L}` },
    { text: `List the numbers that satisfy the first condition and find their remainders mod ${s.n}.`, tex: o.tried.map((t) => `${t.x}\\to ${t.r}`).join(',\\ ') },
  ];
  if (o.found === null) {
    out.push({ text: `None of them leaves remainder ${o.b}, so there is no solution: the two conditions contradict each other.` });
  } else {
    out.push({ text: `${o.found} is the first to leave remainder ${o.b}. Every other solution differs from it by a multiple of ${o.L}.`, tex: `x\\equiv ${o.found}\\pmod{${o.L}}` });
    out.push({ text: 'Check both conditions.', tex: `${o.found}=${Math.floor(o.found / s.m)}\\cdot ${s.m}+${o.found % s.m},\\quad ${o.found}=${Math.floor(o.found / s.n)}\\cdot ${s.n}+${o.found % s.n}` });
  }
  return out;
}

const formula = liveFormula(document.querySelector('#formula'), (s) => {
  const o = solve(s);
  return o.found === null ? `x\\equiv ${o.a}\\ (${s.m}),\\ x\\equiv ${o.b}\\ (${s.n}):\\ \\text{no solution}` : `x\\equiv ${o.found}\\pmod{${o.L}}`;
});
formula.update(state);

createStepper({
  stage: document.querySelector('#stage'),
  panel: document.querySelector('#panel'),
  state,
  steps,
  controls: [
    { title: 'Two congruences' },
    { key: 'm', label: 'First modulus, m', min: 2, max: 20, step: 1 },
    { key: 'a', label: 'x ≡ a (mod m)', min: 0, max: 19, step: 1 },
    { key: 'n', label: 'Second modulus, n', min: 2, max: 20, step: 1 },
    { key: 'b', label: 'x ≡ b (mod n)', min: 0, max: 19, step: 1 },
    { readout: [['Solution', (s) => { const o = solve(s); return o.found === null ? 'none' : `${o.found} mod ${o.L}`; }]] },
  ],
  onChange: (s) => formula.update(s),
});
