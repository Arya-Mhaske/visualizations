import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { isoP, adiaP } from './_thermo.js';
import { fixed } from '../../lib/format.js';

// Both curves pass through (V = 10 L, P = 100 kPa, T = 300 K), so P V = 1000 J is 300 K and T = 0.3 P V.
const state = { V: 20, g: 1.4 };
const GAMMAS = [[1.67, '1.67'], [1.4, '1.40'], [1.33, '1.33']];

createTool({
  state,
  label: 'Two curves of pressure against volume through the same starting point. The isotherm falls as 1 over V. The adiabat falls faster because the gas also cools as it expands. Short tangent lines at the start show the adiabat is steeper by the factor gamma.',
  setup: (stage, c) => createPlot(stage, { c, x: [0, 32], y: [0, 350] }),
  draw(ctx, stage, c, plot) {
    const [iso, ad] = [isoP(100, 10), adiaP(100, 10, state.g)];
    plot.axes({ xLabel: 'V (L)', yLabel: 'P (kPa)' });
    plot.fn(iso, { color: c.b, domain: [4, 32] });
    plot.fn(ad, { color: c.a, domain: [4, 32] });
    plot.segment(6, 100 + 4 * 10, 14, 100 - 4 * 10, { color: c.b, width: 2, dash: [5, 4] });
    plot.segment(6, 100 + 4 * 10 * state.g, 14, 100 - 4 * 10 * state.g, { color: c.a, width: 2, dash: [5, 4] });
    plot.point(10, 100, { fill: c.c });
    plot.point(state.V, iso(state.V), { fill: c.b });
    plot.point(state.V, ad(state.V), { fill: c.a });
    plot.text('isotherm', 29, iso(29) + 22, { color: c.b, size: 11, patch: false });
    plot.text('adiabat', 24, ad(24) - 24, { color: c.a, size: 11, patch: false });
  },
  controls: [
    { title: 'Expand or compress the gas' },
    { key: 'V', label: 'Volume V (L)', min: 5, max: 30, step: 1 },
    { key: 'g', label: 'Gas γ', options: GAMMAS },
    { readout: [
      ['Isotherm P', (s) => `${fixed(isoP(100, 10)(s.V), 1)} kPa, T = 300 K`],
      ['Adiabat P', (s) => `${fixed(adiaP(100, 10, s.g)(s.V), 1)} kPa`],
      ['Adiabat T', (s) => `${fixed(0.3 * adiaP(100, 10, s.g)(s.V) * s.V, 0)} K`],
      ['Slope ratio at start', (s) => `${fixed(s.g, 2)} ×`],
    ] },
  ],
  tex: (s) => `PV=\\text{const}\\ \\ \\text{vs}\\ \\ PV^{${fixed(s.g, 2)}}=\\text{const}:\\quad \\dfrac{dP}{dV}\\Big|_{ad}=-\\gamma\\dfrac{P}{V}`,
});
