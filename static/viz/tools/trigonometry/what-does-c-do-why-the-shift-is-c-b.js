import { createTool } from '../../lib/tool.js';
import { createTimeline } from '../../lib/timeline.js';
import { transport } from '../../lib/sim.js';
import { fixed, piFrac } from '../../lib/format.js';
import { TAU, shift } from './_sine-cosine-math.js';
import { drawSpinnerWave, fit, makePlot } from './_sine-cosine-view.js';

const CYCLE = 8;
const SPAN = 2 * TAU;
const X0 = -Math.PI;
const state = { t: 0.3, B: 2, C: 1.57 };
const line = createTimeline(document.querySelector('#stage'), state, { cycle: () => CYCLE, update: () => tool.update() });
const now = (s) => X0 + (s.t / CYCLE) * SPAN;
const show = (x) => piFrac(x) ?? fixed(x, 2);

const tool = createTool({
  state,
  label: 'A spinner that starts an angle C ahead of the clock and turns B times as fast, and the wave it draws. Starting ahead makes the wave start early, so the curve moves left. The shift is C divided by B, because a faster arrow covers the head start sooner. The faint curve is the wave with no head start, and a marker shows where the new cycle begins.',
  setup: (stage, c) => makePlot(stage, c, { x0: X0, span: SPAN }),
  draw(ctx, stage, c, plot) {
    fit(stage, plot, X0, SPAN);
    plot.axes({ xLabel: 'x', yLabel: 'y' });
    drawSpinnerWave(ctx, stage, c, plot, X0, now(state), [{ A: 1, B: state.B, C: state.C, k: 0, color: c.a }], { ghost: (x) => Math.sin(state.B * x) });
    const s = shift(state.B, state.C);
    plot.point(s, 0, { fill: c.c, r: 7 });
    plot.text(`starts at ${show(s)}`, Math.max(X0 + 1.2, Math.min(X0 + SPAN - 1.5, s)), 0.5, { size: 11, color: c.c });
  },
  controls: () => [
    { title: 'Give the arrow a head start' },
    { key: 'C', label: 'Head start, C', min: -3.14, max: 3.14, step: 0.01, format: (n) => `${show(n)} rad` },
    { key: 'B', label: 'Speed, B', min: 0.5, max: 4, step: 0.5, format: (n) => fixed(n, 1) },
    { key: 't', label: 'The clock, x', min: 0, max: CYCLE, step: 0.02, format: (n) => fixed(X0 + (n / CYCLE) * SPAN, 2) },
    transport(line.clock),
    { readout: [
      ['Arrow angle at x = 0', (s) => `${fixed((s.C * 180) / Math.PI, 0)}°`],
      ['Shift, −C ÷ B', (s) => `${fixed(shift(s.B, s.C), 3)} (${shift(s.B, s.C) < 0 ? 'left' : shift(s.B, s.C) > 0 ? 'right' : 'none'})`],
      ['Height now', (s) => fixed(Math.sin(s.B * now(s) + s.C), 3)],
    ] },
  ],
  tex: (s) => `y=\\sin(${fixed(s.B, 1)}x+${fixed(s.C, 2)})=\\sin\\left(${fixed(s.B, 1)}\\left(x-(${fixed(shift(s.B, s.C), 2)})\\right)\\right)`,
  onChange: () => line.sync(),
});
line.sync();
tool.update();
