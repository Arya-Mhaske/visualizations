import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed, sig } from '../../lib/format.js';

// Coil 1 carries a triangle-wave current I₁ of peak I_p and frequency f. Its flux through coil 2 is M I₁, so
// ε₂ = −M dI₁/dt: a square wave of height M × (4 I_p f). M = k √(L₁L₂), k ≤ 1.
const state = { k: 0.8, L1: 4, L2: 9, Ip: 2, f: 5 };
const M = (s) => s.k * Math.sqrt(s.L1 * s.L2) / 1000; // henry, L in mH
const tri = (s, t) => { const u = ((t * s.f) % 1 + 1) % 1; return s.Ip * (u < 0.25 ? 4 * u : u < 0.75 ? 2 - 4 * u : 4 * u - 4); };
const slope = (s, t) => { const u = ((t * s.f) % 1 + 1) % 1; return s.Ip * 4 * s.f * (u < 0.25 || u >= 0.75 ? 1 : -1); };

const tool = createTool({
  state,
  label: 'Two stacked graphs over 0.4 seconds. The top is the current in coil 1, a triangular wave rising and falling at a steady rate. The bottom is the emf induced in coil 2, a square wave: positive while the current falls, negative while it rises, because the emf follows the slope.',
  setup: (stage, c) => ({
    top: createPlot(stage, { x: [0, 0.4], y: [-3, 3], c, pad: 24, box: (g) => ({ x: 0, y: 0, w: g.w, h: g.h * 0.5 }) }),
    bottom: createPlot(stage, { x: [0, 0.4], y: [-1, 1], c, pad: 24, box: (g) => ({ x: 0, y: g.h * 0.5, w: g.w, h: g.h * 0.5 }) }),
  }),
  draw(ctx, stage, c, { top, bottom }) {
    top.setRange([0, 0.4], [-state.Ip * 1.3, state.Ip * 1.3]);
    const e = M(state) * 4 * state.Ip * state.f;
    bottom.setRange([0, 0.4], [-e * 1.4 - 0.001, e * 1.4 + 0.001]);
    top.axes({ xLabel: 't (s)', yLabel: 'I₁ (A)' });
    top.fn((t) => tri(state, t), { color: c.b });
    bottom.axes({ xLabel: 't (s)', yLabel: 'ε₂ (V)' });
    bottom.fn((t) => -M(state) * slope(state, t), { color: c.c, width: 3 });
  },
  controls: () => [
    { title: 'Two coils side by side' },
    { key: 'k', label: 'Coupling k', min: 0.1, max: 1, step: 0.05, format: (v) => fixed(v, 2) },
    { key: 'L1', label: 'L₁', min: 1, max: 10, step: 1, format: (v) => `${v} mH` },
    { key: 'L2', label: 'L₂', min: 1, max: 10, step: 1, format: (v) => `${v} mH` },
    { key: 'Ip', label: 'Peak current', min: 0.5, max: 5, step: 0.5, format: (v) => `${fixed(v, 1)} A` },
    { key: 'f', label: 'Frequency', min: 1, max: 10, step: 1, format: (v) => `${v} Hz` },
    { readout: [
      ['Mutual inductance M', (s) => `${sig(M(s) * 1000, 3)} mH`],
      ['Rate of change dI₁/dt', (s) => `±${fixed(4 * s.Ip * s.f, 1)} A/s`],
      ['Emf in coil 2', (s) => `±${sig(M(s) * 4 * s.Ip * s.f, 3)} V`],
    ] },
  ],
  tex: (s) => `\\varepsilon_2=-M\\dfrac{dI_1}{dt},\\quad M=k\\sqrt{L_1L_2}=${sig(M(s) * 1000, 3)}\\ \\text{mH}`,
});

tool.update();
