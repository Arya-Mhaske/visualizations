// Pure maths for the "Travelling Waves" box. No DOM.
//   wave(x, t, a, k, w, phi, s)   y = a sin(kx − s·ωt + φ); s = +1 moves right, s = −1 moves left
//   riderX(theta, t, k, w, s, near)   place x of the point whose phase kx − s·ωt equals theta (+2πn), the one at or after `near`
//   speedOf(k, w), wavelengthOf(k), periodOf(w), freqOf(w)
//   stringSpeed(T, mu)            √(T/μ)
//   pulseY(x, tau, v, x0, width)  Gaussian pulse height (1 at its peak) after physical time tau
//   newtonSpeed(P, rho), laplaceSpeed(gamma, P, rho), percentLow(gamma)
//   isoP(s, P0), adiaP(s, gamma, P0)   pressure after squeezing the volume by the fraction s
//   MATERIALS, materialSpeed(m)   stiffness / density / speed for air, water, aluminium, steel
export const TAU = Math.PI * 2;

export const wave = (x, t, a, k, w, phi = 0, s = 1) => a * Math.sin(k * x - s * w * t + phi);

export function riderX(theta, t, k, w, s = 1, near = 0) {
  // k·x − s·ω·t = theta + 2πn  →  x = (theta + 2πn + s·ω·t)/k ; take the smallest x ≥ near at t = 0
  const lambda = TAU / k;
  const x0 = theta / k;
  const first = x0 + Math.ceil((near - x0) / lambda - 1e-9) * lambda;
  return first + (s * w * t) / k;
}

export const speedOf = (k, w) => w / k;
export const wavelengthOf = (k) => TAU / k;
export const periodOf = (w) => TAU / w;
export const freqOf = (w) => w / TAU;

export const stringSpeed = (T, mu) => Math.sqrt(T / mu);

export function pulseY(x, tau, v, x0, width) {
  const u = (x - x0 - v * tau) / width;
  return Math.exp(-u * u);
}

export const newtonSpeed = (P, rho) => Math.sqrt(P / rho);
export const laplaceSpeed = (gamma, P, rho) => Math.sqrt((gamma * P) / rho);
export const percentLow = (gamma) => (1 - 1 / Math.sqrt(gamma)) * 100;

// Squeeze a gas from volume V0 to V0(1 − s): isothermal P·V = const, adiabatic P·V^γ = const.
export const isoP = (s, P0 = 1) => P0 / (1 - s);
export const adiaP = (s, gamma, P0 = 1) => P0 / (1 - s) ** gamma;

export const AIR = { P: 1.013e5, rho: 1.29, gamma: 1.4 }; // dry air at 0 °C and 1 atm

// Stiffness is Y for a solid rod, B for water, γP for a gas (all in pascals); density in kg/m³.
export const MATERIALS = {
  air: { name: 'Air', modulus: 'γP', stiffness: AIR.gamma * AIR.P, rho: AIR.rho },
  water: { name: 'Water', modulus: 'B', stiffness: 2.2e9, rho: 1000 },
  aluminium: { name: 'Aluminium', modulus: 'Y', stiffness: 7.0e10, rho: 2700 },
  steel: { name: 'Steel', modulus: 'Y', stiffness: 2.0e11, rho: 7800 },
};

export const materialSpeed = (m) => Math.sqrt(m.stiffness / m.rho);
