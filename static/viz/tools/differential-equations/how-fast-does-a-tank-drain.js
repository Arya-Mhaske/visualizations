import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { poly } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { drainRate, drainTime, halfTime, level } from './_separable-math.js';

// Torricelli: water leaves a hole at speed √(2gh), so dh/dt = −r√(2gh) with r = hole area ÷ tank area.
// Separating: dh/√h = −r√(2g) dt, so √h falls in a straight line. That is why the level drops fast, then slowly.
const state = { h0: 2, r: 2, t: 10 };
const ratio = (s) => s.r / 100;

createTool({
  state,
  label: 'A tank with a hole at the bottom, drawn beside a graph of the water level against time. The level falls quickly at first and then more and more slowly, curving above the straight dashed line that shows draining at the starting rate. A time slider moves a marker along the graph and changes the water level in the tank.',
  setup: (stage, c) => createPlot(stage, { x: [0, 40], y: [0, 4], c, pad: 22, box: (st) => ({ x: st.w * 0.36, y: 0, w: st.w * 0.64, h: st.h }) }),
  draw(ctx, stage, c, plot) {
    const T = drainTime(state.h0, ratio(state));
    const h = level(state.h0, ratio(state), state.t);
    plot.setRange([0, T * 1.1], [0, state.h0 * 1.1]);
    plot.axes({ xLabel: 't (s)', yLabel: 'h (m)' });
    plot.segment(0, state.h0, T, 0, { color: c.grid, width: 3, dash: [6, 5] });
    plot.fn((t) => level(state.h0, ratio(state), t), { color: c.a, width: 4, domain: [0, T] });
    plot.point(Math.min(state.t, T), h, { fill: c.fillY, r: 8 });
    // the tank, drawn to scale for h0 up to 4 m
    const [x0, x1] = [stage.w * 0.06, stage.w * 0.28];
    const top = stage.h * 0.1;
    const base = stage.h * 0.82;
    const per = (base - top) / (state.h0 * 1.1);
    poly(ctx, [[x0, base - h * per], [x1, base - h * per], [x1, base], [x0, base]], { fill: c.fillB, stroke: c.ink, width: 2 });
    poly(ctx, [[x0, top], [x0, base], [x1, base], [x1, top]], { stroke: c.ink, width: 4, closed: false });
    if (h > 0) {
      ctx.save();
      ctx.strokeStyle = c.b;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo((x0 + x1) / 2, base);
      ctx.lineTo((x0 + x1) / 2, base + (stage.h - base) * 0.8);
      ctx.stroke();
      ctx.restore();
    }
  },
  controls: [
    { title: 'Drain the tank' },
    { key: 't', label: 'Time since the hole opened', min: 0, max: 200, step: 1, format: (n) => `${n} s` },
    { key: 'h0', label: 'Starting depth', min: 1, max: 4, step: 0.5, format: (n) => `${fixed(n, 1)} m` },
    { key: 'r', label: 'Hole area ÷ tank area', min: 0.5, max: 5, step: 0.5, format: (n) => `${fixed(n, 1)}%` },
    { readout: [
      ['Depth now', (s) => `${fixed(level(s.h0, ratio(s), s.t), 3)} m`],
      ['Level falling at', (s) => `${fixed(drainRate(level(s.h0, ratio(s), s.t), ratio(s)) * 100, 2)} cm/s`],
      ['Full to half', (s) => `${fixed(halfTime(s.h0, ratio(s)), 1)} s`],
      ['Half to empty', (s) => `${fixed(drainTime(s.h0, ratio(s)) - halfTime(s.h0, ratio(s)), 1)} s`],
      ['Empty after', (s) => `${fixed(drainTime(s.h0, ratio(s)), 1)} s`],
    ] },
  ],
  tex: (s) => `\\dfrac{dh}{dt}=-r\\sqrt{2gh}\\ \\Rightarrow\\ \\sqrt{h}=\\sqrt{h_0}-\\dfrac{r\\sqrt{2g}}{2}\\,t\\ \\Rightarrow\\ T=\\dfrac{\\sqrt{2h_0/g}}{r}=${fixed(drainTime(s.h0, ratio(s)), 1)}\\ \\text{s}`,
});
