import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { createTimeline } from '../../lib/timeline.js';
import { transport } from '../../lib/sim.js';
import { line, label, poly } from '../../lib/draw.js';
import { fixed, sig } from '../../lib/format.js';
import { TAU, bobPeriod, massFromPeriod } from './_waves-math.js';

const SPAN = 4;
const state = { m: 2, area: 0.02, t: 0.5 };
const timeline = createTimeline(document.querySelector('#stage'), state, { cycle: () => SPAN, update: () => tool.update() });
const T = () => bobPeriod(state.m, state.area);
const y = (t) => Math.cos((TAU * t) / T());

const tool = createTool({
  state,
  label: 'Left: a block floating in water, bobbing up and down. Right: its height against time. The distance between two peaks is the period, and the mass can be worked back from that period.',
  setup: (stage, c) => createPlot(stage, { x: [0, SPAN], y: [-1.4, 1.4], c, pad: 24, box: (g) => ({ x: g.w * 0.34, y: 0, w: g.w * 0.66, h: g.h }) }),
  draw(ctx, stage, c, plot) {
    const cx = stage.w * 0.17;
    const mid = stage.h / 2;
    const rise = y(state.t) * stage.h * 0.18;
    const wDeck = stage.w * 0.2;
    poly(ctx, [[2, mid], [stage.w * 0.34 - 4, mid], [stage.w * 0.34 - 4, stage.h - 4], [2, stage.h - 4]], { fill: c.fillB, stroke: c.ink, width: 2 });
    const block = [[cx - wDeck / 2, mid - rise - 52], [cx + wDeck / 2, mid - rise - 52], [cx + wDeck / 2, mid - rise + 24], [cx - wDeck / 2, mid - rise + 24]];
    poly(ctx, block, { fill: c.fillY, stroke: c.ink, width: 3 });
    line(ctx, 2, mid, stage.w * 0.34 - 4, mid, { color: c.ink, width: 3, dash: [6, 4] });
    label(ctx, `${fixed(state.m, 1)} kg`, cx, mid - rise - 14, c, { size: 11, bounds: stage, patch: false });
    plot.axes({ xLabel: 't (s)', yLabel: 'height' });
    plot.fn(y, { color: c.a, width: 4 });
    plot.segment(0, 1.2, T(), 1.2, { color: c.b, width: 5 });
    plot.text(`T = ${sig(T(), 3)} s`, Math.min(T() / 2, SPAN - 0.9), 1.3, { size: 11, color: c.b, patch: false });
    plot.point(state.t, y(state.t), { fill: c.a });
  },
  controls: () => [
    { title: 'The floating block' },
    { key: 'm', label: 'Mass, m', min: 0.5, max: 8, step: 0.5, format: (n) => `${fixed(n, 1)} kg` },
    { key: 'area', label: 'Area in the water, A', min: 0.01, max: 0.06, step: 0.005, format: (n) => `${fixed(n, 3)} m²` },
    { key: 't', label: 'Time, t', min: 0, max: SPAN, step: 0.05, format: (n) => `${fixed(n, 2)} s` },
    transport(timeline.clock),
    { readout: [
      ['Period, T', (s) => `${sig(bobPeriod(s.m, s.area), 3)} s`],
      ['Mass worked back from T', (s) => `${sig(massFromPeriod(bobPeriod(s.m, s.area), s.area), 3)} kg`],
    ] },
  ],
  tex: (s) => `T=2\\pi\\sqrt{\\dfrac{m}{\\rho gA}}\\ \\Rightarrow\\ m=\\dfrac{\\rho gAT^2}{4\\pi^2}=${sig(massFromPeriod(bobPeriod(s.m, s.area), s.area), 3)}\\ \\text{kg}`,
  onChange: () => timeline.sync(),
});
