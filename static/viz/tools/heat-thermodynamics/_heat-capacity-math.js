// Pure maths for the Heat capacity and calorimetry box (SI, no DOM).
export const R = 8.314;
export const LAND = { rho: 2000, c: 800 };
export const SEA = { rho: 1000, c: 4186 };
// Temperature change of a layer of depth d (m) given heat Q per square metre (J/m^2).
export const layerRise = (Q, d, mat) => Q / (d * mat.rho * mat.c);
export const SUBSTANCES = {
  water: ['Water', 4186],
  ethanol: ['Ethanol', 2440],
  aluminium: ['Aluminium', 900],
  iron: ['Iron', 450],
  copper: ['Copper', 385],
  lead: ['Lead', 130],
};
// Final temperature of two bodies mixed in an isolated box. leak = share of the hot body's lost heat that escapes.
export function finalTemp(m1, c1, T1, m2, c2, T2, leak = 0) {
  const hot = T1 >= T2;
  const [mh, ch, Th, mc, cc, Tc] = hot ? [m1, c1, T1, m2, c2, T2] : [m2, c2, T2, m1, c1, T1];
  return (mh * ch * Th * (1 - leak) + mc * cc * Tc) / (mh * ch * (1 - leak) + mc * cc);
}
export const heat = (m, c, Ti, Tf) => m * c * (Tf - Ti);
// Gas heated at constant volume or pressure: Cv = (f/2) R, Cp = Cv + R.
export const cv = (f) => (f / 2) * R;
export const cp = (f) => (f / 2 + 1) * R;
export const heatGas = (f, n, dT, process) => n * (process === 'V' ? cv(f) : cp(f)) * dT;
export const workGas = (n, dT, process) => (process === 'V' ? 0 : n * R * dT);
// Specific heat of an unknown metal ball dropped into a copper calorimeter of water (NCERT Ex 10.3).
export const C_WATER = 4180;
export const C_COPPER = 390;
export function specificHeatOfBall({ mBall, T0, mWater, mCal, Ti, Tf }) {
  const gained = (mWater * C_WATER + mCal * C_COPPER) * (Tf - Ti);
  return gained / (mBall * (T0 - Tf));
}
