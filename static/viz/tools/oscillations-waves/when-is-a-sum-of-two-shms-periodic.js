import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { mismatch, repeatTime, sum } from './_shm-math.js';

const RATIOS = {
  '3:2': [1.5, '3/2', 2], '2:1': [2, '2', 1], '5:3': [5 / 3, '5/3', 3],
  root2: [Math.SQRT2, '√2', null], pi: [Math.PI, 'π', null],
};
const state = { ratio: '3:2', shift: 6.3 };
const ratio = (s) => RATIOS[s.ratio][0];
const period = (s) => RATIOS[s.ratio][2];
const gap = (s) => mismatch(ratio(s), s.shift);

createTool({
  state,
  label: 'The sum of two cosines, with a copy shifted in time. If the frequencies have a whole-number ratio, some shift lands the copy exactly on the original.',
  setup: (stage, c) => createPlot(stage, { x: [0, 40], y: [-2.4, 2.4], c }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 't (s)', yLabel: 'x' });
    plot.fn((t) => sum(ratio(state), t), { color: c.ink });
    plot.fn((t) => sum(ratio(state), t + state.shift), { color: c.a, width: 2, dash: [6, 4] });
  },
  controls: [
    { title: 'Slide a copy over itself' },
    { key: 'ratio', label: 'ω₁ : ω₂', options: [['3:2', '3 : 2'], ['2:1', '2 : 1'], ['5:3', '5 : 3'], ['root2', '√2 : 1'], ['pi', 'π : 1']] },
    { key: 'shift', label: 'Time shift, τ', min: 0, max: 40, step: 0.01, format: (v) => `${fixed(v, 2)} s` },
    { readout: [
      ['ω₁/ω₂', (s) => RATIOS[s.ratio][1]],
      ['Rational?', (s) => (period(s) ? 'yes' : 'no')],
      ['Biggest gap over 120 s', (s) => fixed(gap(s), 3)],
      ['Repeats every', (s) => (period(s) ? `${fixed(repeatTime(period(s)), 2)} s` : 'never exactly')],
    ] },
  ],
  tex: (s) => `x(t) = \\cos(${fixed(ratio(s), 3)}\\,t) + \\cos t,\\quad |x(t + ${fixed(s.shift, 2)}) - x(t)| \\le ${fixed(gap(s), 3)}`,
});
