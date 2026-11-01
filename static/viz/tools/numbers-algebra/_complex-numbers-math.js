// Pure maths for the Complex Numbers box. A complex number is [re, im]. No DOM.
import { fixed } from '../../lib/format.js';

export const add = (z, w) => [z[0] + w[0], z[1] + w[1]];
export const mul = (z, w) => [z[0] * w[0] - z[1] * w[1], z[0] * w[1] + z[1] * w[0]];
export const conj = (z) => [z[0], -z[1]];
export const norm2 = (z) => z[0] * z[0] + z[1] * z[1];
export const modulus = (z) => Math.hypot(z[0], z[1]);
export const argDeg = (z) => (Math.atan2(z[1], z[0]) * 180) / Math.PI;
export const div = (z, w) => {
  const n = norm2(w);
  const top = mul(z, conj(w));
  return [top[0] / n, top[1] / n];
};
export const POWERS_OF_I = [[1, 0], [0, 1], [-1, 0], [0, -1]];
export const iPower = (n) => POWERS_OF_I[((n % 4) + 4) % 4];
// z · iⁿ with exact integer arithmetic (no floats), so a drill can trust it
export const rotateByI = (z, n) => {
  let out = z;
  for (let k = 0; k < ((n % 4) + 4) % 4; k++) out = [-out[1], out[0]];
  return out;
};

// ---- text ----
const minus = (text) => text.replace(/-/g, '−');
export function showComplex(z, digits = 2) {
  const re = Number(z[0].toFixed(digits));
  const im = Number(z[1].toFixed(digits));
  if (im === 0) return minus(String(re));
  const imText = Math.abs(im) === 1 ? '' : String(Math.abs(im));
  if (re === 0) return minus(`${im < 0 ? '-' : ''}${imText}i`);
  return minus(`${re} ${im < 0 ? '-' : '+'} ${imText}i`);
}
export function texComplex(z, digits = 2) {
  const re = Number(z[0].toFixed(digits));
  const im = Number(z[1].toFixed(digits));
  if (im === 0) return String(re);
  const imText = Math.abs(im) === 1 ? '' : String(Math.abs(im));
  if (re === 0) return `${im < 0 ? '-' : ''}${imText}i`;
  return `${re}${im < 0 ? '-' : '+'}${imText}i`;
}
export const wrapTex = (z, digits = 2) => `(${texComplex(z, digits)})`;

// ---- Cardano on x³ = 15x + c ----
// For |c| < 10√5·... the number under the root is negative, but the roots are real.
export const cardanoUnder = (c) => (c * c) / 4 - 125; // q²/4 + p³/27 with p = −15, q = −c
export function cardanoRoots(c) {
  const d = cardanoUnder(c);
  if (d >= 0) {
    const root = Math.sqrt(d);
    const cbrt = (v) => Math.sign(v) * Math.abs(v) ** (1 / 3);
    return [cbrt(c / 2 + root) + cbrt(c / 2 - root)];
  }
  // u = (c/2 + i√−d)^(1/3); the real roots are 2 Re(u ω^k)
  const r = Math.hypot(c / 2, Math.sqrt(-d));
  const angle = Math.atan2(Math.sqrt(-d), c / 2);
  const m = r ** (1 / 3);
  return [0, 1, 2].map((k) => 2 * m * Math.cos((angle + 2 * Math.PI * k) / 3)).sort((a, b) => a - b);
}
export const cubic = (x, c) => x * x * x - 15 * x - c;

// ---- quadratics ----
export function quadraticRoots(a, b, c) {
  const d = b * b - 4 * a * c;
  if (d >= 0) return { d, roots: [[(-b - Math.sqrt(d)) / (2 * a), 0], [(-b + Math.sqrt(d)) / (2 * a), 0]], real: true };
  const im = Math.sqrt(-d) / (2 * a);
  return { d, roots: [[-b / (2 * a), -Math.abs(im)], [-b / (2 * a), Math.abs(im)]], real: false };
}
// parabola y = a (x − h)² + k and the roots of its y = 0
export function liftedRoots(a, h, k) {
  const under = -k / a;
  if (under >= 0) return { real: true, roots: [[h - Math.sqrt(under), 0], [h + Math.sqrt(under), 0]] };
  return { real: false, roots: [[h, -Math.sqrt(-under)], [h, Math.sqrt(-under)]] };
}

// ---- polar ----
export function polarForm(z) {
  const r = modulus(z);
  let theta = argDeg(z);
  if (theta < 0) theta += 360;
  return { r, theta };
}

// ---- trying to order the complex numbers ----
// Assume a sign for i, then multiply both sides of the same-sign inequality by i. Both assumptions end at −1 against 0.
export const ORDER_CASES = {
  pos: { name: 'i > 0', verdict: 'contradiction', end: '-1>0', reason: 'Multiplying a true inequality by a positive number keeps it true, so i · i > 0 · i, which says −1 > 0. But −1 is less than 0.' },
  neg: { name: 'i < 0', verdict: 'contradiction', end: '-1>0', reason: 'Multiplying by a negative number flips the sign: i < 0 becomes i · i > 0 · i, which says −1 > 0. But −1 is less than 0.' },
  zero: { name: 'i = 0', verdict: 'contradiction', end: '-1=0', reason: 'If i = 0 then i² = 0, but i² = −1.' },
};
export const fx = fixed;
