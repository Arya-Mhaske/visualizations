import { createTool } from '../../lib/tool.js';
import { poly, label } from '../../lib/draw.js';
import { sig } from '../../lib/format.js';

const MAT = { steel: ['Steel', 200e9, 84e9, 160e9], alum: ['Aluminium', 70e9, 25e9, 70e9], rubber: ['Rubber', 0.05e9, 0.017e9, 2e9] };
const state = { mat: 'steel', kind: 'Y', p: 10 };
const mod = (s) => MAT[s.mat][{ Y: 1, G: 2, B: 3 }[s.kind]];
const strain = (s) => (s.p * 1e6) / mod(s);

createTool({
  state,
  label: 'A cube drawn before and after the chosen stress: stretched, sheared or squeezed. The deformation is exaggerated.',
  draw(ctx, stage, c) {
    const [cx, cy, a] = [stage.w / 2, stage.h * 0.5, Math.min(stage.w, stage.h) * 0.22];
    const d = Math.min(0.4, strain(state) * 12);
    const sq = (pts, fill, dash) => poly(ctx, pts, { fill, stroke: c.ink, dash });
    sq([[cx - a, cy - a], [cx + a, cy - a], [cx + a, cy + a], [cx - a, cy + a]], null, [5, 4]);
    if (state.kind === 'Y') sq([[cx - a * (1 - d / 3), cy - a * (1 + d)], [cx + a * (1 - d / 3), cy - a * (1 + d)], [cx + a * (1 - d / 3), cy + a], [cx - a * (1 - d / 3), cy + a]], c.fillA);
    else if (state.kind === 'G') sq([[cx - a + a * d, cy - a], [cx + a + a * d, cy - a], [cx + a, cy + a], [cx - a, cy + a]], c.fillA);
    else sq([[cx - a * (1 - d / 2), cy - a * (1 - d / 2)], [cx + a * (1 - d / 2), cy - a * (1 - d / 2)], [cx + a * (1 - d / 2), cy + a * (1 - d / 2)], [cx - a * (1 - d / 2), cy + a * (1 - d / 2)]], c.fillA);
    label(ctx, { Y: 'stretch: length changes', G: 'shear: shape changes', B: 'squeeze: volume changes' }[state.kind], stage.w / 2, 20, c, { size: 13, bounds: stage, patch: false });
  },
  controls: [
    { title: 'Stress a cube' },
    { key: 'mat', label: 'Material', options: Object.entries(MAT).map(([k, v]) => [k, v[0]]) },
    { key: 'kind', label: 'Kind of stress', options: [['Y', 'Stretch'], ['G', 'Shear'], ['B', 'Squeeze']] },
    { key: 'p', label: 'Stress (MPa)', min: 1, max: 100, step: 1 },
    { readout: [['Modulus', (s) => `${sig(mod(s) / 1e9, 3)} GPa`], ['Strain', (s) => sig(strain(s), 3)]] },
  ],
  tex: (s) => `\\text{strain}=\\dfrac{\\text{stress}}{\\text{modulus}}=${sig(strain(s), 3)}`,
});
