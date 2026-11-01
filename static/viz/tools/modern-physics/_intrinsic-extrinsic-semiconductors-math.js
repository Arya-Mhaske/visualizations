// Pure maths for the Intrinsic & Extrinsic Semiconductors box (NCERT XII 14.3-14.4). No DOM.
// NCERT numbers: silicon has 5 x 10^28 atoms per m^3 and n_i = 1.5 x 10^16 per m^3 at 300 K (Ex 14.2).
export const N_SI = 5e28;
export const NI_SI = 1.5e16;
export const NI_GE = 2.4e19;

// ---- a hole hops: one vacancy in a row of bonds, an electric field along +x ----
// The vacancy starts at site `start`. Each hop, the electron on the downstream side steps into it (against E),
// so the vacancy moves with E by one site. Returns each site's state after k hops.
export const ROW = 11;
export const START = 5;
export function hopRow(k, dir = 1) {
  const vacancy = START + dir * k;
  const moved = [];
  for (let j = 0; j < ROW; j++) {
    const between = dir > 0 ? j > START && j <= vacancy : j < START && j >= vacancy;
    moved.push(between);
  }
  return { vacancy, moved };
}
// Sum of (charge x displacement) of the electrons that moved, in units of e x spacing.
// k electrons each charge -e moved one spacing against the field: k x (-e) x (-dir x d) = +dir x k (e d),
// exactly one charge +e moved k spacings along the field.
export function dipoleShift(k, dir = 1) {
  const { moved } = hopRow(k, dir);
  return moved.filter(Boolean).length * (-1) * (-dir);
}

// ---- doping ----
export const donorsFromPpm = (ppm, atoms = N_SI) => atoms * ppm * 1e-6;
export const ppmFromDonors = (donors, atoms = N_SI) => (donors / atoms) * 1e6;

// Charge neutrality n = p + N (N = N_D - N_A) and the mass-action law n p = ni^2 give a quadratic.
export function carriers(net, ni = NI_SI) {
  const half = net / 2;
  const root = Math.sqrt(half * half + ni * ni);
  const n = net >= 0 ? half + root : ni * ni / (root - half);
  const p = net >= 0 ? ni * ni / n : root - half;
  return { n, p };
}

// ---- adding donors to a crystal: recombination, closed form ----
// Right after dopants are added: n = ni + ND, p = ni. Rate dp/dt = r (ni^2 - n p) with n = p + ND.
// With a, b the roots of the same quadratic, p = (a + rho b) / (1 - rho) and rho = C e^(-tau), tau = r (a+b) t.
export function settle(ND, tau, ni = NI_SI) {
  const a = (2 * ni * ni) / (ND + Math.sqrt(ND * ND + 4 * ni * ni)); // stable form: the plain root loses digits
  const b = a + ND;
  const C = (ni - a) / (ni + b);
  const rho = C * Math.exp(-tau);
  const p = (a + rho * b) / (1 - rho);
  const n = p + ND;
  return { n, p, np: n * p, lost: ni - p };
}

// ---- neutrality in a window of crystal ----
// d dopant atoms, `out` mobile carriers pulled out of the window. Returns fixed and mobile charge in units of e.
export function neutrality(d, kind, out = 0) {
  const fixed = kind === 'n' ? d : -d; // ionised cores: donors +, acceptors -
  const mobileSign = kind === 'n' ? -1 : 1; // electrons -, holes +
  const mobile = mobileSign * (d - out);
  return { fixed, mobile, net: fixed + mobile };
}

// ---- dopants ----
export const DOPANTS = [
  { sym: 'P', name: 'Phosphorus', group: 15, valence: 5 },
  { sym: 'As', name: 'Arsenic', group: 15, valence: 5 },
  { sym: 'Sb', name: 'Antimony', group: 15, valence: 5 },
  { sym: 'B', name: 'Boron', group: 13, valence: 3 },
  { sym: 'Al', name: 'Aluminium', group: 13, valence: 3 },
  { sym: 'In', name: 'Indium', group: 13, valence: 3 },
];
export function dopeKind(valence, host = 4) {
  return valence > host ? 'n' : valence < host ? 'p' : 'none';
}
