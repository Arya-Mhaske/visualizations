import { createDrill } from '../../lib/drill.js';

// Reverse the derivative table. Multiple choice: pick the antiderivative. Typed: F(x0) when F(0) = 0.
const sup = { 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶' };
const KINDS = [
  { f: (a, n) => `${a * n}x${n - 1 === 1 ? '' : sup[n - 1]}`, F: (a, n) => `${a}x${sup[n]}`, wrong: (a, n) => [`${a * n * n}x${sup[n + 1] ?? '⁶'}`, `${a}x${sup[n - 1] ?? ''}`, `${a * n}x${sup[n]}`], why: (a, n) => `Raise the power by one (${n - 1} → ${n}) and divide by it: ${a * n}x^${n - 1} → ${a * n}x^${n}/${n} = ${a}x^${n}.`, eval: (a, n, x) => a * x ** n },
];
const SIMPLE = [
  { f: 'cos x', right: 'sin x + C', wrong: ['−sin x + C', 'cos x + C', '−cos x + C'], why: 'd/dx (sin x) = cos x.' },
  { f: 'sin x', right: '−cos x + C', wrong: ['cos x + C', 'sin x + C', '−sin x + C'], why: 'd/dx (−cos x) = sin x.' },
  { f: 'eˣ', right: 'eˣ + C', wrong: ['eˣ⁺¹ + C', 'x eˣ + C', 'eˣ/x + C'], why: 'eˣ is its own derivative.' },
  { f: '1/x  (x > 0)', right: 'ln x + C', wrong: ['−1/x² + C', '1/(2x²) + C', 'x ln x + C'], why: 'd/dx (ln x) = 1/x.' },
  { f: 'sec² x', right: 'tan x + C', wrong: ['sec x + C', '−cot x + C', 'tan² x + C'], why: 'd/dx (tan x) = sec² x.' },
  { f: '1/(1 + x²)', right: 'arctan x + C', wrong: ['ln(1 + x²) + C', 'arcsin x + C', '1/x + C'], why: 'd/dx (arctan x) = 1/(1 + x²).' },
];

createDrill({
  stage: document.querySelector('#stage'),
  panel: document.querySelector('#panel'),
  seed: 11,
  generate(rng) {
    if (rng.next() < 0.45) {
      const q = rng.pick(SIMPLE);
      const options = rng.shuffle([q.right, ...q.wrong.slice(0, 3)]);
      return { prompt: `Which one has derivative ${q.f}?`, options, answer: options.indexOf(q.right), hint: 'Differentiate each choice and compare.', explain: `${q.right}. ${q.why}` };
    }
    const n = rng.int(2, 5);
    const a = rng.int(1, 4);
    const x = rng.int(1, 3);
    const k = KINDS[0];
    const val = a * x ** n;
    return { prompt: `The rate is f(x) = ${k.f(a, n)}. Find the antiderivative F with F(0) = 0, and give F(${x}).`, answer: val, tolerance: 0.01, hint: 'Reverse the power rule, then use F(0) = 0 to fix C.', explain: `${k.why(a, n)} F(0) = 0 gives C = 0, so F(${x}) = ${a}·${x}^${n} = ${val}.` };
  },
});
