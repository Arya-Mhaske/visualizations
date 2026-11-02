import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { photonEv, METALS, phiOf, thresholdNm } from './_mp.js';

// A photocell in a light-meter or street-light circuit: one electron per photon that has enough energy
// (quantum efficiency 10%), so the current follows the number of photons, not the colour, above threshold.
const state = { metal: 'K', nm: 450, lux: 60 };
const EFF = 0.1;
const ON_AT = 2; // microamps at which the relay switches the lamp off (it is bright enough)
// photons per second per unit of brightness ~ proportional to lux * wavelength (fixed power, longer wavelength = more photons)
const current = (s) => {
  if (photonEv(s.nm) < phiOf(s.metal)) return 0;
  return (s.lux * (s.nm / 450) * EFF * 0.5);
};

const tool = createTool({
  state,
  label: 'A graph of photocurrent in microamps against brightness in lux. A straight line through the origin rises when the photons are energetic enough and lies flat on zero when they are not. A dashed horizontal line marks the current at which a street-light relay switches the lamp off.',
  setup: (stage, c) => createPlot(stage, { x: [0, 100], y: [0, 6], c, pad: 28 }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'lux', yLabel: 'I (μA)' });
    plot.segment(0, ON_AT, 100, ON_AT, { color: c.ink, width: 2, dash: [5, 4] });
    plot.text('relay: lamp off above this', 98, ON_AT + 0.35, { align: 'right', size: 10 });
    plot.fn((x) => current({ ...state, lux: x }), { color: c.a });
    const i = current(state);
    plot.point(state.lux, i, { fill: i >= ON_AT ? c.c : c.a, r: 7 });
  },
  controls: () => [
    { title: 'Light on a photocell' },
    { key: 'metal', label: 'Cathode metal', options: METALS.slice(0, 4).map(([k]) => [k, k]) },
    { key: 'nm', label: 'Colour (wavelength)', min: 250, max: 700, step: 10, format: (v) => `${v} nm` },
    { key: 'lux', label: 'Brightness', min: 0, max: 100, step: 1, format: (v) => `${v} lux` },
    { readout: [
      ['Photon energy', (s) => `${fixed(photonEv(s.nm), 2)} eV`],
      ['Threshold wavelength', (s) => `${Math.round(thresholdNm(phiOf(s.metal)))} nm`],
      ['Photocurrent', (s) => `${fixed(current(s), 2)} μA`],
      ['Street lamp', (s) => ({ text: current(s) >= ON_AT ? 'OFF (it is day)' : 'ON', good: current(s) < ON_AT })],
    ] },
  ],
  tex: (s) => `\\lambda_0=\\dfrac{hc}{\\phi_0}=${Math.round(thresholdNm(phiOf(s.metal)))}\\ \\text{nm}\\ \\Rightarrow\\ I\\propto\\text{brightness for }\\lambda<\\lambda_0`,
});

tool.update();
