import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { isoP, workIsothermal } from './_thermo.js';
import { fixed } from '../../lib/format.js';

// Isothermal expansion of the gas at P V = 1000 J: P = 1000/V from 10 L to V2.
const state = { n: 3, V2: 30 };
const P = isoP(100, 10);
const V1 = 10;
const strips = (s) => Array.from({ length: s.n }, (_, i) => {
  const dV = (s.V2 - V1) / s.n;
  const a = V1 + i * dV;
  return { a, dV, P: P(a + dV / 2), dW: P(a + dV / 2) * dV };
});
const sum = (s) => strips(s).reduce((p, t) => p + t.dW, 0);

createTool({
  state,
  label: 'The curve of pressure against volume for a gas expanding at constant temperature. The region under it is cut into thin strips. Each strip is a small push P times dV. More strips fit the curve more closely and the total approaches the true area.',
  setup: (stage, c) => createPlot(stage, { c, x: [0, 40], y: [0, 120] }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'V (L)', yLabel: 'P (kPa)' });
    for (const t of strips(state)) {
      plot.shade(() => t.P, null, t.a, t.a + t.dV, c.fillY);
      plot.segment(t.a, 0, t.a, t.P, { width: 1.5 });
      plot.segment(t.a + t.dV, 0, t.a + t.dV, t.P, { width: 1.5 });
      plot.segment(t.a, t.P, t.a + t.dV, t.P, { color: c.a, width: 2 });
    }
    plot.fn(P, { color: c.a, domain: [5, 40] });
  },
  controls: [
    { title: 'Slice the expansion' },
    { key: 'n', label: 'Number of strips', min: 1, max: 30, step: 1 },
    { key: 'V2', label: 'End volume (L)', min: 15, max: 40, step: 5 },
    { readout: [
      ['Strip width dV', (s) => `${fixed((s.V2 - V1) / s.n, 2)} L`],
      ['Sum of P·dV', (s) => `${fixed(sum(s), 1)} J`],
      ['True area', (s) => `${fixed(workIsothermal(100, V1, s.V2), 1)} J`],
    ] },
  ],
  tex: (s) => `W=\\sum P\\,\\Delta V=${fixed(sum(s), 1)}\\ \\mathrm{J}\\ \\to\\ \\int_{V_1}^{V_2}P\\,dV=${fixed(workIsothermal(100, V1, s.V2), 1)}\\ \\mathrm{J}`,
});
