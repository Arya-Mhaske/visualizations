import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { label } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';

// A stone dropped from rest: s = 4.9 t², so the speed at time t is 9.8 t. Average speed over [t0, t0 + Δt].
const state = { t0: 2, k: 0 };
const dt = (k) => 1 / 10 ** k;
const s = (t) => 4.9 * t * t;
const avg = (t0, k) => (s(t0 + dt(k)) - s(t0)) / dt(k);

createTool({
  state,
  label: 'A graph of distance fallen against time for a stone dropped from rest. A short stretch of time starting at the chosen moment is highlighted. The average speed over that stretch is the slope of the chord across it. Shrinking the stretch from 1 second to 0.1, 0.01 and smaller makes the average speed settle on one number, the speed at that exact moment. A table lists the values.',
  setup: (stage, c) => createPlot(stage, { x: [-0.2, 4.5], y: [-5, 100], c, pad: 18 }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 't (s)', yLabel: 's (m)' });
    plot.fn(s, { color: c.ink, width: 3 });
    const [a, b] = [state.t0, state.t0 + dt(state.k)];
    plot.segment(a, s(a), b, s(b), { color: c.a, width: 5 });
    const m = avg(state.t0, state.k);
    plot.segment(a - 1, s(a) - m, a + 1.5, s(a) + 1.5 * m, { color: c.a, width: 2, dash: [5, 4] });
    plot.point(a, s(a), { fill: c.fillY, r: 8 });
    plot.point(b, s(b), { fill: c.a, r: 6 });
    // the table
    for (let i = 0; i <= state.k; i++) {
      label(ctx, `Δt = ${fixed(dt(i), i)} s → ${fixed(avg(state.t0, i), 4)} m/s`, 10, stage.h * 0.1 + i * 15, c, { size: 10, align: 'left', color: i === state.k ? c.a : c.ink, bounds: stage, patch: false });
    }
  },
  controls: [
    { title: 'Shrink the time interval' },
    { key: 'k', label: 'Interval Δt', min: 0, max: 5, step: 1, format: (v) => `${fixed(dt(v), v)} s` },
    { key: 't0', label: 'Moment, t', min: 0.5, max: 4, step: 0.5, format: (v) => `${v} s` },
    { readout: [
      ['Average speed', (st) => `${fixed(avg(st.t0, st.k), 5)} m/s`],
      ['Speed at that moment, 9.8t', (st) => `${fixed(9.8 * st.t0, 3)} m/s`],
      ['Difference', (st) => ({ text: fixed(avg(st.t0, st.k) - 9.8 * st.t0, 5), good: Math.abs(avg(st.t0, st.k) - 9.8 * st.t0) < 0.01 })],
    ] },
  ],
  tex: (st) => `\\dfrac{s(${st.t0}+${fixed(dt(st.k), st.k)})-s(${st.t0})}{${fixed(dt(st.k), st.k)}}=${fixed(avg(st.t0, st.k), 4)}\\ \\text{m/s}`,
});
