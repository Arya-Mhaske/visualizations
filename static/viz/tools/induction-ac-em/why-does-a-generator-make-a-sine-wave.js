import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { createTimeline } from '../../lib/timeline.js';
import { transport } from '../../lib/sim.js';
import { arrow, dot, label, line } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';

// A coil of N turns, area A, turns at ω in a field B. The angle between B and the coil's normal is θ = ωt.
// Φ = NBA cos ωt and ε = −dΦ/dt = NBAω sin ωt. One turn takes 2 s here (the real 50 Hz machine is 100× faster than we could see).
const CYCLE = 2;
const state = { t: 0.4, N: 100, B: 0.5, A: 0.02, f: 50 };
const th = (s) => (2 * Math.PI * s.t) / CYCLE;
const w = (s) => 2 * Math.PI * s.f;
const phiOf = (s, t) => s.N * s.B * s.A * Math.cos((2 * Math.PI * t) / CYCLE);
const e0 = (s) => s.N * s.B * s.A * w(s);
const line2 = createTimeline(document.querySelector('#stage'), state, { cycle: () => CYCLE, update: () => tool.update() });

const tool = createTool({
  state,
  label: 'Top: an end-on view of a coil turning in a steady field drawn as horizontal arrows. The coil’s flat side is a thick line and its normal is a coral arrow. Middle: flux through the coil against time, a cosine. Bottom: emf, a sine of the same period, running a quarter turn behind the flux.',
  setup: (stage, c) => ({
    flux: createPlot(stage, { x: [0, CYCLE], y: [-1.3, 1.3], c, pad: 22, box: (g) => ({ x: 0, y: g.h * 0.36, w: g.w, h: g.h * 0.32 }) }),
    emf: createPlot(stage, { x: [0, CYCLE], y: [-1.3, 1.3], c, pad: 22, box: (g) => ({ x: 0, y: g.h * 0.68, w: g.w, h: g.h * 0.32 }) }),
  }),
  draw(ctx, stage, c, { flux, emf }) {
    const cx = stage.w / 2;
    const cy = stage.h * 0.17;
    const r = Math.min(stage.h * 0.14, stage.w * 0.2);
    for (let k = -1; k <= 1; k++) arrow(ctx, cx - r * 2.2, cy + k * r * 0.7, cx + r * 2.2, cy + k * r * 0.7, { color: c.grid, width: 2, head: 7 });
    label(ctx, 'B', cx + r * 2.4, cy, c, { size: 11, patch: false });
    const a = th(state);
    line(ctx, cx + r * Math.sin(a), cy - r * Math.cos(a), cx - r * Math.sin(a), cy + r * Math.cos(a), { color: c.ink, width: 6 });
    arrow(ctx, cx, cy, cx + r * 0.9 * Math.cos(a), cy + r * 0.9 * Math.sin(a), { color: c.a, width: 3, head: 8 });
    dot(ctx, cx, cy, 4, c.ink, c.ink, 1);
    label(ctx, `θ = ${fixed(((a * 180) / Math.PI) % 360, 0)}°`, cx, cy - r - 12, c, { size: 11, patch: false });
    flux.axes({ xLabel: 't', yLabel: 'Φ' });
    flux.fn((t) => Math.cos((2 * Math.PI * t) / CYCLE), { color: c.b });
    flux.point(state.t, Math.cos(th(state)), { fill: c.a, r: 6 });
    emf.axes({ xLabel: 't', yLabel: 'ε' });
    emf.fn((t) => Math.sin((2 * Math.PI * t) / CYCLE), { color: c.c });
    emf.point(state.t, Math.sin(th(state)), { fill: c.a, r: 6 });
  },
  controls: () => [
    { title: 'Turn the coil' },
    { key: 't', label: 'Time', min: 0, max: CYCLE, step: 0.01, format: (v) => `${fixed(v, 2)} s` },
    transport(line2.clock),
    { readout: [
      ['Angle θ = ωt', (s) => `${fixed(((th(s) * 180) / Math.PI) % 360, 0)}°`],
      ['Flux ÷ maximum', (s) => fixed(Math.cos(th(s)), 3)],
      ['Emf ÷ maximum', (s) => fixed(Math.sin(th(s)), 3)],
      ['Peak emf (50 Hz, N=100)', (s) => `${fixed(e0(s), 1)} V`],
    ] },
  ],
  onChange: () => line2.sync(),
  tex: (s) => `\\Phi=NBA\\cos\\omega t,\\quad \\varepsilon=-\\dfrac{d\\Phi}{dt}=NBA\\omega\\sin\\omega t\\quad(\\varepsilon_{max}=${fixed(e0(s), 1)}\\ \\text{V})`,
});
line2.sync();
tool.update();
