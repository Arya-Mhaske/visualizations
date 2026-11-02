import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { KINDS, NAMES, end, work, curve } from './_proc.js';
import { fixed } from '../../lib/format.js';

// Start (100 kPa, 10 L, 300 K); n = 1000/(8.314·300) mol. dof f gives γ = 1 + 2/f. U = (f/2) P V.
const [P1, V1] = [100, 10];
const state = { kind: 'isobaric', f: 2, dof: 3 };
const gam = (s) => 1 + 2 / s.dof;
const isCycle = (s) => s.kind === 'cycle';
function summary(s) {
  if (isCycle(s)) {
    const w = (P1 / 2) * (V1 * s.f - V1);
    return { P2: P1, V2: V1, W: w, dU: 0 };
  }
  const { P2, V2 } = end(s.kind, P1, V1, s.f, gam(s));
  return { P2, V2, W: work(s.kind, P1, V1, s.f, gam(s)), dU: (s.dof / 2) * (P2 * V2 - P1 * V1) };
}

createTool({
  state,
  label: 'A pressure against volume graph that draws the chosen process from the start point: a horizontal line for isobaric, vertical for isochoric, and curves for isothermal and adiabatic. The area under the path is shaded as the work. The cycle option draws a closed rectangle whose enclosed area is the net work.',
  setup: (stage, c) => createPlot(stage, { c, x: [0, 40], y: [0, 400] }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'V (L)', yLabel: 'P (kPa)' });
    const s = summary(state);
    if (isCycle(state)) {
      const [Va, Vb, Pl] = [V1, V1 * state.f, P1 / 2];
      plot.shade(() => P1, () => Pl, Va, Vb, c.fillB);
      for (const [a, b, p, q] of [[Va, P1, Vb, P1], [Vb, P1, Vb, Pl], [Vb, Pl, Va, Pl], [Va, Pl, Va, P1]]) plot.segment(a, b, p, q, { color: c.a, width: 4 });
    } else {
      const f = curve(state.kind, P1, V1, gam(state));
      if (f) plot.shade(f, null, V1, s.V2, c.fillB);
      if (f) plot.fn(f, { color: c.a, domain: [Math.min(V1, s.V2), Math.max(V1, s.V2)] });
      else plot.segment(V1, P1, V1, s.P2, { color: c.a, width: 4 });
      plot.point(s.V2, s.P2, { fill: c.d });
    }
    plot.point(V1, P1, { fill: c.c });
  },
  controls: [
    { title: 'Build a process' },
    { key: 'kind', label: 'Process', options: [['isobaric', 'P const'], ['isochoric', 'V const'], ['isothermal', 'T const'], ['adiabatic', 'Q = 0'], ['cycle', 'Cycle']] },
    { key: 'f', label: 'Change factor (V or P ×)', min: 0.5, max: 3, step: 0.5, format: (v) => `×${fixed(v, 1)}` },
    { key: 'dof', label: 'Gas', options: [[3, 'Monatomic'], [5, 'Diatomic']] },
    { readout: [
      ['End state', (s) => `${fixed(summary(s).P2, 0)} kPa, ${fixed(summary(s).V2, 1)} L`],
      ['Work W', (s) => `${fixed(summary(s).W, 0)} J`],
      ['ΔU', (s) => `${fixed(summary(s).dU, 0)} J`],
      ['Heat Q = ΔU + W', (s) => `${fixed(summary(s).dU + summary(s).W, 0)} J`],
    ] },
  ],
  tex: (s) => (isCycle(s)
    ? `W_{net}=\\oint P\\,dV=\\tfrac{P_1}{2}(V_2-V_1)=${fixed(summary(s).W, 0)}\\ \\mathrm{J},\\quad \\Delta U=0`
    : `Q=\\Delta U+W=${fixed(summary(s).dU, 0)}+${fixed(summary(s).W, 0)}=${fixed(summary(s).dU + summary(s).W, 0)}\\ \\mathrm{J}`),
});
