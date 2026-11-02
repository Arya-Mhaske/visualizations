import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { photonEv, kmax, phiOf } from './_mp.js';

// Sodium. Electrons leave with energies spread from 0 up to K_max (an illustrative spread). A retarding
// voltage -V stops those with K < eV. The stopping potential is where the very last one is stopped: V0 = K_max / e.
const PHI = phiOf('Na');
const state = { nm: 300, I: 3 };
const SAT = 10; // microamps per unit of brightness
const V0 = (nm) => kmax(photonEv(nm), PHI); // in volts, since K is in eV
const current = (V, nm, I) => {
  const v0 = V0(nm);
  if (v0 <= 0) return 0;
  const f = V >= 0 ? 1 : Math.max(0, 1 - -V / v0);
  return I * SAT * f;
};

const tool = createTool({
  state,
  label: 'A graph of photocurrent in microamps against the voltage between plate and collector. The blue dashed curve is the reference brightness 1; the coral curve is the brightness you chose. Both start from zero at the same negative voltage, the stopping potential, and both level off. Only the height of the level part differs.',
  setup: (stage, c) => createPlot(stage, { x: [-3, 4], y: [0, 45], c, pad: 28 }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'V (volt)', yLabel: 'I (μA)' });
    plot.fn((V) => current(V, state.nm, 1), { color: c.b, dash: [7, 5], width: 3 });
    plot.fn((V) => current(V, state.nm, state.I), { color: c.a });
    const v0 = V0(state.nm);
    if (v0 > 0) {
      plot.segment(-v0, 0, -v0, 45, { color: c.ink, width: 2, dash: [4, 4] });
      plot.point(-v0, 0, { fill: c.c, r: 6 });
      plot.text(`−V₀ = −${fixed(v0, 2)} V`, -v0 + 0.1, 40, { align: 'left', size: 11 });
    }
  },
  controls: () => [
    { title: 'Brighten the light' },
    { key: 'I', label: 'Brightness (×)', min: 1, max: 4, step: 1 },
    { key: 'nm', label: 'Colour (wavelength)', min: 250, max: 440, step: 10, format: (v) => `${v} nm` },
    { readout: [
      ['Stopping potential V₀', (s) => `${fixed(V0(s.nm), 2)} V`],
      ['K_max', (s) => `${fixed(V0(s.nm), 2)} eV`],
      ['Saturation current', (s) => `${s.I * SAT} μA`],
    ] },
  ],
  tex: (s) => `eV_0=K_{max}=h\\nu-\\phi_0=${fixed(V0(s.nm), 2)}\\ \\text{eV}`,
});

tool.update();
