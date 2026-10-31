// Number formatting for readouts, in NCERT style. Pure functions, no DOM.
//   sig(x, n)            n significant figures, trailing zeros trimmed
//   fixed(x, n)          n decimals, trailing zeros trimmed
//   sci(x, n)            scientific notation as 3.0 ×10⁸
//   withUnit(x, unit, n) sig() plus a thin-spaced unit
//   frac(x, maxDen)      nearest p/q as {p, q}, or null
//   piFrac(x)            radians as a π multiple: 3π/4, or null if not a simple multiple
//   deg(x, n)            degrees with the ° sign
const SUPERS = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
const MINUS = '−';

const signed = (text) => text.replace('-', MINUS);
const clean = (value) => (Object.is(value, -0) ? 0 : value);

export const fixed = (x, n = 2) => signed(String(clean(Number(x.toFixed(n)))));

export function sig(x, n = 3) {
  if (x === 0) return '0';
  if (!Number.isFinite(x)) return x > 0 ? '∞' : `${MINUS}∞`;
  const rounded = Number(x.toPrecision(n));
  const size = Math.abs(rounded);
  if (size >= 1e6 || size < 1e-4) return sci(x, n);
  return signed(String(rounded));
}

export function sci(x, n = 3) {
  if (x === 0) return '0';
  const [mantissa, exponent] = x.toExponential(n - 1).split('e');
  const power = String(Number(exponent)).replace(/[-0-9]/g, (ch) => SUPERS[ch]);
  return `${signed(mantissa)} ×10${power}`;
}

export const withUnit = (x, unit, n = 3) => `${sig(x, n)} ${unit}`;

export function gcd(a, b) {
  return b === 0 ? Math.abs(a) : gcd(b, a % b);
}

export function frac(x, maxDen = 1000) {
  for (let q = 1; q <= maxDen; q++) {
    const p = Math.round(x * q);
    if (Math.abs(p / q - x) < 1e-9) return { p, q };
  }
  return null;
}

export function piFrac(x, maxDen = 24) {
  const found = frac(x / Math.PI, maxDen);
  if (!found) return null;
  const { p, q } = found;
  if (p === 0) return '0';
  const size = Math.abs(p);
  const top = `${p < 0 ? MINUS : ''}${size === 1 ? '' : size}π`;
  return q === 1 ? top : `${top}/${q}`;
}

export const deg = (x, n = 1) => `${fixed(x, n)}°`;
