// Shared maths for the photoelectric, matter-wave, atom, nucleus and band boxes (NCERT constants).
export const H = 6.63e-34; // J s
export const Q = 1.6e-19; // C
export const C = 3e8; // m/s
export const ME = 9.11e-31; // kg
export const HC = (H * C) / Q * 1e9; // eV nm, about 1243

export const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));
export const photonEv = (nm) => HC / nm;
export const nuHz = (nm) => C / (nm * 1e-9);
export const thresholdNm = (phi) => HC / phi;
export const kmax = (E, phi) => Math.max(0, E - phi);

// Work functions (eV), NCERT Table 11.1 and the usual textbook set.
export const METALS = [
  ['Cs', 2.14], ['K', 2.3], ['Na', 2.75], ['Zn', 4.3], ['Ni', 5.15],
];
export const phiOf = (key) => METALS.find(([k]) => k === key)[1];

// de Broglie
export const deBroglie = (m, v) => H / (m * v);
export const electronNm = (volts) => (H / Math.sqrt(2 * ME * Q * volts)) * 1e9;

// A colour for a wavelength: spec[0] is red, spec[6] violet; ultraviolet and infrared get their own.
export function lightColor(c, nm) {
  if (nm < 400) return c.d;
  if (nm > 720) return c.a;
  return c.spec[Math.round(clamp((6 * (700 - nm)) / 300, 0, 6))];
}

// Energy-level and spectrum helpers for hydrogen
export const RYD = 1.097e7; // m^-1
export const levelEv = (n) => -13.6 / (n * n);
export const lineNm = (m, n) => 1e9 / (RYD * (1 / (m * m) - 1 / (n * n)));

// Intrinsic carriers per cm^3: ni = N (T/300)^1.5 exp(-Eg / 2kT), with N = 2.5e19 per cm^3 for both bands.
export const KB_EV = 8.617e-5;
export const NC = 2.5e19;
export const niOf = (Eg, T) => NC * (T / 300) ** 1.5 * Math.exp(-Eg / (2 * KB_EV * T));
export const VALENCE_E = 5e22; // bonding electrons per cm^3 in silicon

export const sciText = (x) => {
  if (x === 0) return '0';
  const e = Math.floor(Math.log10(Math.abs(x)));
  const m = x / 10 ** e;
  const sup = String(e).replace(/-/g, '⁻').replace(/\d/g, (d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[d]);
  return `${m.toFixed(1)} ×10${sup}`;
};
