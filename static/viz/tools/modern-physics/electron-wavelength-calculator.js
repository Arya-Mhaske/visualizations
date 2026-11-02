import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { sig, fixed } from '../../lib/format.js';
import { H, ME, Q, electronNm } from './_mp.js';

// λ = h / sqrt(2 m e V) = 1.227 / sqrt(V) nm. Non-relativistic: fine below about 50 kV, so a note flags more.
const state = { lv: 2 }; // log10 of the accelerating voltage in volts
const volts = (s) => 10 ** s.lv;
const lamPm = (V) => electronNm(V) * 1000;
const SPACING_PM = 215; // Ni crystal planes (Davisson–Germer), 0.215 nm

const tool = createTool({
  state,
  label: 'A graph of the logarithm of the electron wavelength in picometres against the logarithm of the accelerating voltage. A straight line falls with slope minus one half. A coral point marks the chosen voltage, and a dashed line marks the spacing of atoms in a nickel crystal.',
  setup: (stage, c) => createPlot(stage, { x: [0, 5], y: [-0.5, 3.5], c, pad: 30 }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'log₁₀ V', yLabel: 'log₁₀ λ (pm)' });
    plot.fn((x) => Math.log10(lamPm(10 ** x)), { color: c.b });
    plot.segment(0, Math.log10(SPACING_PM), 5, Math.log10(SPACING_PM), { color: c.c, width: 2, dash: [6, 4] });
    plot.text('atom spacing in nickel', 4.9, Math.log10(SPACING_PM) + 0.2, { align: 'right', size: 10 });
    plot.point(state.lv, Math.log10(lamPm(volts(state))), { fill: c.a, r: 7 });
  },
  controls: () => [
    { title: 'Accelerate electrons' },
    { key: 'lv', label: 'Voltage V', min: 0, max: 5, step: 0.05, format: (v) => `${sig(10 ** v, 3)} V` },
    { readout: [
      ['Speed v', (s) => `${sig(Math.sqrt((2 * Q * volts(s)) / ME), 3)} m/s`],
      ['Momentum p', (s) => `${sig(Math.sqrt(2 * ME * Q * volts(s)), 3)} kg m/s`],
      ['Wavelength λ', (s) => `${sig(lamPm(volts(s)), 3)} pm`],
      ['Versus nickel spacing', (s) => `${fixed(lamPm(volts(s)) / SPACING_PM, 2)} ×`],
      ['Check', (s) => (volts(s) > 5e4 ? 'relativity matters' : 'formula valid')],
    ] },
  ],
  tex: (s) => `\\lambda=\\dfrac{h}{\\sqrt{2meV}}=\\dfrac{1.227}{\\sqrt{${sig(volts(s), 3)}}}\\ \\text{nm}=${sig(electronNm(volts(s)), 3)}\\ \\text{nm}`,
});

void H;
tool.update();
