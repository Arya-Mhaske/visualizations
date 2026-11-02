import { createStepper } from '../../lib/stepper.js';
import { liveFormula } from '../../lib/formula.js';
import { factor, gcd, modpow, phi } from './_aa-math.js';

// Use Euler's theorem to shrink the exponent: a^e ≡ a^(e mod φ(n)) (mod n) whenever gcd(a, n) = 1.
const state = { a: 7, e: 222, n: 15 };

function factorTex(n) {
  const counts = new Map();
  factor(n).forEach((p) => counts.set(p, (counts.get(p) || 0) + 1));
  return [...counts].map(([p, k]) => (k > 1 ? `${p}^{${k}}` : `${p}`)).join('\\cdot ');
}
function phiTex(n) {
  const ps = [...new Set(factor(n))];
  if (ps.length === 0) return '1';
  return `${n}${ps.map((p) => `\\left(1-\\frac1{${p}}\\right)`).join('')}`;
}

function steps(s) {
  const { a, e, n } = s;
  const f = phi(n);
  const out = [{ text: `Are ${a} and ${n} coprime? Euler's theorem needs this.`, tex: `\\gcd(${a},${n})=${gcd(a, n)}` }];
  if (gcd(a, n) !== 1) {
    out.push({ text: 'They share a factor, so Euler\'s theorem does not apply. Square and multiply instead.', tex: `${a}^{${e}}\\equiv ${modpow(a, e, n)}\\pmod{${n}}` });
    return out;
  }
  out.push({ text: `Factor n to find φ(n).`, tex: `${n}=${factorTex(n)}` });
  out.push({ text: `Each prime p dividing n removes a fraction 1/p of the numbers.`, tex: `\\varphi(${n})=${phiTex(n)}=${f}` });
  out.push({ text: `So ${a}^${f} ≡ 1. Divide the exponent by ${f} and keep the remainder.`, tex: `${e}=${Math.floor(e / f)}\\cdot ${f}+${e % f}` });
  out.push({ text: 'The whole blocks of φ(n) become 1 and drop out.', tex: `${a}^{${e}}=(${a}^{${f}})^{${Math.floor(e / f)}}\\cdot ${a}^{${e % f}}\\equiv 1\\cdot ${a}^{${e % f}}` });
  out.push({ text: 'Finish with a small power.', tex: `${a}^{${e % f}}\\equiv ${modpow(a, e % f, n)}\\pmod{${n}}` });
  out.push({ text: 'Check against the direct calculation by square and multiply.', tex: `${a}^{${e}}\\equiv ${modpow(a, e, n)}\\pmod{${n}}` });
  return out;
}

const formula = liveFormula(document.querySelector('#formula'), (s) => `${s.a}^{${s.e}}\\equiv ${modpow(s.a, s.e, s.n)}\\pmod{${s.n}},\\quad \\varphi(${s.n})=${phi(s.n)}`);
formula.update(state);

createStepper({
  stage: document.querySelector('#stage'),
  panel: document.querySelector('#panel'),
  state,
  steps,
  controls: [
    { title: 'Choose a power' },
    { key: 'a', label: 'Base, a', min: 2, max: 30, step: 1 },
    { key: 'e', label: 'Exponent, e', min: 2, max: 999, step: 1 },
    { key: 'n', label: 'Modulus, n', min: 2, max: 60, step: 1 },
    { readout: [['φ(n)', (s) => String(phi(s.n))], ['Answer', (s) => String(modpow(s.a, s.e, s.n))]] },
  ],
  onChange: (s) => formula.update(s),
});
