// Maths for the dimensions box. A dimension is [M, L, T] exponents. Pure numbers, no DOM.
const SUP = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹', '.': '·' };
const sup = (n) => String(n).replace(/[-0-9.]/g, (ch) => SUP[ch]);
const exp = (n) => (Number.isInteger(n) ? sup(n) : sup(n.toFixed(1)));

export const same = (a, b) => a.every((x, i) => Math.abs(x - b[i]) < 1e-9);
export const mul = (a, b) => a.map((x, i) => x + b[i]);
export const div = (a, b) => a.map((x, i) => x - b[i]);
export const power = (a, p) => a.map((x) => x * p);
export const isPure = (a) => a.every((x) => Math.abs(x) < 1e-9);

// "[M L² T⁻²]" ; a missing letter has exponent 0, and an all-zero dimension is "[1]".
export function dimText([m, l, t]) {
  const parts = [];
  for (const [name, e] of [['M', m], ['L', l], ['T', t]]) {
    if (Math.abs(e) < 1e-9) continue;
    parts.push(Math.abs(e - 1) < 1e-9 ? name : `${name}${exp(e)}`);
  }
  return parts.length ? `[${parts.join(' ')}]` : '[1]';
}
// The same in TeX.
export function dimTex([m, l, t]) {
  const parts = [];
  for (const [name, e] of [['M', m], ['L', l], ['T', t]]) {
    if (Math.abs(e) < 1e-9) continue;
    parts.push(Math.abs(e - 1) < 1e-9 ? name : `${name}^{${Number.isInteger(e) ? e : e.toFixed(1)}}`);
  }
  return parts.length ? `[${parts.join('\\,')}]` : '[1]';
}

// name, symbol, dimension [M, L, T], SI unit.
export const QUANTITIES = [
  { id: 'length', name: 'length', unit: 'm', dim: [0, 1, 0] },
  { id: 'time', name: 'time', unit: 's', dim: [0, 0, 1] },
  { id: 'mass', name: 'mass', unit: 'kg', dim: [1, 0, 0] },
  { id: 'area', name: 'area', unit: 'm²', dim: [0, 2, 0] },
  { id: 'volume', name: 'volume', unit: 'm³', dim: [0, 3, 0] },
  { id: 'speed', name: 'speed', unit: 'm/s', dim: [0, 1, -1] },
  { id: 'acceleration', name: 'acceleration', unit: 'm/s²', dim: [0, 1, -2] },
  { id: 'frequency', name: 'frequency', unit: 'Hz', dim: [0, 0, -1] },
  { id: 'density', name: 'density', unit: 'kg/m³', dim: [1, -3, 0] },
  { id: 'momentum', name: 'momentum', unit: 'kg m/s', dim: [1, 1, -1] },
  { id: 'force', name: 'force', unit: 'N', dim: [1, 1, -2] },
  { id: 'impulse', name: 'impulse', unit: 'N s', dim: [1, 1, -1] },
  { id: 'energy', name: 'energy', unit: 'J', dim: [1, 2, -2] },
  { id: 'work', name: 'work', unit: 'J', dim: [1, 2, -2] },
  { id: 'torque', name: 'torque', unit: 'N m', dim: [1, 2, -2] },
  { id: 'power', name: 'power', unit: 'W', dim: [1, 2, -3] },
  { id: 'pressure', name: 'pressure', unit: 'Pa', dim: [1, -1, -2] },
  { id: 'viscosity', name: 'viscosity', unit: 'Pa s', dim: [1, -1, -1] },
  { id: 'surface-tension', name: 'surface tension', unit: 'N/m', dim: [1, 0, -2] },
  { id: 'angular-velocity', name: 'angular velocity', unit: 'rad/s', dim: [0, 0, -1] },
  { id: 'moment-of-inertia', name: 'moment of inertia', unit: 'kg m²', dim: [1, 2, 0] },
  { id: 'G', name: 'gravitational constant G', unit: 'N m²/kg²', dim: [-1, 3, -2] },
  { id: 'angle', name: 'angle (arc ÷ radius)', unit: 'rad', dim: [0, 0, 0] },
  { id: 'strain', name: 'strain', unit: '(none)', dim: [0, 0, 0] },
];
export const byId = (id) => QUANTITIES.find((q) => q.id === id);
export const matches = (dim) => QUANTITIES.filter((q) => same(q.dim, dim));

// A sum is only allowed between quantities of the same dimension; a product always works.
export const canAdd = (a, b) => same(a, b);

// Searching for T = k l^x g^y m^z: the dimension of the right-hand side without k.
export const L_DIM = [0, 1, 0];
export const G_DIM = [0, 1, -2];
export const M_DIM = [1, 0, 0];
export const T_DIM = [0, 0, 1];
export const pendulumDim = (x, y, z) => mul(mul(power(L_DIM, x), power(G_DIM, y)), power(M_DIM, z));
export const pendulumOk = (x, y, z) => same(pendulumDim(x, y, z), T_DIM);
export const GRAVITY = 9.8;
export const pendulumPeriod = (l) => 2 * Math.PI * Math.sqrt(l / GRAVITY); // small swings, any mass
export const kFrom = (x, y, z, l, m) => pendulumPeriod(l) / (l ** x * GRAVITY ** y * m ** z);

// Kinetic energy: only k = 1/2 matches what a falling ball really gains, m g h = (1/2) m v^2 with v^2 = 2 g h.
export const fallSpeedSquared = (g, h) => 2 * g * h;
export const kineticGuess = (k, m, v2) => k * m * v2;

// Changing units. A quantity with dimension [a, b, c] and value n1 in units (M1, L1, T1) has the value
//   n2 = n1 (M1/M2)^a (L1/L2)^b (T1/T2)^c   in units (M2, L2, T2).
export const convert = (value, dim, from, to) => value * (from[0] / to[0]) ** dim[0] * (from[1] / to[1]) ** dim[1] * (from[2] / to[2]) ** dim[2];
export const CONSTANTS = [
  { id: 'calorie', name: 'one calorie', value: 4.186, dim: [1, 2, -2], si: 'J' },
  { id: 'G', name: 'G', value: 6.674e-11, dim: [-1, 3, -2], si: 'N m²/kg²' },
  { id: 'g', name: 'g', value: 9.8, dim: [0, 1, -2], si: 'm/s²' },
  { id: 'water', name: 'density of water', value: 1000, dim: [1, -3, 0], si: 'kg/m³' },
];

// m = m0 / sqrt(1 - X): which candidate brackets X are dimensionless?
export const BRACKETS = [
  { id: 'v2', text: 'v²', dim: [0, 2, -2], f: (v, c) => v * v },
  { id: 'v2c', text: 'v²/c', dim: [0, 1, -1], f: (v, c) => (v * v) / c },
  { id: 'vc2', text: 'v/c²', dim: [0, -1, 1], f: (v, c) => v / (c * c) },
  { id: 'vc', text: 'v/c', dim: [0, 0, 0], f: (v, c) => v / c },
  { id: 'v2c2', text: 'v²/c²', dim: [0, 0, 0], f: (v, c) => (v * v) / (c * c) },
];
export const gammaWith = (bracket, vOverC) => {
  const X = bracket.f(vOverC, 1);
  return X >= 1 ? Infinity : 1 / Math.sqrt(1 - X);
};
