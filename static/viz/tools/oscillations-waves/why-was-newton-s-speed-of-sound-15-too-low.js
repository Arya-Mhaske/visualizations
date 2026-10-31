import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { AIR, isoP, adiaP, newtonSpeed, laplaceSpeed, percentLow } from './_travelling-waves-math.js';

const state = { s: 8, gamma: 1.4 }; // s: squeeze as a percentage of the volume
const frac = (st) => st.s / 100;

createTool({
  state,
  label: 'A pressure–volume graph for a pocket of air. Two curves start at the same point: a blue isotherm (Newton’s assumption, temperature constant) and a coral adiabat (heat has no time to flow). For the same squeeze the coral curve climbs higher, so air pushes back harder.',
  setup: (stage, c) => createPlot(stage, { x: [0.86, 1.02], y: [0.95, 1.3], c }),
  draw(ctx, stage, c, plot) {
    const s = frac(state);
    plot.axes({ xLabel: 'V / V₀', yLabel: 'P / P₀' });
    plot.fn((v) => isoP(1 - v), { color: c.b, domain: [0.86, 1.02] });
    plot.fn((v) => adiaP(1 - v, state.gamma), { color: c.a, domain: [0.86, 1.02] });
    // the slopes at the start are the stiffnesses: P for Newton, γP for Laplace
    plot.segment(0.9, 1 + 0.1, 1.02, 1 - 0.02, { color: c.b, width: 2, dash: [5, 5] });
    plot.segment(0.94, 1 + 0.06 * state.gamma, 1.02, 1 - 0.02 * state.gamma, { color: c.a, width: 2, dash: [5, 5] });
    plot.segment(1 - s, 0.95, 1 - s, 1.3, { color: c.ink, width: 1, dash: [3, 3] });
    plot.point(1 - s, isoP(s), { fill: c.fillB });
    plot.point(1 - s, adiaP(s, state.gamma), { fill: c.a });
    plot.text('isothermal (Newton)', 0.925, isoP(0.075) - 0.045, { size: 10 });
    plot.text('adiabatic (Laplace)', 0.895, adiaP(0.105, state.gamma) + 0.04, { size: 10 });
  },
  controls: [
    { title: 'Squeeze the air' },
    { key: 's', label: 'Squeeze, ΔV / V', min: 0, max: 14, step: 1, format: (n) => `${n} %` },
    { key: 'gamma', label: 'γ = Cp / Cv', min: 1, max: 1.7, step: 0.05, format: (n) => fixed(n, 2) },
    { readout: [
      ['Pressure if heat leaks out', (s) => `${fixed(isoP(frac(s)), 3)} P₀`],
      ['Pressure if it cannot', (s) => `${fixed(adiaP(frac(s), s.gamma), 3)} P₀`],
      ['Stiffness, Newton (B = P)', () => `${fixed(AIR.P / 1000, 1)} kPa`],
      ['Stiffness, Laplace (B = γP)', (s) => `${fixed((s.gamma * AIR.P) / 1000, 1)} kPa`],
      ['v, Newton', () => `${fixed(newtonSpeed(AIR.P, AIR.rho), 1)} m/s`],
      ['v, Laplace', (s) => `${fixed(laplaceSpeed(s.gamma, AIR.P, AIR.rho), 1)} m/s`],
      ['Newton is low by', (s) => `${fixed(percentLow(s.gamma), 1)} %`],
    ] },
  ],
  tex: (s) => `v_N = \\sqrt{\\dfrac{P}{\\rho}} = ${fixed(newtonSpeed(AIR.P, AIR.rho), 1)} \\qquad v_L = \\sqrt{\\dfrac{\\gamma P}{\\rho}} = \\sqrt{\\dfrac{${fixed(s.gamma, 2)} \\times 1.013\\times 10^{5}}{1.29}} = ${fixed(laplaceSpeed(s.gamma, AIR.P, AIR.rho), 1)}\\ \\text{m/s}`,
});
