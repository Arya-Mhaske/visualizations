import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { carnot, drawCycle } from './_engines.js';
import { fixed } from '../../lib/format.js';

// The hot reservoir is at 500 K. The engine must return to its start to run again. The return trip can only be cheaper if a colder place exists.
const T1 = 500;
const state = { T2: 500, r: 2 };
const cyc = (s) => carnot(T1, s.T2, 5 / 3, s.r);

createTool({
  state,
  label: 'A pressure against volume cycle for an engine that takes heat from a hot reservoir at 500 K. With the return stroke also at 500 K, the way out and the way back are the same curve and enclose no area, so no net work. Lowering the return temperature opens the loop and gives net work, but heat must be dumped into the cold place.',
  setup: (stage, c) => createPlot(stage, { c, x: [0, 80], y: [0, 500] }),
  draw(ctx, stage, c, plot) {
    const cy = cyc(state);
    plot.setRange([0, Math.max(40, cy.VC * 1.15)], [0, cy.pts.A[1] * 1.15]);
    plot.axes({ xLabel: 'V (L)', yLabel: 'P (kPa)' });
    if (state.T2 >= T1 - 1) {
      plot.fn(cy.curves[0], { color: c.a, domain: [cy.VA, cy.VB], width: 6 });
      plot.fn(cy.curves[0], { color: c.b, domain: [cy.VA, cy.VB], width: 3, dash: [8, 6] });
      plot.text('out and back: same curve', (cy.VA + cy.VB) / 2, cy.pts.A[1] * 1.08, { size: 11, patch: false });
    } else drawCycle(plot, cy, c);
    for (const [k, p] of Object.entries(cy.pts)) if (state.T2 < T1 - 1 || k < 'C') plot.point(p[0], p[1], { fill: c.paper });
  },
  controls: [
    { title: 'Try to run an engine' },
    { key: 'T2', label: 'Return temperature T₂ (K)', min: 100, max: 500, step: 25 },
    { key: 'r', label: 'Expansion ratio', min: 1.5, max: 4, step: 0.5, format: (v) => fixed(v, 1) },
    { readout: [
      ['Heat taken in Q₁', (s) => `${fixed(cyc(s).Q1, 0)} J`],
      ['Heat dumped Q₂', (s) => `${fixed(cyc(s).Q2, 0)} J`],
      ['Net work W', (s) => ({ text: `${fixed(cyc(s).W, 0)} J`, good: cyc(s).W > 1 })],
      ['W ÷ Q₁', (s) => fixed(cyc(s).eta, 3)],
    ] },
  ],
  tex: (s) => `W=Q_1-Q_2=${fixed(cyc(s).Q1, 0)}-${fixed(cyc(s).Q2, 0)}=${fixed(cyc(s).W, 0)}\\ \\mathrm{J}`,
});
