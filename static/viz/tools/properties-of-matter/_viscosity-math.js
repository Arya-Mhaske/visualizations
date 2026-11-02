// Pure maths for the Viscosity box (SI units, no DOM).
export const G = 9.8;
export const FLUIDS = {
  water: ['Water', 0.001],
  oil: ['Olive oil', 0.08],
  glycerine: ['Glycerine', 1.4],
  honey: ['Honey', 10],
};
// Top plate of area A slides over a layer of thickness d under force F: F/A = eta v/d.
export const plateSpeed = (F, d, eta, A) => (F * d) / (eta * A);
// Stokes: a ball of radius a, density rho, falling in a fluid of density sigma and viscosity eta.
export const terminal = (a, rho, sigma, eta) => (2 * a * a * (rho - sigma) * G) / (9 * eta);
export const tau = (a, rho, eta) => (2 * a * a * rho) / (9 * eta);
export const reynolds = (a, v, sigma, eta) => (sigma * v * 2 * a) / eta;
export const dragForce = (a, eta, v) => 6 * Math.PI * eta * a * v;
export const netWeight = (a, rho, sigma) => (4 / 3) * Math.PI * a ** 3 * (rho - sigma) * G;
// Speed as a fraction of terminal speed after time t (in units of tau).
export const approach = (t) => 1 - Math.exp(-t);
// Toy models, both scaled to 1 at 293 K.
export const B_LIQUID = 1800; // E/k in kelvin: bonds a molecule must break to slide
export const liquidVisc = (T) => Math.exp(B_LIQUID * (1 / T - 1 / 293));
export const gasVisc = (T) => Math.sqrt(T / 293);
export const freeShare = (T) => Math.exp(-B_LIQUID / T);
