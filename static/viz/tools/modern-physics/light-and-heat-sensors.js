import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed, sig } from '../../lib/format.js';
import { photonEv, KB_EV, thresholdNm } from './_mp.js';

// A semiconductor between a 5 V supply and an ammeter. Heat: the carriers n_i ∝ e^(−Eg/2kT), so conductance rises with T.
// Light: a photon with hν ≥ Eg lifts one electron across the gap, so conductance rises with brightness (above threshold only).
const V = 5;
const G300 = 0.1; // μS in the dark at 300 K
const state = { mode: 'h', Eg: 1.1, T: 300, nm: 600, lux: 50 };
const gHeat = (Eg, T) => G300 * Math.exp((Eg / (2 * KB_EV)) * (1 / 300 - 1 / T));
const gLight = (s) => 0.02 + (photonEv(s.nm) >= s.Eg ? 0.04 * s.lux : 0);
const current = (s) => V * (s.mode === 'h' ? gHeat(s.Eg, s.T) : gLight(s)); // μA

const tool = createTool({
  state,
  label: 'A graph of the current in a semiconductor sensor. In heat mode, the logarithm of current in microamps rises steeply with temperature. In light mode, the current in microamps rises in a straight line with brightness when the photons carry enough energy for the gap, and stays near zero when they do not.',
  setup: (stage, c) => createPlot(stage, { x: [250, 400], y: [-1, 4], c, pad: 30 }),
  draw(ctx, stage, c, plot) {
    if (state.mode === 'h') {
      const lo = Math.log10(V * gHeat(state.Eg, 250));
      const hi = Math.log10(V * gHeat(state.Eg, 400));
      plot.setRange([250, 400], [Math.floor(lo) - 0.5, Math.ceil(hi) + 0.5]);
      plot.axes({ xLabel: 'T (K)', yLabel: 'log₁₀ I (μA)' });
      plot.fn((T) => Math.log10(V * gHeat(state.Eg, T)), { color: c.b });
      plot.point(state.T, Math.log10(current(state)), { fill: c.a, r: 7 });
    } else {
      plot.setRange([0, 100], [0, 25]);
      plot.axes({ xLabel: 'lux', yLabel: 'I (μA)' });
      plot.fn((L) => V * gLight({ ...state, lux: L }), { color: c.b });
      plot.point(state.lux, current(state), { fill: c.a, r: 7 });
    }
  },
  controls: () => [
    { title: 'A sensor on a 5 V supply' },
    { key: 'mode', label: 'Sensing', options: [['h', 'heat'], ['l', 'light']] },
    { key: 'Eg', label: 'Band gap Eg', min: 0.3, max: 3, step: 0.05, format: (v) => `${fixed(v, 2)} eV` },
    { key: 'T', label: 'Temperature', min: 250, max: 400, step: 5, format: (v) => `${v} K` },
    { key: 'nm', label: 'Light wavelength', min: 350, max: 1300, step: 10, format: (v) => `${v} nm` },
    { key: 'lux', label: 'Brightness', min: 0, max: 100, step: 1, format: (v) => `${v} lux` },
    { readout: [
      ['Current', (s) => `${sig(current(s), 3)} μA`],
      ['Resistance', (s) => `${sig(V / current(s), 3)} MΩ`],
      ['Light threshold', (s) => `${Math.round(thresholdNm(s.Eg))} nm`],
      ['Photon energy', (s) => `${fixed(photonEv(s.nm), 2)} eV`],
    ] },
  ],
  onChange: (s) => sync(s),
  tex: (s) => (s.mode === 'h' ? `I\\propto n_i\\propto e^{-E_g/2kT}` : `h\\nu=${fixed(photonEv(s.nm), 2)}\\ \\text{eV}\\ ${photonEv(s.nm) >= s.Eg ? '\\geq' : '<'}\\ E_g=${fixed(s.Eg, 2)}\\ \\text{eV}`),
});

// Fields: 0 sensing, 1 Eg, 2 T, 3 wavelength, 4 brightness. Show only what the chosen mode uses.
const fields = [...document.querySelectorAll('#panel .nb-field')];
function sync(s) {
  if (fields.length < 5) return;
  fields[2].hidden = s.mode !== 'h';
  fields[3].hidden = s.mode !== 'l';
  fields[4].hidden = s.mode !== 'l';
}
sync(state);
tool.update();
