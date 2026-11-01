import { createTool } from '../../lib/tool.js';
import { createTimeline } from '../../lib/timeline.js';
import { transport } from '../../lib/sim.js';
import { fixed, piFrac } from '../../lib/format.js';
import { TAU } from './_sine-cosine-math.js';
import { drawSpinnerWave, fit, makePlot } from './_sine-cosine-view.js';

const CYCLE = 8; // seconds for two turns
const SPAN = 2 * TAU;
const state = { t: 1.3 };
const line = createTimeline(document.querySelector('#stage'), state, { cycle: () => CYCLE, update: () => tool.update() });
const now = (s) => (s.t / CYCLE) * SPAN;
const show = (x) => piFrac(x) ?? fixed(x, 2);

const tool = createTool({
  state,
  label: 'A circle with an arrow that spins steadily. The height of the arrow tip is carried across to a graph, and the graph traces out a wave as the arrow turns. One full turn of the arrow draws one full cycle of the wave.',
  setup: (stage, c) => makePlot(stage, c, { x0: 0, span: SPAN }),
  draw(ctx, stage, c, plot) {
    fit(stage, plot, 0, SPAN);
    plot.axes({ xLabel: 'θ', yLabel: 'y' });
    drawSpinnerWave(ctx, stage, c, plot, 0, now(state), [{ A: 1, B: 1, C: 0, k: 0, color: c.a }]);
  },
  controls: () => [
    { title: 'Spin the arrow' },
    { key: 't', label: 'Angle turned, θ', min: 0, max: CYCLE, step: 0.02, format: (n) => `${show((n / CYCLE) * SPAN)} rad` },
    transport(line.clock),
    { readout: [
      ['Angle', (s) => `${fixed((now(s) * 180) / Math.PI, 0)}°`],
      ['Turns made', (s) => fixed(now(s) / TAU, 2)],
      ['Height of the tip, sin θ', (s) => fixed(Math.sin(now(s)), 3)],
    ] },
  ],
  tex: (s) => `\\sin\\theta=\\sin ${fixed(now(s), 2)}=${fixed(Math.sin(now(s)), 3)}`,
  onChange: () => line.sync(),
});
line.sync();
tool.update();
