import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { createTimeline } from '../../lib/timeline.js';
import { transport } from '../../lib/sim.js';
import { arrow, dot, label, line, poly } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';

// Flux of a bar magnet's field through a loop of radius 1 on its axis, Φ ∝ 1/(1 + z²)^(3/2) (a dipole, far enough away).
// ε = −dΦ/dt. The needle shows ε. Hold still, and ε = 0 however strong the field is.
const CYCLE = 6;
const state = { t: 1, mode: 'magnet' };
const line2 = createTimeline(document.querySelector('#stage'), state, { cycle: () => CYCLE, update: () => tool.update() });
const smooth = (u) => 0.5 * (1 + Math.tanh(u / 0.07));
const z = (t, mode) => (mode === 'still' ? 1.2 : 2.6 - 1.6 * Math.cos((2 * Math.PI * t) / CYCLE));
const flux = (t, mode) => (mode === 'switch' ? smooth(t / CYCLE - 0.25) - smooth(t / CYCLE - 0.75) : (1 / (1 + z(t, mode) ** 2) ** 1.5) * 2.8);
const emf = (t, mode) => -(flux(t + 0.005, mode) - flux(t - 0.005, mode)) / 0.01;
const MAX = 1.6;

const tool = createTool({
  state,
  label: 'Top: a coil on the left with a galvanometer needle, and a magnet or a second coil on the right. Middle: a graph of flux through the coil against time. Bottom: a graph of the induced emf against time. When the flux graph is flat, the emf graph is zero. When it slopes, the emf is not.',
  setup: (stage, c) => ({
    flux: createPlot(stage, { x: [0, CYCLE], y: [-0.2, 3.2], c, pad: 22, box: (g) => ({ x: 0, y: g.h * 0.34, w: g.w, h: g.h * 0.33 }) }),
    emf: createPlot(stage, { x: [0, CYCLE], y: [-MAX, MAX], c, pad: 22, box: (g) => ({ x: 0, y: g.h * 0.67, w: g.w, h: g.h * 0.33 }) }),
  }),
  draw(ctx, stage, c, { flux: pf, emf: pe }) {
    const m = state.mode;
    const cy = stage.h * 0.17;
    const cx = stage.w * 0.22;
    // coil
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 10, 30, 0, 0, Math.PI * 2);
    ctx.stroke();
    // galvanometer
    const gx = stage.w * 0.52;
    ctx.fillStyle = c.paper;
    ctx.fillRect(gx - 30, cy - 18, 60, 36);
    ctx.lineWidth = 3;
    ctx.strokeRect(gx - 30, cy - 18, 60, 36);
    const needle = Math.max(-1, Math.min(1, emf(state.t, m) / MAX));
    line(ctx, gx, cy + 14, gx + needle * 24, cy - 12, { color: c.a, width: 3 });
    label(ctx, 'G', gx, cy - 26, c, { size: 10, patch: false });
    line(ctx, cx + 10, cy - 8, gx - 30, cy - 8, { color: c.ink, width: 2 });
    line(ctx, cx + 10, cy + 8, gx - 30, cy + 8, { color: c.ink, width: 2 });
    // source of field
    if (m === 'switch') {
      const sx = stage.w * 0.78;
      ctx.strokeStyle = c.ink;
      ctx.beginPath();
      ctx.ellipse(sx, cy, 10, 30, 0, 0, Math.PI * 2);
      ctx.stroke();
      const on = flux(state.t, m) > 0.5;
      label(ctx, on ? 'switch ON' : 'switch OFF', sx, cy + 44, c, { size: 10, bounds: stage, patch: false });
      dot(ctx, sx + 24, cy, 6, on ? c.c : c.paper, c.ink);
    } else {
      const mx = cx + 20 + z(state.t, m) * stage.w * 0.13;
      poly(ctx, [[mx, cy - 12], [mx + 28, cy - 12], [mx + 28, cy + 12], [mx, cy + 12]], { fill: c.fillA, stroke: c.ink, width: 3 });
      poly(ctx, [[mx + 28, cy - 12], [mx + 56, cy - 12], [mx + 56, cy + 12], [mx + 28, cy + 12]], { fill: c.fillB, stroke: c.ink, width: 3 });
      label(ctx, 'N', mx + 14, cy, c, { size: 10, patch: false });
      label(ctx, 'S', mx + 42, cy, c, { size: 10, patch: false });
      if (m === 'coil') arrow(ctx, cx, cy + 40, cx + 24, cy + 40, { color: c.a, width: 2, head: 6 });
    }
    pf.axes({ xLabel: 't (s)', yLabel: 'flux Φ' });
    pf.fn((t) => flux(t, m), { color: c.b });
    pf.point(state.t, flux(state.t, m), { fill: c.a, r: 6 });
    pe.axes({ xLabel: 't (s)', yLabel: 'emf ε' });
    pe.fn((t) => emf(t, m), { color: c.c });
    pe.point(state.t, emf(state.t, m), { fill: c.a, r: 6 });
  },
  controls: () => [
    { title: 'Try the experiments' },
    { key: 'mode', label: 'What changes', options: [['magnet', 'move the magnet'], ['coil', 'move the coil'], ['still', 'hold both still'], ['switch', 'switch a nearby circuit']] },
    { key: 't', label: 'Time', min: 0, max: CYCLE, step: 0.01, format: (v) => `${fixed(v, 2)} s` },
    transport(line2.clock),
    { readout: [
      ['Flux Φ now', (s) => fixed(flux(s.t, s.mode), 3)],
      ['Rate of change dΦ/dt', (s) => fixed(-emf(s.t, s.mode), 3)],
      ['Induced emf', (s) => ({ text: Math.abs(emf(s.t, s.mode)) < 0.02 ? 'none' : fixed(emf(s.t, s.mode), 3), good: Math.abs(emf(s.t, s.mode)) > 0.02 })],
    ] },
  ],
  tex: (s) => `\\varepsilon=-\\dfrac{d\\Phi}{dt}=${fixed(emf(s.t, s.mode), 3)}`,
  onChange: () => line2.sync(),
});
line2.sync();
tool.update();
