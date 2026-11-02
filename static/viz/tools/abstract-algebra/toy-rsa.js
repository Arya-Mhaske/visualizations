import { createStepper } from '../../lib/stepper.js';
import { liveFormula } from '../../lib/formula.js';
import { egcd, gcd, mod, modpow } from './_aa-math.js';

// RSA with tiny primes, to see every step. Real RSA uses primes hundreds of digits long.
const PRIMES = [5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43];
const state = { pi: 1, qi: 2, ei: 1, m: 42 };

export function toy(s) {
  const p = PRIMES[s.pi];
  const q = PRIMES[s.qi === s.pi ? (s.qi + 1) % PRIMES.length : s.qi];
  const n = p * q;
  const phi = (p - 1) * (q - 1);
  const es = [];
  for (let e = 3; e < phi && es.length < 6; e++) if (gcd(e, phi) === 1) es.push(e);
  const e = es[Math.min(s.ei, es.length - 1)];
  const d = mod(egcd(e, phi).x, phi);
  const m = mod(s.m, n);
  const c = modpow(m, e, n);
  return { p, q, n, phi, es, e, d, m, c, back: modpow(c, d, n) };
}

function steps(s) {
  const t = toy(s);
  return [
    { text: 'Pick two secret primes.', tex: `p=${t.p},\\quad q=${t.q}` },
    { text: 'Publish their product. Keep p and q secret.', tex: `n=pq=${t.n}` },
    { text: 'Only someone who knows the factors can compute φ(n) = (p − 1)(q − 1).', tex: `\\varphi(n)=${t.p - 1}\\cdot ${t.q - 1}=${t.phi}` },
    { text: `Choose a public exponent e with no factor in common with φ(n). Allowed: ${t.es.join(', ')}…`, tex: `e=${t.e},\\quad \\gcd(${t.e},${t.phi})=1` },
    { text: 'The private exponent d undoes e mod φ(n). Find it with the extended Euclidean algorithm.', tex: `d=e^{-1}\\bmod ${t.phi}=${t.d},\\quad ${t.e}\\cdot ${t.d}=${t.e * t.d}\\equiv 1` },
    { text: `The public key is (n, e) = (${t.n}, ${t.e}). Encrypt the message m = ${t.m}.`, tex: `c=m^e\\bmod n=${t.m}^{${t.e}}\\bmod ${t.n}=${t.c}` },
    { text: 'Decrypt with the private key. Euler\'s theorem makes the exponent e·d collapse to 1.', tex: `c^d\\bmod n=${t.c}^{${t.d}}\\bmod ${t.n}=${t.back}` },
    { text: t.back === t.m ? 'The message is back.' : 'Something went wrong: the message did not return.' },
  ];
}

const formula = liveFormula(document.querySelector('#formula'), (s) => { const t = toy(s); return `m^{ed}\\equiv m\\pmod{${t.n}}:\\ ${t.m}\\to ${t.c}\\to ${t.back}`; });
formula.update(state);

createStepper({
  stage: document.querySelector('#stage'),
  panel: document.querySelector('#panel'),
  state,
  steps,
  controls: [
    { title: 'Make your keys' },
    { key: 'pi', label: 'Prime p', min: 0, max: 11, step: 1, format: (v) => String(PRIMES[v]) },
    { key: 'qi', label: 'Prime q', min: 0, max: 11, step: 1, format: (v) => String(toy({ ...state, qi: v }).q) },
    { key: 'ei', label: 'Public exponent e (choice)', min: 0, max: 5, step: 1, format: (v) => String(toy({ ...state, ei: v }).e) },
    { key: 'm', label: 'Message m', min: 2, max: 500, step: 1 },
    { readout: [['n = pq', (s) => String(toy(s).n)], ['Ciphertext', (s) => String(toy(s).c)], ['Decrypted', (s) => String(toy(s).back)]] },
  ],
  onChange: (s) => formula.update(s),
});
