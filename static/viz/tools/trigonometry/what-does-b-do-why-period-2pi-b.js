import { createTool } from '../../lib/tool.js';
import { createTimeline } from '../../lib/timeline.js';
import { transport } from '../../lib/sim.js';
import { fixed, piFrac } from '../../lib/format.js';
import { TAU, period } from './_sine-cosine-math.js';
import { drawSpinnerWave, fit, makePlot } from './_sine-cosine-view.js';

const CYCLE = 8;
const SPAN = 2 * TAU;
const state = { t: 1.3, B: 2 };
const line = createTimeline(document.querySelector('#stage'), state, { cycle: () => CYCLE, update: () => tool.update() });
const now = (s) => (s.t / CYCLE) * SPAN;
const show = (x) => piFrac(x) ?? fixed(x, 2);

const tool = createTool({
  state,
  label: 'A spinner that turns B times as fast, and the wave it draws. If B is 2, the arrow goes round twice for every one turn of the clock, so the wave squeezes to half the length. The faint curve is the wave for B equal to 1.',
  setup: (stage, c) => makePlot(stage, c, { x0: 0, span: SPAN }),
  draw(ctx, stage, c, plot) {
    fit(stage, plot, 0, SPAN);
    plot.axes({ xLabel: 'x', yLabel: 'y' });
    drawSpinnerWave(ctx, stage, c, plot, 0, now(state), [{ A: 1, B: state.B, C: 0, k: 0, color: c.a }], { ghost: Math.sin });
    plot.segment(0, -1.35, period(state.B), -1.35, { color: c.c, width: 4 });
    plot.text('one cycle', period(state.B) / 2, -1.7, { size: 11, color: c.c, patch: false });
  },
  controls: () => [
    { title: 'Spin it faster' },
    { key: 'B', label: 'Turns per 2π of x, B', min: 0.5, max: 4, step: 0.5, format: (n) => fixed(n, 1) },
    { key: 't', label: 'The clock, x', min: 0, max: CYCLE, step: 0.02, format: (n) => show((n / CYCLE) * SPAN) },
    transport(line.clock),
    { readout: [
      ['Arrow angle, Bx', (s) => `${fixed(((s.B * now(s)) * 180) / Math.PI, 0)}°`],
      ['Period, 2π ÷ B', (s) => `${show(period(s.B))} = ${fixed(period(s.B), 3)}`],
      ['Cycles in 4π', (s) => fixed(SPAN / period(s.B), 1)],
      ['Height now', (s) => fixed(Math.sin(s.B * now(s)), 3)],
    ] },
  ],
  tex: (s) => `\\text{period}=\\dfrac{2\\pi}{B}=\\dfrac{2\\pi}{${fixed(s.B, 1)}}=${fixed(period(s.B), 3)}`,
  onChange: () => line.sync(),
});
line.sync();
tool.update();
