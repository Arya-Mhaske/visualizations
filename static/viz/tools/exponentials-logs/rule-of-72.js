import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { doublingYears } from './_exp-log-math.js';

const state = { R: 8 };
// R × (exact doubling time): the number the rule of 72 treats as constant.
const ruleNumber = (R) => R * doublingYears(R / 100);

createTool({
  state,
  label: 'A graph of the rate times the exact doubling time, for rates from 0.5 to 40 percent. If the rule of 72 were perfect this would be a flat line at 72. It rises gently from 69.3, which is 100 times the natural log of 2, and passes close to 72 around 8 percent, which is why 72 works well for everyday rates.',
  setup: (stage, c) => createPlot(stage, { x: [0, 40], y: [66, 86], c }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'rate R (%)', yLabel: 'R × years' });
    plot.segment(0, 72, 40, 72, { color: c.b, width: 3, dash: [8, 5] });
    plot.segment(0, 69.3147, 40, 69.3147, { color: c.c, width: 3, dash: [8, 5] });
    plot.fn(ruleNumber, { color: c.a, width: 4, domain: [0.3, 40] });
    plot.text('72', 37, 72.9, { color: c.b, size: 11, patch: false });
    plot.text('69.3 = 100 ln 2', 4, 68.6, { color: c.c, size: 10, align: 'left', patch: false });
    plot.segment(state.R, 66, state.R, ruleNumber(state.R), { color: c.grid, width: 2, dash: [4, 4] });
    plot.point(state.R, ruleNumber(state.R), { fill: c.fillY, r: 9 });
  },
  controls: [
    { title: 'Pick a growth rate' },
    { key: 'R', label: 'Rate R', min: 1, max: 40, step: 1, format: (v) => `${v}% a year` },
    { readout: [
      ['Exact doubling time', (s) => `${fixed(doublingYears(s.R / 100), 2)} years`],
      ['Rule of 72 says', (s) => `${fixed(72 / s.R, 2)} years`],
      ['Rule of 69.3 says', (s) => `${fixed(69.3147 / s.R, 2)} years`],
      ['Rate × exact time', (s) => fixed(ruleNumber(s.R), 2)],
    ] },
  ],
  tex: (s) => `t=\\dfrac{\\ln 2}{\\ln(1+${s.R / 100})}=${fixed(doublingYears(s.R / 100), 2)}\\ \\ \\text{and}\\ \\ \\dfrac{72}{${s.R}}=${fixed(72 / s.R, 2)}`,
});
