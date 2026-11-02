import { createStepper } from '../../lib/stepper.js';

// Two families. Each row is one n; the steps reveal the table row by row, then the pattern.
const fact = (n) => (n <= 1 ? 1 : n * fact(n - 1));
const gcd = (a, b) => (b ? gcd(b, a % b) : a);
// antiderivative of x^k e^x: e^x × (x^k − k x^(k−1) + k(k−1) x^(k−2) − …)
function xe(k) {
  let out = '';
  for (let j = k; j >= 0; j--) {
    const coef = fact(k) / fact(j);
    const sign = (k - j) % 2 ? '-' : out ? '+' : '';
    const pow = j === 0 ? '' : j === 1 ? 'x' : `x^{${j}}`;
    out += `${sign}${coef === 1 && pow ? '' : coef}${pow}`;
  }
  return `e^x\\left(${out}\\right)+C`;
}
// ∫₀^{π/2} sinⁿ x dx as a TeX fraction (times π/2 for even n)
function wallis(n) {
  let num = 1;
  let den = 1;
  for (let k = n; k >= 2; k -= 2) { num *= k - 1; den *= k; }
  const g = gcd(num, den);
  num /= g;
  den /= g;
  const frac = den === 1 ? `${num}` : `\\dfrac{${num}}{${den}}`;
  return n % 2 === 0 ? (num === 1 && den === 1 ? '\\dfrac{\\pi}{2}' : `${frac}\\cdot\\dfrac{\\pi}{2}`) : frac;
}
const FAMILIES = { xe: 'x ⁿ eˣ', wallis: 'sinⁿ x from 0 to π/2' };
const state = { fam: 'xe', n: 4 };

createStepper({
  stage: document.querySelector('#stage'),
  panel: document.querySelector('#panel'),
  state,
  controls: [
    { title: 'Find the pattern' },
    { key: 'fam', label: 'Family', options: Object.entries(FAMILIES) },
    { key: 'n', label: 'Up to n =', min: 2, max: 6, step: 1 },
  ],
  steps: (s) => {
    const out = [{ text: s.fam === 'xe' ? 'Do ∫ xⁿ eˣ dx for n = 0, 1, 2, … and look down the column.' : 'Do ∫₀^(π/2) sinⁿ x dx for n = 0, 1, 2, … and look down the column.' }];
    for (let n = 0; n <= s.n; n++) {
      out.push(s.fam === 'xe'
        ? { text: `n = ${n}:`, tex: `\\int x^{${n}}e^x\\,dx=${xe(n)}` }
        : { text: `n = ${n}:`, tex: `I_{${n}}=${wallis(n)}` });
    }
    out.push(s.fam === 'xe'
      ? { text: 'The pattern: each row is eˣ times the row before, with x added and the signs alternating. In symbols, parts gives a reduction formula.', tex: '\\int x^ne^x\\,dx=x^ne^x-n\\int x^{n-1}e^x\\,dx' }
      : { text: 'The pattern: every second row is the row before, times (n − 1)/n. The odd rows never gain a π.', tex: 'I_n=\\dfrac{n-1}{n}\\,I_{n-2}' });
    return out;
  },
});
