import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { VERIFY, maxGap } from './_identities-math.js';

const state = { which: 0, step: 0, wrong: false };
const identity = (s = state) => VERIFY[s.which];
const lastStep = (s = state) => (s.wrong ? identity(s).wrong.at : identity(s).steps.length - 1);
const shown = (s = state) => {
  const list = identity(s).steps.slice(0, Math.min(s.step, lastStep(s)) + 1);
  if (s.wrong && s.step >= identity(s).wrong.at) list[identity(s).wrong.at] = identity(s).wrong;
  return list;
};
const current = (s = state) => shown(s)[shown(s).length - 1];
const gap = (s = state) => maxGap(current(s).f, identity(s).target.f);

createTool({
  state,
  label: 'A graph of the expression after the chosen step, in coral, over the target right-hand side in blue. If the step is a legal move, the coral curve lies exactly on the blue one. A wrong move makes the coral curve peel away.',
  setup: (stage, c) => createPlot(stage, { x: [0.1, 3.0], y: [-4, 4], ticks: 'auto', c }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'x', yLabel: 'y' });
    plot.fn(identity().target.f, { color: c.b, width: 8 });
    plot.fn(current().f, { color: c.a, width: 3 });
  },
  controls: [
    { title: 'Rewrite one side' },
    { key: 'which', label: 'Identity', options: [[0, '1'], [1, '2'], [2, '3']] },
    { key: 'step', label: 'Step', min: 0, max: 5, step: 1 },
    { key: 'wrong', label: 'Make a wrong move', toggle: true },
    { readout: [
      ['Identity', (s) => identity(s).name],
      ['This step', (s) => current(s).note],
      ['Biggest gap from target', (s) => ({ text: gap(s) < 1e-7 ? 'none: still equal' : fixed(gap(s), 3), good: gap(s) < 1e-7 })],
    ] },
  ],
  onChange(s) {
    s.step = Math.min(s.step, lastStep(s));
  },
  tex: (s) => `\\begin{aligned}${shown(s).map((x, i) => `${i ? '&=' : ''}${x.tex}`).join('\\\\')}\\end{aligned}`,
});
