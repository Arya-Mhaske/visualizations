// Maths for the prism-dispersion box. Angles in degrees unless a name says rad.
const RAD = Math.PI / 180;
export const rad = (d) => d * RAD;
export const deg = (r) => r / RAD;

// A prism of apex angle A and index n. A ray hits the first face at angle of incidence i.
//   r1 = asin(sin i / n),  r2 = A - r1,  sin e = n sin r2,  D = i + e - A.
export function pass(A, n, i) {
  const s1 = Math.sin(rad(i)) / n;
  const r1 = deg(Math.asin(s1));
  const r2 = A - r1;
  if (r2 < 0 && Math.sin(rad(r2)) * n < -1) return null;
  const s2 = n * Math.sin(rad(r2));
  if (Math.abs(s2) > 1) return null; // total internal reflection at the second face
  const e = deg(Math.asin(s2));
  return { r1, r2, e, D: i + e - A };
}
export const deviation = (A, n, i) => {
  const p = pass(A, n, i);
  return p === null ? null : p.D;
};
// The smallest deviation and the angle of incidence that gives it (the ray inside is parallel to the base).
export const minDeviation = (A, n) => 2 * deg(Math.asin(n * Math.sin(rad(A / 2)))) - A;
export const minAngle = (A, n) => (A + minDeviation(A, n)) / 2;
// n from a measured minimum deviation.
export const indexFrom = (A, Dmin) => Math.sin(rad((A + Dmin) / 2)) / Math.sin(rad(A / 2));
// The smallest angle of incidence that lets the ray out of the second face.
export function firstEmergent(A, n) {
  for (let i = 0; i <= 89.9; i += 0.05) if (pass(A, n, i)) return i;
  return null;
}

// Cauchy dispersion, n = a + b / lambda^2 with lambda in micrometres; crown-glass values.
export const CAUCHY = { a: 1.5046, b: 0.0042 };
export const nAt = (lambdaNm, strength = 1) => CAUCHY.a + (CAUCHY.b * strength) / (lambdaNm / 1000) ** 2;
export const COLOURS = [
  { name: 'red', nm: 700 },
  { name: 'orange', nm: 620 },
  { name: 'yellow', nm: 580 },
  { name: 'green', nm: 530 },
  { name: 'cyan', nm: 490 },
  { name: 'blue', nm: 450 },
  { name: 'violet', nm: 410 },
];

// A raindrop of index n. A ray enters at incidence i, is reflected k times inside, and leaves.
// Each internal reflection adds 180 - 2r to the turn, and each refraction adds i - r; the total deviation:
//   D(i) = k * (180 - 2 r) + 2 (i - r)   (k = 1 for the primary bow), with sin i = n sin r.
export function dropDeviation(n, i, k = 1) {
  const r = deg(Math.asin(Math.sin(rad(i)) / n));
  return k * (180 - 2 * r) + 2 * (i - r);
}
// The smallest turn (the rainbow angle seen from the Sun's opposite direction is 180 - D).
export function dropMinimum(n, k = 1) {
  let best = { D: Infinity, i: 0 };
  for (let i = 0.05; i < 89.99; i += 0.01) {
    const D = dropDeviation(n, i, k);
    if (D < best.D) best = { D, i };
  }
  return best;
}
// For the primary bow the incidence at the minimum has cos^2 i = (n^2 - 1) / 3 (from dD/di = 0).
export const dropIncidenceExact = (n) => deg(Math.acos(Math.sqrt((n * n - 1) / 3)));
export const bowAngle = (n) => 180 - dropMinimum(n, 1).D;
