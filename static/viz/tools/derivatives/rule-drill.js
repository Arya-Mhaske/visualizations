import { createDrill } from '../../lib/drill.js';

// Each kind: a function, its derivative, the rule to pick, and a worked explanation. All derivatives are exact.
const KINDS = [
  { rule: 'Power rule', make: (r) => { const n = r.int(2, 5); const k = r.int(2, 6); return { tex: `${k}x^{${n}}`, d: (x) => k * n * x ** (n - 1), why: `${k}·${n}·x^${n - 1}: bring the power down, lower it by one.` }; } },
  { rule: 'Product rule', make: (r) => { const m = r.int(1, 3); const n = r.int(1, 3); return { tex: `x^{${m}}\\,(x+${n})`, d: (x) => m * x ** (m - 1) * (x + n) + x ** m, why: `u′v + uv′ with u = x^${m}, v = x + ${n}.` }; } },
  { rule: 'Quotient rule', make: (r) => { const n = r.int(2, 4); const k = r.int(1, 3); return { tex: `\\dfrac{x^{${n}}}{x+${k}}`, d: (x) => (n * x ** (n - 1) * (x + k) - x ** n) / (x + k) ** 2, why: `(u′v − uv′) ÷ v² with u = x^${n}, v = x + ${k}.` }; } },
  { rule: 'Sum rule', make: (r) => { const a = r.int(2, 5); const b = r.int(1, 6); return { tex: `x^{${a}}+${b}x`, d: (x) => a * x ** (a - 1) + b, why: `Differentiate each term: ${a}x^${a - 1} + ${b}.` }; } },
];
const RULES = KINDS.map((k) => k.rule);

createDrill({
  stage: document.querySelector('#stage'),
  panel: document.querySelector('#panel'),
  seed: 3,
  generate(rng) {
    const kind = rng.pick(KINDS);
    const q = kind.make(rng);
    if (rng.next() < 0.5) {
      const options = RULES.slice();
      return { prompt: 'Which rule do you use first to differentiate this?', tex: `f(x)=${q.tex}`, options, answer: options.indexOf(kind.rule), hint: 'Look at how the pieces are joined: added, multiplied or divided?', explain: `${kind.rule}. ${q.why}` };
    }
    const x = rng.int(1, 3);
    return { prompt: `Find f′(${x}). Give a number.`, tex: `f(x)=${q.tex}`, answer: Number(q.d(x).toFixed(6)), tolerance: 0.01, hint: `Use the ${kind.rule.toLowerCase()}, then put x = ${x}.`, explain: `${q.why} At x = ${x} this is ${Number(q.d(x).toFixed(4))}.` };
  },
});
