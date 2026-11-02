// Rectifier maths, shared by the whole rectifiers box. Times in seconds, voltages in volts.
// Source v = Vm sin(2π f t). A diode drops `drop` volts when on. Half-wave: one diode. Full-wave (centre tap or bridge):
// the same, applied to |v| (bridge: two diodes in line, so twice the drop). With a filter, the capacitor follows the
// rectified source upward and otherwise discharges through R_L: v_C ← v_C e^(−dt/RC).
export const rectified = (v, mode, drop) => {
  if (mode === 'half') return Math.max(0, v - drop);
  return Math.max(0, Math.abs(v) - drop);
};

let cache = { key: '', data: null };
export function run({ mode, Vm, f = 50, drop = 0.7, C = 0, R = 1000, T = 0.1, dt = 2e-5 }) {
  const key = [mode, Vm, f, drop, C, R, T, dt].join('|');
  if (cache.key === key) return cache.data;
  const n = Math.round(T / dt);
  const out = new Float64Array(n + 1);
  const src = new Float64Array(n + 1);
  let vc = 0;
  const tau = R * C;
  for (let i = 0; i <= n; i++) {
    const v = Vm * Math.sin(2 * Math.PI * f * i * dt);
    const s = rectified(v, mode, drop);
    src[i] = s;
    if (C <= 0) vc = s;
    else if (s > vc) vc = s;
    else vc *= Math.exp(-dt / tau);
    out[i] = vc;
  }
  cache = { key, data: { out, src, dt, n } };
  return cache.data;
}
export const at = (series, dt, t) => series[Math.max(0, Math.min(series.length - 1, Math.round(t / dt)))];

// Peak-to-peak ripple and mean over the last `span` seconds of a run.
export function ripple(data, span = 0.04) {
  const from = Math.max(0, data.n - Math.round(span / data.dt));
  let lo = Infinity;
  let hi = -Infinity;
  let sum = 0;
  for (let i = from; i <= data.n; i++) {
    lo = Math.min(lo, data.out[i]);
    hi = Math.max(hi, data.out[i]);
    sum += data.out[i];
  }
  return { pp: hi - lo, mean: sum / (data.n - from + 1), max: hi, min: lo };
}
// Textbook ripple: ΔV ≈ V_peak / (f_out R C)
export const ripplePredict = (Vpeak, fOut, R, C) => (C > 0 ? Vpeak / (fOut * R * C) : Vpeak);
export const meanIdeal = (Vm, mode) => (mode === 'half' ? Vm / Math.PI : (2 * Vm) / Math.PI);
export const outFreq = (f, mode) => (mode === 'half' ? f : 2 * f);
