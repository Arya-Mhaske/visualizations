import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { carnot, drawCycle, GAS } from './_engines.js';
import { fixed } from '../../lib/format.js';

const state = { T1: 600, T2: 300, gas: 'mono', r: 2 };
const cyc = (s) => carnot(s.T1, s.T2, GAS[s.gas], s.r);

createTool({
  state,
  label: 'The Carnot cycle on a pressure against volume graph: two isotherms and two adiabats. The enclosed area is the work. A ledger compares the heat taken in at the hot temperature with the heat dumped at the cold temperature, and the ratio equals the ratio of temperatures whichever gas is used.',
  setup: (stage, c) => createPlot(stage, { c, x: [0, 100], y: [0, 600] }),
  draw(ctx, stage, c, plot) {
    const cy = cyc(state);
    plot.setRange([0, cy.VC * 1.12], [0, cy.pts.A[1] * 1.15]);
    plot.axes({ xLabel: 'V (L)', yLabel: 'P (kPa)' });
    drawCycle(plot, cy, c);
    for (const [k, p] of Object.entries(cy.pts)) {
      plot.point(p[0], p[1], { fill: c.paper, r: 6 });
      plot.text(k, p[0] + (k === 'A' || k === 'D' ? -(cy.VC * 0.04) : cy.VC * 0.04), p[1] + cy.pts.A[1] * 0.06, { size: 12, patch: false });
    }
  },
  controls: [
    { title: 'Run a Carnot cycle' },
    { key: 'T1', label: 'Hot T₁ (K)', min: 400, max: 1000, step: 50 },
    { key: 'T2', label: 'Cold T₂ (K)', min: 100, max: 390, step: 10 },
    { key: 'gas', label: 'Working gas', options: [['mono', 'Monatomic'], ['di', 'Diatomic']] },
    { key: 'r', label: 'Expansion ratio V_B/V_A', min: 1.5, max: 4, step: 0.5, format: (v) => fixed(v, 1) },
    { readout: [
      ['Q₁ in at T₁', (s) => `${fixed(cyc(s).Q1, 0)} J`],
      ['Q₂ out at T₂', (s) => `${fixed(cyc(s).Q2, 0)} J`],
      ['Q₂/Q₁ and T₂/T₁', (s) => `${fixed(cyc(s).Q2 / cyc(s).Q1, 4)} and ${fixed(s.T2 / s.T1, 4)}`],
      ['Loop area = W', (s) => `${fixed(cyc(s).area, 0)} J = ${fixed(cyc(s).W, 0)} J`],
      ['Efficiency', (s) => `${fixed(cyc(s).eta * 100, 1)} %`],
    ] },
  ],
  tex: (s) => `\\eta=1-\\dfrac{Q_2}{Q_1}=1-\\dfrac{T_2}{T_1}=1-\\dfrac{${s.T2}}{${s.T1}}=${fixed(1 - s.T2 / s.T1, 3)}`,
});
