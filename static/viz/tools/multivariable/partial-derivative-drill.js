import { createDrill } from '../../lib/drill.js';

// f is a sum of terms c·xᵖ·yᵠ. Holding the other variable fixed, d/dx (c xᵖ yᵠ) = c p xᵖ⁻¹ yᵠ. All answers are exact integers.
const sup = (n) => (n === 1 ? '' : String(n).replace(/[0-9]/g, (d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[d]));
function termText(c, p, q, first) {
  const body = `${p ? `x${sup(p)}` : ''}${q ? `y${sup(q)}` : ''}`;
  const mag = Math.abs(c) === 1 && body ? '' : String(Math.abs(c));
  return `${first ? (c < 0 ? '−' : '') : c < 0 ? ' − ' : ' + '}${mag}${body}`;
}
const evalPartial = (terms, wrt, x, y) => terms.reduce((s, [c, p, q]) => s + (wrt === 'x' ? c * p * x ** Math.max(p - 1, 0) * y ** q : c * q * x ** p * y ** Math.max(q - 1, 0)), 0);

createDrill({
  stage: document.querySelector('#stage'),
  panel: document.querySelector('#panel'),
  seed: 14,
  generate(rng) {
    const count = rng.int(2, 3);
    const terms = [];
    while (terms.length < count) {
      const t = [rng.pick([-3, -2, -1, 1, 2, 3, 4]), rng.int(0, 3), rng.int(0, 3)];
      if (t[1] + t[2] > 0 && !terms.some((u) => u[1] === t[1] && u[2] === t[2])) terms.push(t);
    }
    const wrt = rng.pick(['x', 'y']);
    const [x, y] = [rng.int(-2, 3), rng.int(-2, 3)];
    const text = terms.map((t, i) => termText(...t, i === 0)).join('');
    const answer = evalPartial(terms, wrt, x, y);
    return {
      prompt: `For f(x, y) = ${text}, find f${wrt}(${x}, ${y}).`,
      answer,
      tolerance: 0.001,
      hint: `Treat ${wrt === 'x' ? 'y' : 'x'} as a constant and differentiate with respect to ${wrt}, then substitute.`,
      explain: `Differentiate term by term, keeping ${wrt === 'x' ? 'y' : 'x'} fixed. At (${x}, ${y}) the value is ${answer}.`,
    };
  },
});
