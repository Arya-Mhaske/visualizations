import { createTool } from '../../lib/tool.js';
import { createTimeline } from '../../lib/timeline.js';
import { transport } from '../../lib/sim.js';
import { fixed, piFrac } from '../../lib/format.js';
import { TAU } from './_sine-cosine-math.js';
import { drawSpinnerWave, fit, makePlot } from './_sine-cosine-view.js';

const CYCLE = 8;
const SPAN = 2 * TAU;
const state = { t: 1.3, k: 1 };
const line = createTimeline(document.querySelector('#stage'), state, { cycle: () => CYCLE, update: () => tool.update() });
const now = (s) => (s.t / CYCLE) * SPAN;
const show = (x) => piFrac(x) ?? fixed(x, 2);

const tool = createTool({
  state,
  label: 'A spinner whose axle you can lift up or down, and the wave it draws. The wave moves up and down with the axle and keeps its shape. The dashed line through the axle is the middle line of the wave. The faint curve is the wave with the axle at zero.',
  setup: (stage, c) => makePlot(stage, c, { x0: 0, span: SPAN }),
  draw(ctx, stage, c, plot) {
    fit(stage, plot, 0, SPAN);
    plot.axes({ xLabel: 'x', yLabel: 'y' });
    drawSpinnerWave(ctx, stage, c, plot, 0, now(state), [{ A: 1, B: 1, C: 0, k: state.k, color: c.a }], { ghost: Math.sin });
  },
  controls: () => [
    { title: 'Lift the axle' },
    { key: 'k', label: 'Height of the axle, k', min: -1, max: 1, step: 0.25, format: (n) => fixed(n, 2) },
    { key: 't', label: 'The clock, x', min: 0, max: CYCLE, step: 0.02, format: (n) => show((n / CYCLE) * SPAN) },
    transport(line.clock),
    { readout: [
      ['Middle line', (s) => `y = ${fixed(s.k, 2)}`],
      ['Highest point', (s) => fixed(s.k + 1, 2)],
      ['Lowest point', (s) => fixed(s.k - 1, 2)],
      ['Height now', (s) => fixed(s.k + Math.sin(now(s)), 3)],
    ] },
  ],
  tex: (s) => `y=k+\\sin x=${fixed(s.k, 2)}+${fixed(Math.sin(now(s)), 3)}=${fixed(s.k + Math.sin(now(s)), 3)}`,
  onChange: () => line.sync(),
});
line.sync();
tool.update();
