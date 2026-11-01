// The p-n junction and diode (XII 14.5–14.6). One model runs through the whole box, so the six tools agree with each other.
//   Barrier V0 = 0.7 V (Si). Diffusion beats drift only while the barrier is low: diffusion = R e^(-Vj/VT) in units of the drift current,
//   with R = e^(V0/VT). It meets drift (= 1) at Vj = V0. A bias V changes the barrier to Vj = V0 − V, so the net current is
//   I = Is (e^(V/VT) − 1): the diode equation falls out of the same picture.
//   Depletion width is the abrupt-junction formula W = sqrt(2 ε Vj / e · (1/NA + 1/ND)).
// Reuse in `rectifiers` (diodeCurrent, forwardCurrent).
export const Q = 1.602176634e-19; // C
export const K_B = 1.380649e-23; // J/K
export const T_ROOM = 300; // K
export const thermalVoltage = (T = T_ROOM) => (K_B * T) / Q;
export const VT = thermalVoltage();
export const V0 = 0.7; // V, silicon (NCERT)
export const EPS_SI = 11.7 * 8.854e-12; // F/m
export const N_DOPE = 1e22; // m⁻³ on each side
export const N_I = 1.5e16; // m⁻³, intrinsic carriers in Si (NCERT)
export const RATIO = Math.exp(V0 / VT);

// ---- Depletion layer ----
export const widthAt = (Vj, NA = N_DOPE, ND = N_DOPE) => Math.sqrt(((2 * EPS_SI * Math.max(Vj, 0)) / Q) * (1 / NA + 1 / ND));
export const W0 = widthAt(V0);
export const peakField = (Vj) => (Vj > 0 ? (2 * Vj) / widthAt(Vj) : 0); // V/m, at the junction (triangular field)
export const barrierFromDoping = (NA = N_DOPE, ND = N_DOPE) => VT * Math.log((NA * ND) / (N_I * N_I)); // V
export const minorityShare = (N = N_DOPE) => (N_I * N_I) / (N * N); // minority ÷ majority carriers

// Barrier after time t (units where drift would take one unit to refill the layer; the real time is far shorter).
// Closed form of dVb/dt = a(R e^(−Vb/VT) − 1): Vb = VT ln(R − (R − 1) e^(−at)).
export const barrierAt = (t) => VT * Math.log1p((RATIO - 1) * -Math.expm1(-t));
export const diffusionRel = (Vj) => RATIO * Math.exp(-Vj / VT); // in units of the drift current
// The tool counts time as t = 10^k units, k from 0 to 13, where one unit is 10⁻¹² of the refill time above.
export const LOG_T_MIN = 0;
export const LOG_T_MAX = 13;
export const refillTime = (k) => 10 ** (k - 12);
// The barrier, width and currents of the tool: Vb from the join, then a bias V on top.
export const junctionAt = (k, V) => {
  const Vb = barrierAt(refillTime(k));
  const Vj = Math.max(Vb - V, 0.01);
  return { Vb, Vj, width: widthAt(Vj), diffusion: diffusionRel(Vj), drift: 1 };
};

// Electron energy across the layer (eV), n side at height 0 in equilibrium. x in metres from the junction, h = W/2.
export function electronEnergy(x, Vj, h) {
  if (x <= -h) return Vj;
  if (x >= h) return 0;
  return x < 0 ? Vj * (1 - (x + h) ** 2 / (2 * h * h)) : (Vj * (h - x) ** 2) / (2 * h * h);
}
// Levels of the two bulks when a bias V is applied: p fixed at V0, n at V.
export const bulkLevels = (V) => ({ p: V0, n: V });

// ---- The diode curve ----
export const IS = 4.4e-15; // A: sets 2.5 mA at 0.7 V, so the dynamic resistance there is about 10 Ω
export const I_GEN = 0.3e-6; // A: pairs generated in the layer, at the zero-bias width
export const ableToClimb = (V) => Math.exp(-(V0 - V) / VT); // share of n-side electrons that can reach the top of the barrier
export const forwardCurrent = (V) => IS * Math.expm1(V / VT);
export const reverseWidthFactor = (V) => Math.sqrt(Math.max(V0 - V, 0) / V0); // W(V)/W0 for V ≤ 0
export const diodeCurrent = (V) => (V >= 0
  ? forwardCurrent(V)
  : (IS + I_GEN * reverseWidthFactor(V)) * Math.expm1(V / VT));
