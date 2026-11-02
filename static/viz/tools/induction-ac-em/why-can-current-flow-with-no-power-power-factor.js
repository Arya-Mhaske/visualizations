import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { shadeSigned } from '../integrals/_ig.js';

// v = V_m sin ωt, i = I_m sin(ωt − φ). Power p = v i. Average over a cycle = ½ V_m I_m cos φ.
const state = { phi: 60, Vm: 325, Im: 10 };
const rad = (d) => (d * Math.PI) / 180;
const v = (s, x) => s.Vm * Math.sin(x);
const i = (s, x) => s.Im * Math.sin(x - rad(s.phi));
const p = (s, x) => v(s, x) * i(s, x);
const mean = (s) => { let t = 0; const N = 3600; for (let k = 0; k < N; k++) t += p(s, (2 * Math.PI * (k + 0.5)) / N); return t / N; };

const tool = createTool({
  state,
  label: 'Top: voltage and current against angle over two cycles, with the current shifted by the phase you choose. Bottom: their product, the power, shaded green where it is positive and coral where it is negative. At zero phase the green wins. At 90 degrees the green and coral are equal and the average power is zero.',
  setup: (stage, c) => ({
    top: createPlot(stage, { x: [0, 4 * Math.PI], y: [-1.2, 1.2], c, pad: 24, box: (g) => ({ x: 0, y: 0, w: g.w, h: g.h * 0.5 }) }),
    bottom: createPlot(stage, { x: [0, 4 * Math.PI], y: [-1.2, 1.2], c, pad: 24, box: (g) => ({ x: 0, y: g.h * 0.5, w: g.w, h: g.h * 0.5 }) }),
  }),
  draw(ctx, stage, c, { top, bottom }) {
    const pm = state.Vm * state.Im;
    top.axes({ xLabel: 'ωt', yLabel: 'v, i (scaled)' });
    top.fn((x) => v(state, x) / state.Vm, { color: c.b });
    top.fn((x) => i(state, x) / state.Im, { color: c.a });
    bottom.axes({ xLabel: 'ωt', yLabel: 'p = v i' });
    shadeSigned(bottom, c, (x) => p(state, x) / pm, 0, 4 * Math.PI);
    bottom.fn((x) => p(state, x) / pm, { color: c.ink, width: 2 });
    bottom.segment(0, mean(state) / pm, 4 * Math.PI, mean(state) / pm, { color: c.a, width: 3, dash: [6, 4] });
  },
  controls: () => [
    { title: 'Shift the current' },
    { key: 'phi', label: 'Phase φ', min: 0, max: 90, step: 5, format: (v2) => `${v2}°` },
    { readout: [
      ['Average power ½VmIm cos φ', (s) => `${fixed(mean(s), 1)} W`],
      ['Formula', (s) => `${fixed(0.5 * s.Vm * s.Im * Math.cos(rad(s.phi)), 1)} W`],
      ['Power factor cos φ', (s) => fixed(Math.cos(rad(s.phi)), 3)],
      ['Current', (s) => `${fixed(s.Im / Math.SQRT2, 2)} A rms flows regardless`],
    ] },
  ],
  tex: (s) => `\\bar P=V_{rms}I_{rms}\\cos\\varphi=${fixed(s.Vm / Math.SQRT2, 1)}\\times${fixed(s.Im / Math.SQRT2, 2)}\\times${fixed(Math.cos(rad(s.phi)), 3)}=${fixed(mean(s), 1)}\\ \\text{W}`,
});

tool.update();
