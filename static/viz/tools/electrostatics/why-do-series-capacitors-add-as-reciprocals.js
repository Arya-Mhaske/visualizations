import { createTool } from '../../lib/tool.js';
import { line, label } from '../../lib/draw.js';
import { series, parallel } from './_cap.js';

const state = { mode: 'series', C1: 2, C2: 4, V: 12 };
const eq = (s) => (s.mode === 'series' ? series(s.C1, s.C2) : parallel(s.C1, s.C2));
const Qtot = (s) => eq(s) * s.V;

createTool({
  state,
  label: 'Two capacitors joined to a battery, either one after the other or side by side. Two stacked bars show the voltages and the charges. In series the charge is the same on both and the voltages add up to the battery voltage. In parallel the voltage is the same on both and the charges add.',
  draw(ctx, stage, c) {
    const [W, H] = [stage.w, stage.h];
    const base = H * 0.84;
    const top = H * 0.14;
    const bars = (x, parts, max, name, unit) => {
      let y = base;
      parts.forEach((p, i) => {
        const h = (p / max) * (base - top);
        ctx.fillStyle = i ? c.fillB : c.fillA;
        ctx.fillRect(x, y - h, W * 0.16, h);
        ctx.strokeStyle = c.ink; ctx.lineWidth = 3;
        ctx.strokeRect(x, y - h, W * 0.16, h);
        if (h > 18) label(ctx, `${p.toFixed(1)}`, x + W * 0.08, y - h / 2, c, { size: 11, bounds: stage, patch: false });
        y -= h;
      });
      label(ctx, `${name} (${unit})`, x + W * 0.08, base + 16, c, { size: 11, bounds: stage, patch: false });
    };
    line(ctx, W * 0.08, base, W * 0.92, base, { color: c.ink, width: 3 });
    const [V1, V2] = state.mode === 'series' ? [Qtot(state) / state.C1, Qtot(state) / state.C2] : [state.V, state.V];
    const [Q1, Q2] = state.mode === 'series' ? [Qtot(state), Qtot(state)] : [state.C1 * state.V, state.C2 * state.V];
    if (state.mode === 'series') {
      bars(W * 0.12, [V1, V2], state.V * 1.2, 'voltages', 'V');
      bars(W * 0.42, [Q1], Math.max(Q1 * 1.2, 20), 'charge each', 'µC');
      bars(W * 0.72, [Q2], Math.max(Q1 * 1.2, 20), 'charge each', 'µC');
    } else {
      bars(W * 0.12, [V1], state.V * 1.2, 'voltage each', 'V');
      bars(W * 0.42, [Q1, Q2], Qtot(state) * 1.2, 'charges', 'µC');
    }
    label(ctx, `battery ${state.V} V`, W * 0.5, H * 0.06, c, { size: 12, bounds: stage, patch: false });
  },
  controls: [
    { title: 'Connect two capacitors' },
    { key: 'mode', label: 'Connection', options: [['series', 'Series'], ['parallel', 'Parallel']] },
    { key: 'C1', label: 'C₁ (µF)', min: 1, max: 10, step: 1 },
    { key: 'C2', label: 'C₂ (µF)', min: 1, max: 10, step: 1 },
    { key: 'V', label: 'Battery V (volts)', min: 6, max: 24, step: 6 },
    { readout: [
      ['Equivalent C', (s) => `${eq(s).toFixed(2)} µF`],
      ['Total charge', (s) => `${Qtot(s).toFixed(1)} µC`],
      ['Rule', (s) => (s.mode === 'series' ? 'same Q, V adds' : 'same V, Q adds')],
    ] },
  ],
  tex: (s) => (s.mode === 'series'
    ? `\\dfrac1C=\\dfrac1{C_1}+\\dfrac1{C_2}=\\dfrac1{${s.C1}}+\\dfrac1{${s.C2}}\\ \\Rightarrow\\ C=${eq(s).toFixed(2)}\\ \\mu\\mathrm{F}`
    : `C=C_1+C_2=${s.C1}+${s.C2}=${eq(s).toFixed(2)}\\ \\mu\\mathrm{F}`),
});
