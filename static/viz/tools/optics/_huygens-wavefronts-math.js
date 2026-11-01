// Pure maths for the Huygens & Wavefronts box (NCERT XII 10.1-10.3). No DOM.
// A wavefront moving at speed v spreads secondary wavelets of radius v t; their forward envelope is the new wavefront.
export const C_LIGHT = 3e8;
export const H_ALPHA = 656.3; // nm, laboratory wavelength of the H-alpha line

// ---- wavelets from a straight wavefront ----
// n sources spread over a front of length L. Gap between the forward envelope of the wavelets and the ideal
// front a distance r ahead: worst at the midpoint between two sources, where the circles cross at depth
// r - sqrt(r^2 - (s/2)^2), s the spacing. Zero for a continuous front.
export function sources(n, L) {
  return Array.from({ length: n }, (_, i) => (n === 1 ? 0 : -L / 2 + (i * L) / (n - 1)));
}
export function scallop(n, L, r) {
  if (n < 2) return r;
  const half = L / (n - 1) / 2;
  return half >= r ? r : r - Math.sqrt(r * r - half * half);
}

// ---- refraction and reflection by wavelets ----
// A plane wave in medium 1 (speed v1) meets a flat boundary at incidence angle i (to the normal).
// The front reaches boundary position x (along the boundary) at time t0(x) = x sin i / v1.
export const arrival = (x, i, v1) => (x * Math.sin(i)) / v1;
// Each boundary point then sends a wavelet of radius v (t - t0). In medium 2 (speed v2) the common tangent has
// angle r with sin r = (v2 / v1) sin i, so sin i / sin r = v1 / v2 (Snell's law).
export function refractAngle(i, v1, v2) {
  const s = (v2 / v1) * Math.sin(i);
  return s > 1 ? null : Math.asin(s); // null: no tangent exists, which is total internal reflection
}
// Reflected wavelets travel back at v1, so sin r' = sin i and r' = i.
export const reflectAngle = (i) => Math.asin(Math.sin(i));
export const criticalAngle = (v1, v2) => (v2 > v1 ? Math.asin(v1 / v2) : null);
// Wavelet radius at boundary position x, time t (clamped at 0 before the front arrives).
export const radius = (x, t, i, v1, v) => Math.max(0, v * (t - arrival(x, i, v1)));

// ---- Doppler shift of light (NCERT 10.3, source moving along the line of sight) ----
// Fronts are emitted every T from the source's position at that moment; spacing on the far side is (c +- v) T.
export const dopplerLambda = (lambda, beta) => lambda * (1 + beta); // beta > 0: receding
export const redshift = (beta) => beta; // NCERT: delta lambda / lambda = v / c
export const relativisticZ = (beta) => Math.sqrt((1 + beta) / (1 - beta)) - 1;
// Centres and radii of the circular fronts at time t, k = 0..count-1 emitted at kT; source moves along -x at beta c.
export function fronts(t, T, beta, count) {
  const out = [];
  for (let k = 0; k < count; k++) {
    const tk = k * T;
    if (tk > t) break;
    out.push({ x: -beta * C_LIGHT * tk, r: C_LIGHT * (t - tk) });
  }
  return out;
}
// Far-side spacing of neighbouring fronts: the wavelength the observer measures.
export const spacing = (T, beta, receding = true) => C_LIGHT * T * (1 + (receding ? beta : -beta));
export const GALAXIES = [
  { name: 'Nearby cluster', beta: 0.01 },
  { name: 'Distant cluster', beta: 0.05 },
  { name: 'Far galaxy', beta: 0.1 },
  { name: 'Very far galaxy', beta: 0.2 },
];
