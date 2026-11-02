// Nuclear data shared by the-nucleus and radioactivity-nuclear-energy. Energies in MeV, masses in u.
export const U_MEV = 931.5;
export const M_H = 1.007825; // hydrogen atom (proton + electron)
export const M_N = 1.008665;
export const R0_FM = 1.2;
export const U_KG = 1.66e-27;

// Atomic masses of some nuclides (u). Binding energy = (Z M_H + N m_n − M) × 931.5.
export const NUCLIDES = [
  { key: 'H2', name: 'deuterium ²H', Z: 1, A: 2, M: 2.014102 },
  { key: 'He4', name: 'helium ⁴He', Z: 2, A: 4, M: 4.002603 },
  { key: 'Li7', name: 'lithium ⁷Li', Z: 3, A: 7, M: 7.016004 },
  { key: 'C12', name: 'carbon ¹²C', Z: 6, A: 12, M: 12.0 },
  { key: 'O16', name: 'oxygen ¹⁶O', Z: 8, A: 16, M: 15.994915 },
  { key: 'Ne20', name: 'neon ²⁰Ne', Z: 10, A: 20, M: 19.99244 },
  { key: 'Fe56', name: 'iron ⁵⁶Fe', Z: 26, A: 56, M: 55.934937 },
  { key: 'Pb208', name: 'lead ²⁰⁸Pb', Z: 82, A: 208, M: 207.976652 },
  { key: 'U235', name: 'uranium ²³⁵U', Z: 92, A: 235, M: 235.04393 },
];
export const nuclide = (key) => NUCLIDES.find((n) => n.key === key);
export const partsMass = (n) => n.Z * M_H + (n.A - n.Z) * M_N;
export const massDefect = (n) => partsMass(n) - n.M;
export const bindingMeV = (n) => massDefect(n) * U_MEV;

// Measured binding energy per nucleon (MeV), A against B/A, for the stable curve.
export const BA = [
  [1, 0], [2, 1.112], [3, 2.827], [4, 7.074], [6, 5.332], [7, 5.606], [9, 6.463], [12, 7.68], [14, 7.476],
  [16, 7.976], [20, 8.032], [24, 8.261], [28, 8.448], [32, 8.493], [40, 8.551], [56, 8.79], [62, 8.795],
  [84, 8.717], [120, 8.504], [138, 8.393], [208, 7.867], [235, 7.591], [238, 7.57],
];
export function baAt(A) {
  if (A <= BA[0][0]) return BA[0][1];
  for (let i = 1; i < BA.length; i++) {
    if (A <= BA[i][0]) {
      const [a0, b0] = BA[i - 1];
      const [a1, b1] = BA[i];
      return b0 + ((b1 - b0) * (A - a0)) / (a1 - a0);
    }
  }
  return BA[BA.length - 1][1];
}

// Semi-empirical (liquid-drop) pieces, MeV per nucleon, for the most stable Z at each A.
export const AV = 15.75;
export const AS = 17.8;
export const AC = 0.711;
export const AA = 23.7;
export const zStable = (A) => A / (2 + 0.015 * A ** (2 / 3));
export const drop = (A, { surface = true, coulomb = true, asym = true } = {}) => {
  const Z = zStable(A);
  let b = AV;
  if (surface) b -= AS / A ** (1 / 3);
  if (coulomb) b -= (AC * Z * Z) / A ** (4 / 3);
  if (asym) b -= (AA * (A - 2 * Z) ** 2) / (A * A);
  return b;
};

export const radiusFm = (A) => R0_FM * A ** (1 / 3);
export const densityKg = (A) => (A * U_KG) / ((4 / 3) * Math.PI * (radiusFm(A) * 1e-15) ** 3);
