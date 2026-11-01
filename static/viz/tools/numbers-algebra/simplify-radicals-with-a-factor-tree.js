import { createStepper } from '../../lib/stepper.js';
import { liveFormula } from '../../lib/formula.js';

const state = { n: 72 };
const primes = (n) => { const out = []; let m = n; for (let p = 2; p * p <= m; p++) while (m % p === 0) { out.push(p); m /= p; } if (m > 1) out.push(m); return out; };
const tally = (list) => list.reduce((acc, p) => ({ ...acc, [p]: (acc[p] || 0) + 1 }), {});
function parts(n) {
  const t = tally(primes(n));
  let out = 1;
  let inside = 1;
  for (const [p, k] of Object.entries(t)) { out *= Number(p) ** Math.floor(k / 2); inside *= Number(p) ** (k % 2); }
  return { t, out, inside };
}
const steps = (s) => {
  const { t, out, inside } = parts(s.n);
  const list = primes(s.n);
  return [
    { text: 'Break the number into prime factors, a factor tree.', tex: `${s.n}=${list.join('\\cdot')}` },
    { text: 'Group equal primes in pairs. Each pair is a perfect square.', tex: `\\sqrt{${s.n}}=\\sqrt{${Object.entries(t).map(([p, k]) => (k > 1 ? `${p}^{${k}}` : p)).join('\\cdot')}}` },
    { text: 'A pair under the root comes out as one factor, since √(p²) = p. Whatever is left unpaired stays under the root.', tex: `\\text{out: }${out},\\quad \\text{left inside: }${inside}` },
    { text: 'Write the answer.', tex: out === 1 ? `\\sqrt{${s.n}}\\ \\text{cannot be simplified}` : inside === 1 ? `\\sqrt{${s.n}}=${out}` : `\\sqrt{${s.n}}=${out}\\sqrt{${inside}}` },
    { text: 'Check by squaring: out² × inside should give back the number.', tex: `${out}^2\\cdot ${inside}=${out * out * inside}` },
  ];
};
const stageEl = document.querySelector('#stage');
const formula = liveFormula(document.querySelector('#formula'), (s) => { const p = parts(s.n); return p.out === 1 ? `\\sqrt{${s.n}}` : p.inside === 1 ? `\\sqrt{${s.n}}=${p.out}` : `\\sqrt{${s.n}}=${p.out}\\sqrt{${p.inside}}`; });
formula.update(state);
createStepper({
  stage: stageEl,
  panel: document.querySelector('#panel'),
  state,
  steps,
  controls: [
    { title: 'Choose a number' },
    { key: 'n', label: 'Radicand', min: 2, max: 500, step: 1 },
    { readout: [
      ['Prime factors', (s) => primes(s.n).join(' × ')],
      ['Simplified', (s) => { const p = parts(s.n); return p.out === 1 ? `√${s.n}` : p.inside === 1 ? `${p.out}` : `${p.out}√${p.inside}`; }],
    ] },
  ],
  onChange(s) { formula.update(s); },
});
