// Series LCR maths. L in henry, C in farad, R in ohm, ω in rad/s, source peak V.
export const w0Of = (L, C) => 1 / Math.sqrt(L * C);
export const XL = (L, w) => w * L;
export const XC = (C, w) => 1 / (w * C);
export const Z = (R, L, C, w) => Math.hypot(R, XL(L, w) - XC(C, w));
export const I = (V, R, L, C, w) => V / Z(R, L, C, w);
export const Q = (R, L, C) => (w0Of(L, C) * L) / R;
// Half-power points: ω₁, ω₂ = ω₀ (√(1 + 1/4Q²) ∓ 1/2Q); the bandwidth is R/L.
export const halfPower = (R, L, C) => {
  const w0 = w0Of(L, C);
  const q = Q(R, L, C);
  const root = Math.sqrt(1 + 1 / (4 * q * q));
  return [w0 * (root - 1 / (2 * q)), w0 * (root + 1 / (2 * q))];
};
