// The four basic processes from a start (P1 kPa, V1 L). f is the volume ratio, except for isochoric where it is the pressure ratio.
import { isoP, adiaP, workIsobaric, workIsothermal, workAdiabatic } from './_thermo.js';
export const KINDS = ['isobaric', 'isochoric', 'isothermal', 'adiabatic'];
export const NAMES = { isobaric: 'Isobaric', isochoric: 'Isochoric', isothermal: 'Isothermal', adiabatic: 'Adiabatic' };
export function end(kind, P1, V1, f, g) {
  if (kind === 'isobaric') return { P2: P1, V2: V1 * f };
  if (kind === 'isochoric') return { P2: P1 * f, V2: V1 };
  if (kind === 'isothermal') return { P2: P1 / f, V2: V1 * f };
  return { P2: P1 * f ** -g, V2: V1 * f };
}
export function work(kind, P1, V1, f, g) {
  const { V2 } = end(kind, P1, V1, f, g);
  if (kind === 'isobaric') return workIsobaric(P1, V1, V2);
  if (kind === 'isochoric') return 0;
  if (kind === 'isothermal') return workIsothermal(P1, V1, V2);
  return workAdiabatic(P1, V1, V2, g);
}
// P as a function of V on the path (isochoric has none: it is a vertical line).
export function curve(kind, P1, V1, g) {
  if (kind === 'isobaric') return () => P1;
  if (kind === 'isothermal') return isoP(P1, V1);
  if (kind === 'adiabatic') return adiaP(P1, V1, g);
  return null;
}
