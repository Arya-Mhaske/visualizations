import { createStepper } from '../../lib/stepper.js';
import { liveFormula } from '../../lib/formula.js';
import { egcd } from './_aa-math.js';

// Euclid's divisions, then back-substitution: write the last nonzero remainder as x·a + y·b.
const state = { a: 14, b: 18 };

// Returns { g, x, y, divisions, lines } where every line is a statement g = p·r[j] + q·r[j+1].
export function backSubstitute(a, b) {
  const { rows } = egcd(a, b);
  const r = [a, b, ...rows.map((row) => row.r)];
  const m = rows.length;
  const g = r[m];
  const lines = [];
  let pair;
  let j;
  if (m < 2) {
    pair = [0, 1];
    j = 0;
  } else {
    pair = [1, -rows[m - 2].q];
    j = m - 2;
    lines.push({ at: j, pair: [...pair] });
    for (; j >= 1; j--) {
      const q = rows[j - 1].q;
      pair = [pair[1], pair[0] - pair[1] * q];
      lines.push({ at: j - 1, pair: [...pair] });
    }
  }
  return { g, x: pair[0], y: pair[1], rows, r, lines };
}

const par = (n) => (n < 0 ? `(${n})` : `${n}`);

function steps(s) {
  const out = backSubstitute(s.a, s.b);
  const list = out.rows.map((row) => ({ text: `Divide: ${row.a} by ${row.b}.`, tex: `${row.a}=${row.q}\\cdot ${row.b}+${row.r}` }));
  list.push({ text: `The last nonzero remainder is ${out.g}, so gcd(${s.a}, ${s.b}) = ${out.g}.` });
  if (out.rows.length < 2) {
    list.push({ text: `${s.b} divides ${s.a}, so no substitution is needed.`, tex: `${out.g}=0\\cdot ${s.a}+1\\cdot ${s.b}` });
  } else {
    out.lines.forEach((line, i) => {
      const [x, y] = line.pair;
      const text = i === 0 ? 'Solve the last division for the gcd.' : `Replace ${par(out.r[line.at + 2])} using the division above it, and collect terms.`;
      list.push({ text, tex: `${out.g}=${par(x)}\\cdot ${out.r[line.at]}+${par(y)}\\cdot ${out.r[line.at + 1]}` });
    });
  }
  list.push({ text: 'Check by multiplying out.', tex: `${par(out.x)}\\cdot ${s.a}+${par(out.y)}\\cdot ${s.b}=${out.x * s.a + out.y * s.b}` });
  return list;
}

const formula = liveFormula(document.querySelector('#formula'), (s) => {
  const o = backSubstitute(s.a, s.b);
  return `\\gcd(${s.a},${s.b})=${o.g}=${par(o.x)}\\cdot ${s.a}+${par(o.y)}\\cdot ${s.b}`;
});
formula.update(state);

createStepper({
  stage: document.querySelector('#stage'),
  panel: document.querySelector('#panel'),
  state,
  steps,
  controls: [
    { title: 'Choose two numbers' },
    { key: 'a', label: 'a', min: 2, max: 99, step: 1 },
    { key: 'b', label: 'b', min: 2, max: 99, step: 1 },
    { readout: [['gcd', (s) => String(backSubstitute(s.a, s.b).g)]] },
  ],
  onChange: (s) => formula.update(s),
});
