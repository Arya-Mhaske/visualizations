import { createTool } from '../../lib/tool.js';
import { arrow, dot, label, line } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';

// One current I (take I = 1 A, so volts read as ohms) flows through R, L and C in series.
// V_R is in phase with I; V_L leads by 90°; V_C lags by 90°. Add the phasors tip to tail: V² = V_R² + (V_L − V_C)².
const state = { R: 12, XL: 18, XC: 6 };
const Z = (s) => Math.hypot(s.R, s.XL - s.XC);

const tool = createTool({
  state,
  label: 'A phasor diagram. A green arrow for the voltage across the resistor points right. From its tip a blue arrow for the inductor points up and a purple arrow for the capacitor points down. The coral arrow from the start to the final tip is the source voltage, the hypotenuse of a right triangle whose sides are R and X L minus X C.',
  draw(ctx, stage, c) {
    const span = Math.max(state.R, Math.abs(state.XL - state.XC), state.XL, state.XC, 1);
    const k = Math.min((stage.w * 0.7) / Math.max(state.R, 1), (stage.h * 0.7) / (state.XL + state.XC + 1), stage.h / 40);
    const ox = stage.w * 0.14;
    const oy = stage.h * 0.55;
    const p0 = [ox, oy];
    const p1 = [ox + state.R * k, oy];
    const p2 = [p1[0], oy - state.XL * k];
    const p3 = [p1[0], oy - (state.XL - state.XC) * k];
    arrow(ctx, ...p0, ...p1, { color: c.c, width: 4 });
    if (state.XL > 0) arrow(ctx, ...p1, ...p2, { color: c.b, width: 4 });
    if (state.XC > 0) arrow(ctx, ...p2, ...p3, { color: c.d, width: 4 });
    if (Z(state) > 0) arrow(ctx, ...p0, ...p3, { color: c.a, width: 4 });
    line(ctx, p1[0], oy, p3[0], p3[1], { color: c.ink, width: 1, dash: [4, 4] });
    dot(ctx, ...p0, 4, c.ink, c.ink, 1);
    label(ctx, `V_R = IR = ${state.R}`, (p0[0] + p1[0]) / 2, oy + 16, c, { size: 11, bounds: stage, patch: false });
    label(ctx, `V_L = IX_L = ${state.XL}`, p1[0] + 10, (oy + p2[1]) / 2, c, { size: 10, align: 'left', bounds: stage, color: c.b });
    label(ctx, `V_C = IX_C = ${state.XC}`, p1[0] + 10, p2[1] + (state.XC * k) / 2 + 14, c, { size: 10, align: 'left', bounds: stage, color: c.d });
    label(ctx, `V = IZ = ${fixed(Z(state), 1)}`, (p0[0] + p3[0]) / 2 - 20, (oy + p3[1]) / 2 - 12, c, { size: 11, bounds: stage });
    void span;
  },
  controls: () => [
    { title: 'Choose the three opposition values' },
    { key: 'R', label: 'Resistance R', min: 0, max: 20, step: 1, format: (v) => `${v} Ω` },
    { key: 'XL', label: 'Inductive reactance X_L', min: 0, max: 30, step: 1, format: (v) => `${v} Ω` },
    { key: 'XC', label: 'Capacitive reactance X_C', min: 0, max: 30, step: 1, format: (v) => `${v} Ω` },
    { readout: [
      ['Impedance Z', (s) => `${fixed(Z(s), 2)} Ω`],
      ['tan φ = (X_C − X_L)/R', (s) => (s.R ? fixed((s.XC - s.XL) / s.R, 3) : '∞')],
      ['Phase φ', (s) => `${fixed((Math.atan2(s.XC - s.XL, s.R) * 180) / Math.PI, 1)}°`],
      ['Current vs voltage', (s) => (s.XL === s.XC ? 'in phase' : s.XL > s.XC ? 'current lags' : 'current leads')],
    ] },
  ],
  tex: (s) => `Z=\\sqrt{R^2+(X_L-X_C)^2}=\\sqrt{${s.R}^2+(${s.XL}-${s.XC})^2}=${fixed(Z(s), 2)}\\ \\Omega`,
});

tool.update();
