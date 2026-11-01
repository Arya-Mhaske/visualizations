// Maths for the diffraction-polarisation box. Angles in degrees unless a name says rad.
const RAD = Math.PI / 180;
export const rad = (d) => d * RAD;
export const deg = (r) => r / RAD;

// Single slit of width a, wavelength lambda (same units): I / I0 = (sin b / b)^2, b = pi a sin(theta) / lambda.
export function slit(a, lambda, thetaDeg) {
  const b = (Math.PI * a * Math.sin(rad(thetaDeg))) / lambda;
  if (Math.abs(b) < 1e-9) return 1;
  return (Math.sin(b) / b) ** 2;
}
// The first minimum is where the two halves of the slit cancel in pairs: (a / 2) sin(theta) = lambda / 2.
export const firstMinimum = (a, lambda) => (lambda / a <= 1 ? deg(Math.asin(lambda / a)) : null);
// Path difference between a ray from the top half and the matching ray from the bottom half, in wavelengths.
export const pairPath = (a, lambda, thetaDeg) => ((a / 2) * Math.sin(rad(thetaDeg))) / lambda;

// Bessel J1 by its power series (good for |x| < 25).
export function besselJ1(x) {
  let term = x / 2;
  let sum = term;
  for (let k = 1; k < 60; k++) {
    term *= -((x * x) / 4) / (k * (k + 1));
    sum += term;
    if (Math.abs(term) < 1e-16) break;
  }
  return sum;
}
// Airy pattern of a circular aperture: I / I0 = (2 J1(x) / x)^2 with x = pi D sin(theta) / lambda.
export function airy(x) {
  if (Math.abs(x) < 1e-9) return 1;
  return ((2 * besselJ1(x)) / x) ** 2;
}
// Rayleigh: two stars are just resolved when the centre of one lies on the first dark ring of the other.
export const rayleigh = (lambda, D) => 1.22 * (lambda / D); // radians
export const ARCSEC = Math.PI / (180 * 3600);
export const FIRST_ZERO = 3.8317059702075125; // first zero of J1

// Two equal stars separated by sep (radians), seen through an aperture D at wavelength lambda: intensity at angle t.
export function twoStars(t, sep, D, lambda) {
  const k = (Math.PI * D) / lambda;
  return airy(k * (t - sep / 2)) + airy(k * (t + sep / 2));
}
// The dip at the midpoint, as a fraction of the peak height (1 = no dip).
export function midDip(sep, D, lambda) {
  const k = (Math.PI * D) / lambda;
  let peak = 0;
  for (let i = -200; i <= 200; i++) peak = Math.max(peak, twoStars((i / 200) * sep * 1.5, sep, D, lambda));
  return twoStars(0, sep, D, lambda) / peak;
}

// Malus: polarised light through an analyser at angle theta: I = I0 cos^2 theta. Unpolarised light loses half.
export const malus = (I0, thetaDeg) => I0 * Math.cos(rad(thetaDeg)) ** 2;
export const afterTwo = (I0, thetaDeg) => (I0 / 2) * Math.cos(rad(thetaDeg)) ** 2;

// Fresnel reflectance from n1 into n2: rp for light polarised in the plane of incidence, rs for perpendicular to it.
export function fresnel(n1, n2, iDeg) {
  const s = (n1 / n2) * Math.sin(rad(iDeg));
  if (s > 1) return { Rs: 1, Rp: 1, t: null };
  const t = Math.asin(s);
  const ci = Math.cos(rad(iDeg));
  const ct = Math.cos(t);
  const rs = (n1 * ci - n2 * ct) / (n1 * ci + n2 * ct);
  const rp = (n2 * ci - n1 * ct) / (n2 * ci + n1 * ct);
  return { Rs: rs * rs, Rp: rp * rp, t: deg(t) };
}
export const brewster = (n1, n2) => deg(Math.atan(n2 / n1));
// Fraction of the reflected light that is polarised.
export const polarisation = (n1, n2, iDeg) => {
  const { Rs, Rp } = fresnel(n1, n2, iDeg);
  return Rs + Rp === 0 ? 0 : (Rs - Rp) / (Rs + Rp);
};
// Sunglasses with the pass axis at phi from vertical. Glare is the reflected light: its s part is horizontal.
export function throughGlasses(Rs, Rp, phiDeg) {
  const c2 = Math.cos(rad(phiDeg)) ** 2;
  return (Rs * (1 - c2) + Rp * c2) / 2; // incident light is unpolarised: half s, half p
}
