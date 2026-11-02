import { createDrill } from '../../lib/drill.js';

// Match a function to its antiderivative. Each row is checked: d/dx of the answer is the question.
const TABLE = [
  ['xⁿ  (n ≠ −1), say x⁵', 'x⁶/6 + C'],
  ['1/x', 'ln|x| + C'],
  ['eˣ', 'eˣ + C'],
  ['aˣ  (say 2ˣ)', '2ˣ / ln 2 + C'],
  ['sin x', '−cos x + C'],
  ['cos x', 'sin x + C'],
  ['sec² x', 'tan x + C'],
  ['csc² x', '−cot x + C'],
  ['sec x tan x', 'sec x + C'],
  ['1/√(1 − x²)', 'arcsin x + C'],
  ['1/(1 + x²)', 'arctan x + C'],
  ['sinh x', 'cosh x + C'],
  ['cosh x', 'sinh x + C'],
  ['√x', '(2/3) x^(3/2) + C'],
  ['1/x²', '−1/x + C'],
];

createDrill({
  stage: document.querySelector('#stage'),
  panel: document.querySelector('#panel'),
  seed: 21,
  generate(rng) {
    const [f, F] = rng.pick(TABLE);
    const wrong = rng.shuffle(TABLE.filter((r) => r[1] !== F)).slice(0, 3).map((r) => r[1]);
    const options = rng.shuffle([F, ...wrong]);
    return { prompt: `Which one is an antiderivative of ${f}?`, options, answer: options.indexOf(F), hint: 'Differentiate each choice. The right one gives back the function.', explain: `${F}: its derivative is ${f}.` };
  },
});
