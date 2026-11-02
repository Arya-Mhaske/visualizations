import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';

// Each slide off the seat leaves 0.2 µC on a body of capacitance 100 pF, so V = Q/C. Charge leaks away with time constant τ that falls fast with humidity.
const C_BODY = 100e-12;
const state = { slides: 3, rh: 30, wait: 5 };
const tau = (s) => 200 * Math.exp(-s.rh / 15);
const volts = (s, t = s.wait) => ((s.slides * 0.2e-6) / C_BODY) * Math.exp(-t / tau(s));
const kv = (v) => (v / 1000).toFixed(1);
const gapMm = (v) => v / 3000; // air breaks down near 3 × 10⁶ V/m = 3 kV per mm

createTool({
  state,
  label: 'The voltage on your body against the time since you slid off the seat. It starts high and decays. A dashed line marks about 2 kilovolts, the voltage at which you can feel a spark. In dry air it decays slowly, so you are still above the line when you touch the door. In humid air it decays in a second or two.',
  setup: (stage, c) => createPlot(stage, { c, x: [0, 60], y: [0, 30000] }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 't (s)', yLabel: 'V' });
    plot.fn(() => 2000, { color: c.grid, dash: [6, 5], width: 2 });
    plot.text('shock felt', 48, 2900, { size: 11, patch: false });
    plot.fn((t) => volts(state, t), { color: c.a });
    plot.segment(state.wait, 0, state.wait, volts(state), { width: 2, dash: [4, 4] });
    plot.point(state.wait, volts(state), { fill: c.a });
  },
  controls: [
    { title: 'Slide off the seat' },
    { key: 'slides', label: 'Slides across the seat', min: 1, max: 6, step: 1 },
    { key: 'rh', label: 'Humidity (%)', min: 20, max: 80, step: 5 },
    { key: 'wait', label: 'Seconds before touching the door', min: 0, max: 60, step: 1 },
    { readout: [
      ['Charge', (s) => `${(s.slides * 0.2 * Math.exp(-s.wait / tau(s))).toFixed(2)} µC`],
      ['Voltage', (s) => `${kv(volts(s))} kV`],
      ['Spark can jump', (s) => `${gapMm(volts(s)).toFixed(1)} mm`],
      ['Feel a shock?', (s) => ({ text: volts(s) > 2000 ? 'yes' : 'no', good: volts(s) <= 2000 })],
    ] },
  ],
  tex: (s) => `V=\\dfrac{Q}{C}=\\dfrac{${(s.slides * 0.2).toFixed(1)}\\ \\mu\\mathrm{C}\\,e^{-t/\\tau}}{100\\ \\mathrm{pF}}=${kv(volts(s))}\\ \\mathrm{kV}`,
});
