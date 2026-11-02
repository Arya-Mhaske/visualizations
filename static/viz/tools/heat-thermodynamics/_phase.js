// Pure maths for the Change of state box: heating curve of water, boiling point against pressure, phase diagrams.
export const C_ICE = 2100;
export const C_W = 4186;
export const C_S = 2010;
export const L_F = 334e3;
export const L_V = 2256e3;
export const R = 8.314;
const LV_MOLAR = 40700;
export const satP = (T) => 101.325 * Math.exp(-(LV_MOLAR / R) * (1 / (T + 273.15) - 1 / 373.15)); // kPa, T in degrees C
export const boilT = (P) => 1 / (1 / 373.15 - (R * Math.log(P)) / LV_MOLAR) - 273.15; // P in atm
export const atmAt = (km) => Math.exp(-km / 8.4);
export function curve(m, T0, T1, P = 1) {
  const Tb = boilT(P);
  const segs = [];
  let cum = 0;
  const add = (kind, a, b, q) => {
    segs.push({ kind, T0: a, T1: b, Q: q, start: cum });
    cum += q;
  };
  if (T0 < 0) add('ice', T0, Math.min(0, T1), m * C_ICE * (Math.min(0, T1) - T0));
  if (T0 <= 0 && T1 > 0) add('melt', 0, 0, m * L_F);
  const [w0, w1] = [Math.max(T0, 0), Math.min(T1, Tb)];
  if (w1 > w0) add('water', w0, w1, m * C_W * (w1 - w0));
  if (T0 < Tb && T1 > Tb) add('boil', Tb, Tb, m * L_V);
  const s0 = Math.max(T0, Tb);
  if (T1 > s0) add('steam', s0, T1, m * C_S * (T1 - s0));
  return { segs, total: cum, Tb };
}
// Temperature and the stage reached after Q joules.
export function at(segs, Q) {
  for (const s of segs) {
    if (Q <= s.start + s.Q || s === segs[segs.length - 1]) {
      const f = s.Q > 0 ? Math.min(1, Math.max(0, (Q - s.start) / s.Q)) : 1;
      return { T: s.T0 + (s.T1 - s.T0) * f, kind: s.kind, f };
    }
  }
  return { T: segs[0]?.T0 ?? 0, kind: 'ice', f: 0 };
}
export const LATENT = { melt: true, boil: true };
export const NAMES = { ice: 'Ice warms', melt: 'Ice melts', water: 'Water warms', boil: 'Water boils', steam: 'Steam warms' };

export const SUBS = {
  co2: { name: 'Carbon dioxide', Tt: 216.6, Pt: 5.11, Tc: 304.2, Pc: 73.8, Ls: 26100, Lv: 16500, slope: 0.015, T: [150, 340], lp: [-0.5, 3] },
  water: { name: 'Water', Tt: 273.16, Pt: 0.00604, Tc: 647, Pc: 218, Ls: 51100, Lv: 42500, slope: -0.0075, T: [200, 700], lp: [-3, 3] },
};
export const subP = (s, T) => s.Pt * Math.exp(-(s.Ls / R) * (1 / T - 1 / s.Tt));
export const vapP = (s, T) => s.Pt * Math.exp(-(s.Lv / R) * (1 / T - 1 / s.Tt));
export const fusT = (s, P) => s.Tt + s.slope * (P - s.Pt);
export function region(s, T, P) {
  if (T >= s.Tc && P >= s.Pc) return 'supercritical fluid';
  if (P <= s.Pt) {
    if (T >= s.Tt) return 'gas';
    return P < subP(s, T) ? 'gas' : 'solid';
  }
  if (T < fusT(s, P)) return 'solid';
  if (T >= s.Tc) return 'gas';
  return P > vapP(s, T) ? 'liquid' : 'gas';
}
// The phases met when heating at pressure P (atm), with the temperature of each change.
export function path(s, P) {
  const out = [];
  let last = null;
  for (let T = s.T[0]; T <= s.T[1]; T += 0.25) {
    const r = region(s, T, P);
    if (r !== last) out.push({ phase: r, T });
    last = r;
  }
  return out;
}
// Pressure cooker: absolute pressure (atm) from a valve of mass m kg on a vent of diameter d metres.
export const cookerP = (mKg, dM) => 1 + (mKg * 9.8) / (Math.PI * (dM / 2) ** 2) / 101325;
// Rule of thumb: cooking rate doubles for every 10 degrees.
export const cookTime = (Tb) => 2 ** (-(Tb - 100) / 10);
