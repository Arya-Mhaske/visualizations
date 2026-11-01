import { createTool } from '../../lib/tool.js';
import { createTimeline } from '../../lib/timeline.js';
import { transport } from '../../lib/sim.js';
import { fixed, piFrac } from '../../lib/format.js';
import { TAU } from './_sine-cosine-math.js';
import { drawSpinnerWave, fit, makePlot } from './_sine-cosine-view.js';

const CYCLE = 8;
const SPAN = 2 * TAU;
const state = { t: 1.3 };
const line = createTimeline(document.querySelector('#stage'), state, { cycle: () => CYCLE, update: () => tool.update() });
const now = (s) => (s.t / CYCLE) * SPAN;
const show = (x) => piFrac(x) ?? fixed(x, 2);

const tool = createTool({
  state,
  label: 'Two arrows on one circle. The blue arrow turns steadily and its height traces the sine wave. The coral arrow is a quarter turn ahead of it. Its height traces the cosine wave. The height of the coral arrow equals the sideways shadow of the blue arrow, so the cosine wave is the sine wave started a quarter turn early.',
  setup: (stage, c) => makePlot(stage, c, { x0: 0, span: SPAN }),
  draw(ctx, stage, c, plot) {
    fit(stage, plot, 0, SPAN);
    plot.axes({ xLabel: 'θ', yLabel: 'y' });
    const x = now(state);
    drawSpinnerWave(ctx, stage, c, plot, 0, x, [
      { A: 1, B: 1, C: 0, k: 0, color: c.b, label: 'sin θ' },
      { A: 1, B: 1, C: Math.PI / 2, k: 0, color: c.a },
    ]);
  },
  controls: () => [
    { title: 'Two arrows, a quarter turn apart' },
    { key: 't', label: 'Angle turned, θ', min: 0, max: CYCLE, step: 0.02, format: (n) => `${show((n / CYCLE) * SPAN)} rad` },
    transport(line.clock),
    { readout: [
      ['sin θ (blue height)', (s) => fixed(Math.sin(now(s)), 3)],
      ['cos θ (coral height)', (s) => fixed(Math.cos(now(s)), 3)],
      ['sin(θ + π/2)', (s) => fixed(Math.sin(now(s) + Math.PI / 2), 3)],
      ['Blue arrow, sideways', (s) => fixed(Math.cos(now(s)), 3)],
    ] },
  ],
  tex: (s) => `\\cos\\theta=\\sin\\left(\\theta+\\dfrac{\\pi}{2}\\right)=${fixed(Math.cos(now(s)), 3)}`,
  onChange: () => line.sync(),
});
line.sync();
tool.update();
