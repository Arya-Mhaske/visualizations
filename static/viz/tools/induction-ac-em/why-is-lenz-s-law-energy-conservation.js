import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { createTimeline } from '../../lib/timeline.js';
import { transport } from '../../lib/sim.js';
import { label } from '../../lib/draw.js';
import { fixed, sig } from '../../lib/format.js';

// A magnet (m = 0.1 kg) falls through a coil. The induced current pushes on it with force σγ m v:
// σ = −1 (Lenz): opposes the motion. σ = +1 (flipped): helps it. Then v′ = g + σγv.
const G = 9.8;
const M = 0.1;
const CYCLE = 3;
const state = { t: 1.5, flip: false, R: 5 };
const line2 = createTimeline(document.querySelector('#stage'), state, { cycle: () => CYCLE, update: () => tool.update() });
const gam = (s) => 3 / s.R;
const sg = (s) => (s.flip ? 1 : -1);
const vel = (s, t) => { const g = gam(s); return s.flip ? (G / g) * (Math.exp(g * t) - 1) : (G / g) * (1 - Math.exp(-g * t)); };
const fall = (s, t) => { const g = gam(s); return s.flip ? (G / g) * ((Math.exp(g * t) - 1) / g - t) : (G / g) * (t - (1 - Math.exp(-g * t)) / g); };
const ledger = (s, t) => {
  const pe = M * G * fall(s, t);
  const ke = 0.5 * M * vel(s, t) ** 2;
  return { pe, ke, heat: pe - ke };
};

const tool = createTool({
  state,
  label: 'Top: three bars showing the energy ledger at the chosen moment: potential energy the magnet has lost, kinetic energy it has gained, and heat made in the coil. Bottom: a graph of the magnet’s speed against time, against the free-fall speed as a dashed line. With Lenz’s law the bars balance and the speed levels off. With the flipped sign the kinetic energy exceeds what the magnet gave up.',
  setup: (stage, c) => createPlot(stage, { x: [0, CYCLE], y: [0, 40], c, pad: 24, box: (g) => ({ x: 0, y: g.h * 0.45, w: g.w, h: g.h * 0.55 }) }),
  draw(ctx, stage, c, plot) {
    const L = ledger(state, state.t);
    const top = Math.max(0.3, ledger(state, CYCLE).ke * 1.1, ledger(state, CYCLE).pe * 1.1);
    const bw = stage.w * 0.2;
    const base = stage.h * 0.4;
    const hh = stage.h * 0.3;
    [['PE lost', L.pe, c.fillB], ['KE gained', L.ke, c.fillA], [L.heat >= 0 ? 'heat in coil' : 'from nowhere!', Math.abs(L.heat), L.heat >= 0 ? c.fillY : c.a]].forEach(([name, v, fill], i) => {
      const x = stage.w * (0.12 + i * 0.3);
      const h = Math.min(hh, (hh * v) / top);
      ctx.fillStyle = fill;
      ctx.fillRect(x, base - h, bw, h);
      ctx.strokeStyle = c.ink;
      ctx.lineWidth = 3;
      ctx.strokeRect(x, base - h, bw, h);
      label(ctx, `${name} ${sig(v, 2)} J`, x + bw / 2, base + 14, c, { size: 10, bounds: stage, patch: false });
    });
    plot.setRange([0, CYCLE], [0, Math.max(35, Math.min(120, vel(state, CYCLE) * 1.1))]);
    plot.axes({ xLabel: 't (s)', yLabel: 'v (m/s)' });
    plot.fn((t) => G * t, { color: c.grid, dash: [6, 4], width: 2 });
    plot.fn((t) => vel(state, t), { color: state.flip ? c.a : c.c });
    plot.point(state.t, vel(state, state.t), { fill: c.a, r: 6 });
  },
  controls: () => [
    { title: 'Drop the magnet' },
    { key: 'flip', label: 'Flip the induced current’s direction', toggle: true },
    { key: 'R', label: 'Coil resistance R', min: 3, max: 20, step: 1, format: (v) => `${v} Ω` },
    { key: 't', label: 'Time', min: 0, max: CYCLE, step: 0.01, format: (v) => `${fixed(v, 2)} s` },
    transport(line2.clock),
    { readout: [
      ['Speed', (s) => `${fixed(vel(s, s.t), 2)} m/s`],
      ['Energy given up (mgh)', (s) => `${fixed(ledger(s, s.t).pe, 3)} J`],
      ['Kinetic energy', (s) => `${fixed(ledger(s, s.t).ke, 3)} J`],
      ['Ledger', (s) => ({ text: ledger(s, s.t).heat >= -1e-9 ? `balanced: heat ${fixed(ledger(s, s.t).heat, 3)} J` : `broken: ${fixed(-ledger(s, s.t).heat, 3)} J from nowhere`, good: ledger(s, s.t).heat >= -1e-9 })],
    ] },
  ],
  onChange: () => line2.sync(),
  tex: (s) => `mgh=\\tfrac12mv^2+\\text{heat}:\\ ${fixed(ledger(s, s.t).pe, 3)}=${fixed(ledger(s, s.t).ke, 3)}+${fixed(ledger(s, s.t).heat, 3)}`,
});
void sg;
line2.sync();
tool.update();
