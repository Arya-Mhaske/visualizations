import { createTool } from '../../lib/tool.js';
import { line, dot, label } from '../../lib/draw.js';
import { dof, cvOf, cpOf, gammaOf, R } from './_equipartition.js';
import { fixed } from '../../lib/format.js';

// Presets set rotation and vibration; the sliders can then be changed.
const MOLS = { he: [0, 0], n2: [2, 0], co2: [2, 0], h2o: [3, 0], hot: [2, 1] };
const NAMES = { he: 'He', n2: 'N₂', co2: 'CO₂', h2o: 'H₂O', hot: 'N₂ + vib' };
const state = { mol: 'n2', rot: 2, vib: 0 };
let lastMol = state.mol;
const f = (s) => dof(s.rot, s.vib);

createTool({
  state,
  label: 'A row of dots, one for each degree of freedom: translation, rotation and vibration. Bars below show Cv and Cp in units of R, with Cp always one R above Cv. The ratio gamma depends only on the number of degrees of freedom.',
  draw(ctx, stage, c) {
    const [W, H] = [stage.w, stage.h];
    const n = f(state);
    const kinds = [...Array(3).fill(0), ...Array(state.rot).fill(1), ...Array(2 * state.vib).fill(2)];
    const fills = [c.a, c.b, c.c];
    kinds.forEach((k, i) => dot(ctx, W * 0.1 + i * Math.min(34, (W * 0.8) / Math.max(n, 1)), H * 0.12, 11, fills[k], c.ink));
    const base = H * 0.88;
    const unit = (H * 0.58) / 5.5;
    line(ctx, W * 0.1, base, W * 0.9, base, { color: c.ink, width: 3 });
    const cv = n / 2;
    ctx.fillStyle = c.fillB;
    ctx.fillRect(W * 0.2, base - cv * unit, W * 0.2, cv * unit);
    ctx.fillStyle = c.fillC;
    ctx.fillRect(W * 0.55, base - (cv + 1) * unit, W * 0.2, (cv + 1) * unit);
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 3;
    ctx.strokeRect(W * 0.2, base - cv * unit, W * 0.2, cv * unit);
    ctx.strokeRect(W * 0.55, base - (cv + 1) * unit, W * 0.2, (cv + 1) * unit);
    line(ctx, W * 0.55, base - cv * unit, W * 0.75, base - cv * unit, { color: c.ink, width: 3, dash: [5, 4] });
    label(ctx, `Cv = ${fixed(cv, 1)} R`, W * 0.3, base - cv * unit - 10, c, { size: 12, bounds: stage, patch: false });
    label(ctx, `Cp = ${fixed(cv + 1, 1)} R`, W * 0.65, base - (cv + 1) * unit - 10, c, { size: 12, bounds: stage, patch: false });
    label(ctx, 'translation, rotation, vibration', W * 0.5, H * 0.04, c, { size: 10, bounds: stage, patch: false });
  },
  controls: [
    { title: 'Count the degrees of freedom' },
    { key: 'mol', label: 'Molecule', options: Object.keys(MOLS).map((k) => [k, NAMES[k]]) },
    { key: 'rot', label: 'Rotational degrees', min: 0, max: 3, step: 1 },
    { key: 'vib', label: 'Vibrational modes (2 each)', min: 0, max: 3, step: 1 },
    { readout: [
      ['f', (s) => f(s)],
      ['Cv, Cp (J/mol·K)', (s) => `${fixed(cvOf(f(s)), 1)}, ${fixed(cpOf(f(s)), 1)}`],
      ['γ = Cp/Cv', (s) => fixed(gammaOf(f(s)), 3)],
    ] },
  ],
  onChange(s) {
    if (s.mol !== lastMol) { [s.rot, s.vib] = MOLS[s.mol]; lastMol = s.mol; }
  },
  tex: (s) => `\\gamma=\\dfrac{C_p}{C_v}=\\dfrac{(f/2+1)R}{(f/2)R}=1+\\dfrac{2}{f}=1+\\dfrac{2}{${f(s)}}=${fixed(gammaOf(f(s)), 3)}`,
});
void R;
