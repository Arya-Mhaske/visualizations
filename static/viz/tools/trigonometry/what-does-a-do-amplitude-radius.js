import { createTool } from '../../lib/tool.js';
import { createTimeline } from '../../lib/timeline.js';
import { transport } from '../../lib/sim.js';
import { fixed, piFrac } from '../../lib/format.js';
import { TAU } from './_sine-cosine-math.js';
import { drawSpinnerWave, fit, makePlot } from './_sine-cosine-view.js';

const CYCLE = 8;
const SPAN = 2 * TAU;
const state = { t: 1.3, A: 1.5 };
const line = createTimeline(document.querySelector('#stage'), state, { cycle: () => CYCLE, update: () => tool.update() });
const now = (s) => (s.t / CYCLE) * SPAN;
const show = (x) => piFrac(x) ?? fixed(x, 2);

const tool = createTool({
  state,
  label: 'A spinner whose radius you can change, and the wave it draws. A bigger circle gives a taller wave. The faint curve behind is the wave for radius 1, so you can compare heights. The wave rises and falls between plus and minus the radius.',
  setup: (stage, c) => makePlot(stage, c, { x0: 0, span: SPAN }),
  draw(ctx, stage, c, plot) {
    fit(stage, plot, 0, SPAN);
    plot.axes({ xLabel: 'θ', yLabel: 'y' });
    drawSpinnerWave(ctx, stage, c, plot, 0, now(state), [{ A: state.A, B: 1, C: 0, k: 0, color: c.a }], { ghost: Math.sin });
  },
  controls: () => [
    { title: 'Grow the circle' },
    { key: 'A', label: 'Radius = amplitude, A', min: 0.25, max: 1.5, step: 0.25, format: (n) => fixed(n, 2) },
    { key: 't', label: 'Angle turned, θ', min: 0, max: CYCLE, step: 0.02, format: (n) => `${show((n / CYCLE) * SPAN)} rad` },
    transport(line.clock),
    { readout: [
      ['Highest point', (s) => fixed(s.A, 2)],
      ['Lowest point', (s) => fixed(-s.A, 2)],
      ['Height now, A sin θ', (s) => fixed(s.A * Math.sin(now(s)), 3)],
      ['Where the wave repeats', () => '2π (A does not change it)'],
    ] },
  ],
  tex: (s) => `y=A\\sin\\theta=${fixed(s.A, 2)}\\sin ${fixed(now(s), 2)}=${fixed(s.A * Math.sin(now(s)), 3)}`,
  onChange: () => line.sync(),
});
line.sync();
tool.update();
