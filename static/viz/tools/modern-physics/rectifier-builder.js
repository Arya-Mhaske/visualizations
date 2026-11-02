import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { run, at, ripple, outFreq, meanIdeal } from './_rect.js';
import { drawCircuit } from './_rect-view.js';

const VM = 10;
const state = { mode: 'full', filter: true, C: 200, R: 500 };
const params = (s) => ({ mode: s.mode, Vm: VM, f: 50, drop: 0.7, C: s.filter ? s.C * 1e-6 : 0, R: s.R });

const tool = createTool({
  state,
  label: 'Top: a circuit diagram that changes with your choices: one diode for half-wave, two diodes and a centre-tapped secondary for full-wave, and a capacitor across the load when the filter is on. Bottom: a graph of the voltage across the load against time, with the source drawn faintly behind it.',
  setup: (stage, c) => createPlot(stage, { x: [0, 100], y: [-0.5, 10.5], c, pad: 26, box: (g) => ({ x: 0, y: g.h * 0.46, w: g.w, h: g.h * 0.54 }) }),
  draw(ctx, stage, c, plot) {
    drawCircuit(ctx, c, { x: 0, y: 0, w: stage.w, h: stage.h * 0.44 }, state);
    const d = run(params(state));
    plot.axes({ xLabel: 't (ms)', yLabel: 'volts' });
    plot.fn((m) => VM * Math.sin(2 * Math.PI * 0.05 * m), { color: c.grid, width: 1 });
    plot.fn((m) => at(d.out, d.dt, m / 1000), { color: c.c });
  },
  controls: () => [
    { title: 'Build it' },
    { key: 'mode', label: 'Rectifier', options: [['half', 'half-wave'], ['full', 'full-wave']] },
    { key: 'filter', label: 'Filter capacitor', toggle: true },
    { key: 'C', label: 'Capacitor C', min: 50, max: 2000, step: 50, format: (v) => `${v} μF` },
    { key: 'R', label: 'Load R_L', min: 100, max: 2000, step: 50, format: (v) => `${v} Ω` },
    { readout: [
      ['Output repeats at', (s) => `${outFreq(50, s.mode)} Hz`],
      ['Mean output', (s) => `${fixed(ripple(run(params(s))).mean, 2)} V`],
      ['Ripple', (s) => `${fixed(ripple(run(params(s))).pp, 2)} V`],
      ['Ideal mean, no filter', (s) => `${fixed(meanIdeal(VM, s.mode), 2)} V`],
    ] },
  ],
  tex: (s) => (s.filter ? `V_{dc}\\approx V_{peak}-\\dfrac{\\Delta V}{2},\\quad \\Delta V=${fixed(ripple(run(params(s))).pp, 2)}\\ \\text{V}` : `V_{dc}=${s.mode === 'half' ? '\\dfrac{V_m}{\\pi}' : '\\dfrac{2V_m}{\\pi}'}`),
});

tool.update();
