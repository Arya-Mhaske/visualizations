import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { MOTIONS, averageRate } from './_properties-library-math.js';

const state = { motion: 'speedup', t1: 1, t2: 5 };
const M = (s = state) => MOTIONS[s.motion];

createTool({
  state,
  label: 'A graph of distance travelled against time. Two points on it are joined by a straight line, the secant. Its slope is the average speed over that time. A dashed line shows the true speed at the middle of the interval for comparison.',
  setup: (stage, c) => createPlot(stage, { x: [0, 8], y: [-1, 34], c }),
  draw(ctx, stage, c, plot) {
    const { s } = M();
    plot.axes({ grid: true, xLabel: 't (s)', yLabel: 's (m)' });
    plot.fn(s, { color: c.b, width: 4, domain: [0, 8] });
    const [a, b] = [Math.min(state.t1, state.t2), Math.max(state.t1, state.t2)];
    const slope = averageRate(s, a, b);
    plot.fn((t) => s(a) + slope * (t - a), { color: c.a, width: 3, domain: [0, 8] });
    plot.segment(a, s(a), b, s(a), { color: c.ink, width: 2, dash: [4, 4] });
    plot.segment(b, s(a), b, s(b), { color: c.ink, width: 2, dash: [4, 4] });
    plot.point(a, s(a), { fill: c.fillY, r: 8 });
    plot.point(b, s(b), { fill: c.a, r: 8 });
    plot.text('Δt', (a + b) / 2, s(a) - 1.1, { size: 12, patch: false });
    plot.text('Δs', b + 0.25, (s(a) + s(b)) / 2, { size: 12, align: 'left' });
  },
  controls: [
    { title: 'Choose two moments' },
    { key: 'motion', label: 'Journey', options: [['speedup', 'Speeding up'], ['brake', 'Braking'], ['wobble', 'Back and forth']] },
    { key: 't1', label: 'Start time, t₁', min: 0, max: 7, step: 0.5, format: (n) => `${fixed(n, 1)} s` },
    { key: 't2', label: 'End time, t₂', min: 0.5, max: 8, step: 0.5, format: (n) => `${fixed(n, 1)} s` },
    { readout: [
      ['Time taken, Δt', (s) => `${fixed(Math.abs(s.t2 - s.t1), 1)} s`],
      ['Change in s, Δs', (s) => `${fixed(M(s).s(s.t2) - M(s).s(s.t1), 2)} m`],
      ['Average rate', (s) => `${fixed(averageRate(M(s).s, s.t1, s.t2), 2)} m/s`],
      ['Rate at the middle', (s) => `${fixed(M(s).v((s.t1 + s.t2) / 2), 2)} m/s`],
    ] },
  ],
  onChange(s) { if (s.t2 <= s.t1) s.t2 = s.t1 + 0.5; },
  tex: (s) => `\\dfrac{\\Delta s}{\\Delta t}=\\dfrac{${fixed(M(s).s(s.t2), 2)}-${fixed(M(s).s(s.t1), 2)}}{${fixed(s.t2, 1)}-${fixed(s.t1, 1)}}=${fixed(averageRate(M(s).s, s.t1, s.t2), 2)}\\text{ m/s}`,
});
