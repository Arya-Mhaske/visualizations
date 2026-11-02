// Carnot cycle of n = 1 mol of ideal gas: A to B isothermal at T1, B to C adiabatic, C to D isothermal at T2, D to A adiabatic.
// P in kPa, V in L, energies in J.
import { R, simpson } from './_thermo.js';
export const GAS = { mono: 5 / 3, di: 7 / 5 };
export function carnot(T1, T2, g, r = 2, VA = 10) {
  const k = (T1 / T2) ** (1 / (g - 1));
  const VB = VA * r;
  const VC = VB * k;
  const VD = VA * k;
  const P = (T, V) => (R * T) / V;
  const pts = { A: [VA, P(T1, VA)], B: [VB, P(T1, VB)], C: [VC, P(T2, VC)], D: [VD, P(T2, VD)] };
  const curves = [
    (V) => P(T1, V),
    (V) => pts.B[1] * (VB / V) ** g,
    (V) => P(T2, V),
    (V) => pts.A[1] * (VA / V) ** g,
  ];
  const Q1 = R * T1 * Math.log(r);
  const Q2 = R * T2 * Math.log(VC / VD);
  const area = simpson(curves[0], VA, VB) + simpson(curves[1], VB, VC) - simpson(curves[2], VD, VC) - simpson(curves[3], VA, VD);
  return { pts, curves, VA, VB, VC, VD, Q1, Q2, W: Q1 - Q2, area, eta: 1 - Q2 / Q1 };
}
export const carnotEta = (T1, T2) => 1 - T2 / T1;
export const copFridge = (Tc, Th) => Tc / (Th - Tc);
export function drawCycle(plot, cy, c, { width = 4, fill = c.fillB } = {}) {
  const bounds = [[cy.VA, cy.VB, 0, c.a], [cy.VB, cy.VC, 1, c.d], [cy.VD, cy.VC, 2, c.b], [cy.VA, cy.VD, 3, c.d]];
  // shade between the upper path (isotherm 1 then adiabat BC) and the lower path (adiabat DA then isotherm 2)
  const upper = (V) => (V <= cy.VB ? cy.curves[0](V) : cy.curves[1](V));
  const lower = (V) => (V <= cy.VD ? cy.curves[3](V) : cy.curves[2](V));
  plot.shade(upper, lower, cy.VA, cy.VC, fill);
  for (const [a, b, i, col] of bounds) plot.fn(cy.curves[i], { domain: [a, b], color: col, width });
}
