// Pure maths for the "Superposition & Reflection" box. No DOM.
//   gauss(u, w)                 exp(−(u/w)²), a pulse of half-width w
//   pulseAt(x, t, p, v)         one pulse p = { A, x, w, dir } alone: height at x after t seconds (dir +1 right, −1 left)
//   field(x, t, pulses, o)      the string: the plain sum of the pulses. o = { v, L, walls }:
//                               walls 0 = open string; −1 = both ends fixed; +1 = both ends free (images repeat every 2L)
//   wallField(x, t, p, o)       one pulse meeting one wall at x = L: p plus its image. o = { v, L, sigma }, sigma −1 fixed, +1 free
//   wallImage(x, t, p, o)       the image alone (the pulse "from beyond the wall")
//   resultant(A1, A2, phi)      amplitude of A1 sin θ + A2 sin(θ + φ):  √(A1² + A2² + 2·A1·A2·cos φ)
//   resultantPhase(A1, A2, phi) its phase offset from the first wave
//   wrapPhase(phi)              phi brought into [0, 2π)
//   kindOf(phi, A1, A2)         'constructive' | 'destructive' | 'in between'
//   pathDifference(phi, lambda) Δx = (φ/2π)·λ
//   energy(xs, t, pulses, o)    ∫ ½(y_t² + v² y_x²) dx by finite differences on the points xs
export const TAU = Math.PI * 2;
export const V = 1; // m/s on the string
export const LENGTH = 10; // m

export const gauss = (u, w) => Math.exp(-((u / w) ** 2));

export const pulseAt = (x, t, p, v = V) => p.A * gauss(x - p.x - p.dir * v * t, p.w);

const IMAGES = 4; // copies either side: enough for 20 s at 1 m/s on a 10 m string

export function field(x, t, pulses, { v = V, L = LENGTH, walls = 0 } = {}) {
  let y = 0;
  for (const p of pulses) {
    if (!walls) {
      y += pulseAt(x, t, p, v);
      continue;
    }
    for (let n = -IMAGES; n <= IMAGES; n++) {
      y += p.A * gauss(x - p.x - 2 * n * L - p.dir * v * t, p.w);
      y += walls * p.A * gauss(x + p.x - 2 * n * L + p.dir * v * t, p.w);
    }
  }
  return y;
}

// The wall at x = L mirrors a pulse at x0 to 2L − x0, travelling the other way, with its height times sigma.
export function wallImage(x, t, p, { v = V, L = LENGTH, sigma = -1 } = {}) {
  return sigma * p.A * gauss(x - (2 * L - p.x) + p.dir * v * t, p.w);
}

export const wallField = (x, t, p, o = {}) => pulseAt(x, t, p, o.v ?? V) + wallImage(x, t, p, o);

export const resultant = (A1, A2, phi) => Math.sqrt(A1 * A1 + A2 * A2 + 2 * A1 * A2 * Math.cos(phi));
export const resultantPhase = (A1, A2, phi) => Math.atan2(A2 * Math.sin(phi), A1 + A2 * Math.cos(phi));

export const wrapPhase = (phi) => ((phi % TAU) + TAU) % TAU;

export function kindOf(phi, A1, A2) {
  const R = resultant(A1, A2, phi);
  const big = A1 + A2;
  const small = Math.abs(A1 - A2);
  if (R >= big - 0.02 * big) return 'constructive';
  if (R <= small + 0.02 * big) return 'destructive';
  return 'in between';
}

export const pathDifference = (phi, lambda) => (phi / TAU) * lambda;

export function energy(xs, t, pulses, o = {}) {
  const v = o.v ?? V;
  const h = 1e-4;
  let sum = 0;
  for (let i = 0; i < xs.length - 1; i++) {
    const x = (xs[i] + xs[i + 1]) / 2;
    const yt = (field(x, t + h, pulses, o) - field(x, t - h, pulses, o)) / (2 * h);
    const yx = (field(x + h, t, pulses, o) - field(x - h, t, pulses, o)) / (2 * h);
    sum += 0.5 * (yt * yt + v * v * yx * yx) * (xs[i + 1] - xs[i]);
  }
  return sum;
}
