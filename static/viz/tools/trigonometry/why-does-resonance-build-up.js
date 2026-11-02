import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { drivenRun, driveGain } from './_waves-math.js';

const W0 = 2; // natural angular frequency, rad/s
const T_END = 30;
const state = { r: 0.5, zeta: 0.1 };
let run = [];
let key = '';
const refresh = () => {
  const k = `${state.r}|${state.zeta}`;
  if (k !== key) { key = k; run = drivenRun(state.r * W0, W0, state.zeta, T_END); }
};
const gain = (r) => driveGain(r * W0, W0, state.zeta);

createTool({
  state,
  label: 'Top: the size of the response against the ratio of drive frequency to natural frequency, with a coral point at the chosen ratio. Bottom: the motion of the oscillator started from rest and pushed at that frequency over 30 seconds.',
  setup: (stage, c) => ({
    top: createPlot(stage, { x: [0, 2], y: [0, 6], c, pad: 24, box: (g) => ({ x: 0, y: 0, w: g.w, h: g.h * 0.46 }) }),
    low: createPlot(stage, { x: [0, T_END], y: [-6, 6], c, pad: 24, box: (g) => ({ x: 0, y: g.h * 0.46, w: g.w, h: g.h * 0.54 }) }),
  }),
  draw(ctx, stage, c, p) {
    refresh();
    p.top.axes({ xLabel: 'drive ÷ natural', yLabel: 'size' });
    p.top.fn((r) => Math.min(6, gain(r)), { color: c.b, width: 4 });
    p.top.segment(1, 0, 1, 6, { color: c.grid, width: 1, dash: [4, 4] });
    p.top.point(state.r, Math.min(6, gain(state.r)), { fill: c.a });
    p.low.axes({ xLabel: 't (s)', yLabel: 'x' });
    const pts = run.map(([t, x]) => p.low.toPx(t, Math.max(-6, Math.min(6, x))));
    ctx.save();
    ctx.strokeStyle = c.a;
    ctx.lineWidth = 3;
    ctx.beginPath();
    pts.forEach((pt, i) => (i ? ctx.lineTo(...pt) : ctx.moveTo(...pt)));
    ctx.stroke();
    ctx.restore();
  },
  controls: [
    { title: 'Push the swing' },
    { key: 'r', label: 'Drive ÷ natural frequency', min: 0.2, max: 2, step: 0.05, format: (n) => fixed(n, 2) },
    { key: 'zeta', label: 'Damping, ζ', min: 0.02, max: 0.5, step: 0.02, format: (n) => fixed(n, 2) },
    { readout: [
      ['Steady size', (s) => fixed(gain(s.r), 2)],
      ['Size at ratio 1', (s) => fixed(gain(1), 2)],
      ['Biggest swing seen', (s) => { refresh(); return fixed(Math.max(...run.map(([, x]) => Math.abs(x))), 2); }],
    ] },
  ],
  tex: (s) => `\\text{size}=\\dfrac{\\omega_0^2}{\\sqrt{(\\omega_0^2-\\omega^2)^2+(2\\zeta\\omega_0\\omega)^2}}=${fixed(gain(s.r), 2)}`,
});
