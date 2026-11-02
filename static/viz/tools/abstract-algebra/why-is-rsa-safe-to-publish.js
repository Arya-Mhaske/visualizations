import { createTool } from '../../lib/tool.js';
import { label } from '../../lib/draw.js';
import { egcd, gcd, mod, modpow, nextPrime, squaring } from './_aa-math.js';

// Publish n = p·q and e. Encrypting is quick. Decrypting needs d, which needs φ(n) = (p − 1)(q − 1), which needs the factors of n.
const state = { bits: 12, m: 1234 };

export function keys(bits) {
  const p = nextPrime(2 ** bits);
  const q = nextPrime(2 ** bits + 2 ** (bits - 1) + 7);
  const n = p * q;
  const phi = (p - 1) * (q - 1);
  const e = [65537, 257, 17, 5, 3].find((c) => c < phi && gcd(c, phi) === 1);
  const d = mod(egcd(e, phi).x, phi);
  return { p, q, n, phi, e, d };
}
function trialDivisions(n) {
  let count = 0;
  for (let t = 3; t * t <= n; t += 2) {
    count++;
    if (n % t === 0) break;
  }
  return count;
}
const facts = (s) => {
  const k = keys(s.bits);
  const m = s.m % k.n;
  const c = modpow(m, k.e, k.n);
  const bits = squaring(m, k.e, k.n);
  const back = squaring(c, k.d, k.n);
  return { ...k, m, c, back: modpow(c, k.d, k.n), workBack: back.squarings + back.multiplications, work: bits.squarings + bits.multiplications, attack: trialDivisions(k.n) };
};
const pretty = (x) => (x >= 1e6 ? `${(x / 1e6).toFixed(1)} million` : x.toLocaleString('en-IN'));

createTool({
  state,
  label: 'Three bars on a logarithmic scale. The first two are the work to encrypt and to decrypt when you hold the private key. The third is the work to find the secret by trial division of n. The third bar grows far faster than the first two as the primes get larger.',
  draw(ctx, stage, c) {
    const f = facts(state);
    const bars = [['Encrypt with (n, e)', f.work, c.fillB], ['Decrypt with d', f.workBack, c.fillC], ['Break n by trial division', f.attack, c.fillA]];
    const top = 7;
    const x0 = 14;
    const bw = stage.w - 28;
    bars.forEach(([name, value, fill], i) => {
      const y = 28 + i * (stage.h - 60) / 3;
      const hh = (stage.h - 60) / 3 - 14;
      const len = (Math.log10(Math.max(1, value)) / top) * bw;
      ctx.fillStyle = fill;
      ctx.fillRect(x0, y, Math.max(len, 2), hh);
      ctx.strokeStyle = c.ink;
      ctx.lineWidth = 3;
      ctx.strokeRect(x0, y, Math.max(len, 2), hh);
      label(ctx, `${name}: ${pretty(value)} steps`, x0 + 4, y - 9, c, { size: 11, align: 'left', patch: false });
    });
    ['1', '10', '10²', '10³', '10⁴', '10⁵', '10⁶', '10⁷'].forEach((t, k) => label(ctx, t, x0 + (k / top) * bw, stage.h - 12, c, { size: 10, bounds: stage }));
  },
  controls: [
    { title: 'Make the primes bigger' },
    { key: 'bits', label: 'Size of the primes, in bits', min: 4, max: 20, step: 1 },
    { key: 'm', label: 'Message number', min: 2, max: 99999, step: 1 },
    { readout: [
      ['p and q (secret)', (s) => `${keys(s.bits).p} and ${keys(s.bits).q}`],
      ['n = pq (public)', (s) => String(keys(s.bits).n)],
      ['e (public)', (s) => String(keys(s.bits).e)],
      ['φ(n) (secret)', (s) => String(keys(s.bits).phi)],
      ['d (secret)', (s) => String(keys(s.bits).d)],
      ['Ciphertext', (s) => String(facts(s).c)],
      ['Decrypted', (s) => String(facts(s).back)],
    ] },
  ],
  tex: (s) => { const f = facts(s); return `c=${f.m}^{${f.e}}\\bmod ${f.n}=${f.c}`; },
});
