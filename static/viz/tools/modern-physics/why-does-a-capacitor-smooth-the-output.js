import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed, sig } from '../../lib/format.js';
import { run, at, ripple, ripplePredict, outFreq } from './_rect.js';

// Vm = 10 V, 50 Hz, silicon diode(s). The capacitor charges while the rectified source is above it, and otherwise
// leaks through R_L with time constant RC.
const state = { mode: 'full', C: 200, R: 500 };
const VM = 10;
const params = (s) => ({ mode: s.mode, Vm: VM, f: 50, drop: 0.7, C: s.C * 1e-6, R: s.R });
const peak = VM - 0.7;

const tool = createTool({
  state,
  label: 'A graph of voltage against time over 100 milliseconds. A dashed line shows the rectified humps with no capacitor. A solid green line is the output with the capacitor: it climbs with each hump, then slides slowly down in between. The bigger the capacitor, the smaller the wiggle, and the output stays near the peak.',
  setup: (stage, c) => createPlot(stage, { x: [0, 100], y: [0, 10.5], c, pad: 28 }),
  draw(ctx, stage, c, plot) {
    const d = run(params(state));
    plot.axes({ xLabel: 't (ms)', yLabel: 'volts' });
    plot.fn((m) => at(d.src, d.dt, m / 1000), { color: c.grid, width: 2, dash: [5, 4] });
    plot.fn((m) => at(d.out, d.dt, m / 1000), { color: c.c });
    const r = ripple(d);
    plot.segment(0, r.max, 100, r.max, { color: c.ink, width: 1, dash: [3, 4] });
    plot.segment(0, r.min, 100, r.min, { color: c.ink, width: 1, dash: [3, 4] });
  },
  controls: () => [
    { title: 'Add a filter capacitor' },
    { key: 'mode', label: 'Rectifier', options: [['half', 'half-wave'], ['full', 'full-wave']] },
    { key: 'C', label: 'Capacitor C', min: 0, max: 2000, step: 50, format: (v) => (v ? `${v} μF` : 'none') },
    { key: 'R', label: 'Load R_L', min: 100, max: 2000, step: 50, format: (v) => `${v} Ω` },
    { readout: [
      ['Ripple (measured)', (s) => `${fixed(ripple(run(params(s))).pp, 2)} V`],
      ['Ripple ≈ V/(f R C)', (s) => `${fixed(Math.min(peak, ripplePredict(peak, outFreq(50, s.mode), s.R, s.C * 1e-6)), 2)} V`],
      ['Mean output', (s) => `${fixed(ripple(run(params(s))).mean, 2)} V`],
      ['RC ÷ gap between humps', (s) => (s.C ? sig((s.R * s.C * 1e-6) / (1 / outFreq(50, s.mode)), 2) : '—')],
    ] },
  ],
  tex: (s) => (!s.C
    ? '\\Delta V=V_{peak}\\ \\text{(no capacitor: the output falls to zero)}'
    : `\\Delta V\\approx\\dfrac{V_{peak}}{f_{out}RC}=\\dfrac{${fixed(peak, 1)}}{${outFreq(50, s.mode)}\\times${s.R}\\times${fixed(s.C * 1e-6, 6)}}`),
});

tool.update();