export const ratioR = (V, I) => V / I;
export const secantR = (V1, V2) => (V2 - V1) / (diodeCurrent(V2) - diodeCurrent(V1));
export const dynamicR = (V) => VT / (IS * Math.exp(V / VT)); // dV/dI of the forward curve

// ---- Breakdown ----
export const MILLER_N = 4;
export const ionProb = (Vr, Vbr) => Math.min((Math.abs(Vr) / Vbr) ** MILLER_N, 1);
export const multiplication = (Vr, Vbr) => {
  const p = ionProb(Vr, Vbr);
  return p >= 1 ? Infinity : 1 / (1 - p);
};
// Size of the reverse current (A) at reverse voltage Vr ≥ 0: the minority-carrier current of the diode curve, times M.
export const reverseCurrent = (Vr, Vbr) => -diodeCurrent(-Math.abs(Vr)) * multiplication(Vr, Vbr);
// One minority carrier crosses the layer. With probability p it frees a new pair, and the new carrier crosses too.
// Returns how many carriers crossed in all (capped, so a runaway stays finite).
export function chain(next, p, cap = 60) {
  let n = 1;
  while (n < cap && next() < p) n += 1;
  return n;
}

// ---- Two flat slabs ----
export const ATOM_SPACING = 2.5e-10; // m (NCERT: 2–3 Å)
export const CONTACT_GAP = 3e-10; // m: close enough to bond
export const POLISH = { filed: 1e-5, ground: 1e-6, polished: 1e-7 }; // rms roughness, m
const LENGTH_FACTOR = 100; // sample length = 100 × rms
const WAVES = 14;

function rngFrom(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// A rough surface: a sum of sine waves from the whole length down to about a tenth of the rms, with smaller ones weaker,
// scaled so the root-mean-square height is exactly rms.
export function surface(seed, rms) {
  const next = rngFrom(seed);
  const length = LENGTH_FACTOR * rms;
  const waves = Array.from({ length: WAVES }, (_, k) => {
    const wavelength = length * 0.62 ** k;
    return { k: (2 * Math.PI) / wavelength, amp: wavelength ** 1.2, phase: next() * 2 * Math.PI };
  });
  const power = waves.reduce((sum, w) => sum + (w.amp * w.amp) / 2, 0);
  const scale = rms / Math.sqrt(power);
  const h = (x) => waves.reduce((sum, w) => sum + w.amp * scale * Math.sin(w.k * x + w.phase), 0);
  return { h, length, rms, waves, scale };
}

// Two slabs pressed until they first touch. gaps(): sorted gap between them at SAMPLES points across the surface.
export const SAMPLES = 100000;
export function pressTogether(rms, seedA = 3, seedB = 8, samples = SAMPLES) {
  const a = surface(seedA, rms);
  const b = surface(seedB, rms);
  const dx = a.length / samples;
  const total = new Float64Array(samples);
  let top = -Infinity;
  let at = 0;
  for (let i = 0; i < samples; i++) {
    total[i] = a.h(i * dx) + b.h(i * dx);
    if (total[i] > top) { top = total[i]; at = i * dx; }
  }
  const gap = total.map((v) => top - v);
  const sorted = Float64Array.from(gap).sort();
  return { a, b, dx, top, at, gap, sorted, length: a.length };
}
// Share of the surface closer than the bonding distance when the slabs are pushed in by squash (m).
export function contactShare(press, squash = 0) {
  const limit = CONTACT_GAP + squash;
  let lo = 0;
  let hi = press.sorted.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (press.sorted[mid] <= limit) lo = mid + 1; else hi = mid;
  }
  return lo / press.sorted.length;
}
export const medianGap = (press) => press.sorted[press.sorted.length >> 1];
export const atomsTall = (rms) => rms / ATOM_SPACING;
