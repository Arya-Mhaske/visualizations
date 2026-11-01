import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';

// A car wheel modelled as m x'' + c x' + k x = 0 with m = 1 and k = 4, released from x(0) = 1 at rest.
const state = { c: 1 };
const W0 = 2;
const zeta = (s) => s.c / (2 * W0);
function x(s, t) {
  const z = zeta(s);
  if (Math.abs(z - 1) < 0.01) return (1 + W0 * t) * Math.exp(-W0 * t);
  if (z < 1) {
    const wd = W0 * Math.sqrt(1 - z * z);
    return Math.exp(-z * W0 * t) * (Math.cos(wd * t) + ((z * W0) / wd) * Math.sin(wd * t));
  }
  const root = W0 * Math.sqrt(z * z - 1);
  const s1 = -z * W0 + root;
  const s2 = -z * W0 - root;
  return (s2 * Math.exp(s1 * t) - s1 * Math.exp(s2 * t)) / (s2 - s1);
}
const kind = (s) => (Math.abs(zeta(s) - 1) < 0.01 ? 'critically damped' : zeta(s) < 1 ? 'underdamped' : 'overdamped');
const crossings = (s) => { let n = 0; for (let t = 0.02; t < 10; t += 0.02) if (x(s, t) * x(s, t - 0.02) < 0) n++; return n; };

createTool({
  state,
  label: 'How a car wheel on a spring and shock absorber settles after a bump, as the damping is turned up. With little damping it bounces many times, at critical damping it returns to rest fastest without crossing zero, and with heavy damping it creeps back slowly.',
  setup: (stage, c) => createPlot(stage, { x: [0, 8], y: [-1, 1.2], c }),
  draw(ctx, stage, c, plot) {
    plot.setRange([0, 8], [-1, 1.2]);
    plot.axes({ xLabel: 't (s)', yLabel: 'displacement' });
    plot.fn((t) => x({ c: 4 }, t), { color: c.grid, width: 3, dash: [6, 5] });
    plot.fn((t) => x(state, t), { color: c.a, width: 4 });
  },
  controls: (tool) => [
    { title: 'Tune the absorber' },
    { key: 'c', label: 'Damping c', min: 0, max: 10, step: 0.1, format: (v) => fixed(v, 1) },
    { button: 'Set critical damping', onClick: () => { state.c = 4; tool.update(); } },
    { readout: [
      ['Damping ratio ζ', (s) => fixed(zeta(s), 2)],
      ['Type', (s) => ({ text: kind(s), good: kind(s) === 'critically damped' })],
      ['Times it crosses zero', (s) => `${crossings(s)}`],
    ] },
  ],
  tex: (s) => String.raw`x''+${fixed(s.c, 1)}x'+4x=0,\quad c_{\text{crit}}=2\sqrt{mk}=4`,
});
