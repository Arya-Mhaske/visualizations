import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed, sig } from '../../lib/format.js';
import { liquidVisc, gasVisc, freeShare } from './_viscosity-math.js';

const state = { T: 293 };

createTool({
  state,
  label: 'Two curves of viscosity against temperature. The liquid curve falls as it gets hotter, the gas curve rises.',
  setup: (stage, c) => createPlot(stage, { x: [260, 410], y: [0, 2.4], c }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'T (K)', yLabel: 'η / η(293 K)' });
    plot.fn(liquidVisc, { color: c.b });
    plot.fn(gasVisc, { color: c.a });
    plot.point(state.T, liquidVisc(state.T), { fill: c.b });
    plot.point(state.T, gasVisc(state.T), { fill: c.a });
    plot.text('liquid', 275, liquidVisc(275) + 0.15, { align: 'left', patch: false });
    plot.text('gas', 395, gasVisc(395) - 0.2, { align: 'right', patch: false });
  },
  controls: [
    { title: 'Heat them' },
    { key: 'T', label: 'Temperature T (K)', min: 270, max: 400, step: 5 },
    { readout: [
      ['Liquid η (stickiness)', (s) => `×${fixed(liquidVisc(s.T), 2)}`],
      ['Gas η (traffic)', (s) => `×${fixed(gasVisc(s.T), 2)}`],
      ['Liquid molecules free', (s) => `${sig(freeShare(s.T) * 100, 2)}%`],
      ['Gas speed ∝ √T', (s) => `×${fixed(gasVisc(s.T), 2)}`],
    ] },
  ],
  tex: (s) => `\\eta_{\\text{liq}}\\propto e^{E/kT}=${fixed(liquidVisc(s.T), 2)}\\qquad \\eta_{\\text{gas}}\\propto\\sqrt T=${fixed(gasVisc(s.T), 2)}`,
});
