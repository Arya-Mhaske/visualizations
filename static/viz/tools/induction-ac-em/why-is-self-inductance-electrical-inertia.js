import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed, sig } from '../../lib/format.js';

// Switch on at t = 0, off at t = t_off. With a coil: L dI/dt + R I = V. I climbs as (V/R)(1 − e^(−t/τ)), τ = L/R,
// and after the switch-off it decays as I₀ e^(−(t − t_off)/τ). A plain resistor (L → 0) would jump at once.
const state = { L: 200, R: 20, V: 10, off: 30 };
const tau = (s) => s.L / 1000 / s.R; // seconds, L in mH
const imax = (s) => s.V / s.R;
const cur = (s, t, L = s.L / 1000) => {
  const ta = L / s.R;
  if (L < 1e-6) return t < 0 ? 0 : t < s.off / 1000 ? imax(s) : 0;
  if (t < 0) return 0;
  if (t < s.off / 1000) return imax(s) * (1 - Math.exp(-t / ta));
  const i0 = imax(s) * (1 - Math.exp(-s.off / 1000 / ta));
  return i0 * Math.exp(-(t - s.off / 1000) / ta);
};

const tool = createTool({
  state,
  label: 'A graph of current in milliamps against time in milliseconds. The solid coral curve is the current in a circuit with a coil: it climbs gradually after switch-on and dies gradually after switch-off. The dashed grey line shows a circuit with the same resistance and no coil, where the current switches instantly.',
  setup: (stage, c) => createPlot(stage, { x: [-5, 100], y: [-100, 1100], c, pad: 30 }),
  draw(ctx, stage, c, plot) {
    const top = imax(state) * 1000 * 1.15;
    plot.setRange([-5, 100], [-top * 0.08, top]);
    plot.axes({ xLabel: 't (ms)', yLabel: 'I (mA)' });
    plot.fn((ms) => cur(state, ms / 1000, 0) * 1000, { color: c.grid, dash: [6, 4], width: 2, domain: [-5, 100] });
    plot.fn((ms) => cur(state, ms / 1000) * 1000, { color: c.a, domain: [-5, 100] });
    plot.segment(state.off, -1000, state.off, 2000, { color: c.ink, width: 2, dash: [4, 4] });
    plot.text('switch off', state.off + 1, top * 0.07, { align: 'left', size: 10 });
    const t1 = tau(state) * 1000;
    plot.point(t1, imax(state) * 1000 * (1 - Math.exp(-1)), { fill: c.b, r: 6 });
  },
  controls: () => [
    { title: 'Switch the coil on and off' },
    { key: 'L', label: 'Inductance L', min: 20, max: 500, step: 10, format: (v) => `${v} mH` },
    { key: 'R', label: 'Resistance R', min: 5, max: 50, step: 5, format: (v) => `${v} Ω` },
    { key: 'V', label: 'Battery V', min: 2, max: 20, step: 1, format: (v) => `${v} V` },
    { key: 'off', label: 'Switch off at', min: 5, max: 80, step: 5, format: (v) => `${v} ms` },
    { readout: [
      ['Final current V/R', (s) => `${sig(imax(s) * 1000, 3)} mA`],
      ['Time constant τ = L/R', (s) => `${sig(tau(s) * 1000, 3)} ms`],
      ['At t = τ the current is', (s) => `${fixed(100 * (1 - Math.exp(-1)), 0)}% of final`],
      ['Without the coil', () => 'jumps at once'],
    ] },
  ],
  tex: (s) => `L\\dfrac{dI}{dt}+RI=V\\ \\Rightarrow\\ I=\\dfrac{V}{R}\\left(1-e^{-t/\\tau}\\right),\\ \\tau=\\dfrac{L}{R}=${sig(tau(s) * 1000, 3)}\\ \\text{ms}`,
});

tool.update();
