import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';

// Carbon dioxide, van der Waals: (P + a n²/V²)(V − n b) = n R T, for 1 mol. P in atm, V in L.
const RG = 0.08206;
const A = 3.64;
const B = 0.0427;
const state = { T: 320, V: 0.35, size: true, pull: true };
const ideal = (s, V = s.V) => (RG * s.T) / V;
const real = (s, V = s.V) => (RG * s.T) / (V - (s.size ? B : 0)) - (s.pull ? A : 0) / (V * V);

createTool({
  state,
  label: 'Pressure against molar volume for one mole of carbon dioxide. The ideal gas curve is a plain hyperbola. The real gas curve sits below it when attraction matters and above it when molecular size matters. At low temperature the real curve bends into a loop where the gas turns to liquid.',
  setup: (stage, c) => createPlot(stage, { c, x: [0.05, 1.5], y: [-20, 250] }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'V (L/mol)', yLabel: 'P (atm)' });
    plot.fn((V) => ideal(state, V), { color: c.grid, width: 3, dash: [6, 5], domain: [0.06, 1.5] });
    plot.fn((V) => real(state, V), { color: c.a, domain: [B + 0.005, 1.5] });
    plot.segment(state.V, 0, state.V, Math.min(250, ideal(state)), { width: 1.5, dash: [4, 4] });
    plot.point(state.V, ideal(state), { fill: c.paper, r: 5 });
    plot.point(state.V, real(state), { fill: c.a });
    plot.text('ideal', 1.15, ideal(state, 1.15) + 14, { size: 11, patch: false });
  },
  controls: [
    { title: 'Squeeze real CO₂' },
    { key: 'V', label: 'Molar volume V (L/mol)', min: 0.1, max: 1.5, step: 0.05, format: (v) => fixed(v, 2) },
    { key: 'T', label: 'Temperature (K)', min: 200, max: 500, step: 10 },
    { key: 'size', label: 'Molecules have size (b)', toggle: true },
    { key: 'pull', label: 'Molecules attract (a)', toggle: true },
    { readout: [
      ['P ideal', (s) => `${fixed(ideal(s), 1)} atm`],
      ['P real', (s) => `${fixed(real(s), 1)} atm`],
      ['Z = PV/RT', (s) => fixed((real(s) * s.V) / (RG * s.T), 3)],
    ] },
  ],
  tex: (s) => `\\left(P+\\dfrac{a}{V^{2}}\\right)(V-b)=RT\\ \\Rightarrow\\ P=\\dfrac{RT}{V-b}-\\dfrac{a}{V^{2}}=${fixed(real(s), 1)}\\ \\mathrm{atm}`,
});
