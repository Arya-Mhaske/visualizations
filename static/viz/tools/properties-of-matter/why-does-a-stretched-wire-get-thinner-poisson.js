import { createTool } from '../../lib/tool.js';
import { poly, label } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';

const MAT = { steel: ['Steel', 0.29], copper: ['Copper', 0.34], rubber: ['Rubber', 0.49] };
const state = { m: 'steel', e: 5 };
const nu = (s) => MAT[s.m][1];

createTool({
  state,
  label: 'A wire drawn at its original size in outline and, stretched, longer and thinner. The thinning is a fixed fraction, Poisson\'s ratio, of the stretch.',
  draw(ctx, stage, c) {
    const [cx, cy, L, w] = [stage.w / 2, stage.h * 0.5, stage.w * 0.35, 26];
    const e = state.e / 100;
    poly(ctx, [[cx - L, cy - w], [cx + L, cy - w], [cx + L, cy + w], [cx - L, cy + w]], { stroke: c.ink, dash: [5, 4] });
    poly(ctx, [[cx - L * (1 + e), cy - w * (1 - nu(state) * e * 6)], [cx + L * (1 + e), cy - w * (1 - nu(state) * e * 6)], [cx + L * (1 + e), cy + w * (1 - nu(state) * e * 6)], [cx - L * (1 + e), cy + w * (1 - nu(state) * e * 6)]], { fill: c.fillA, stroke: c.ink });
    label(ctx, `lateral strain = −σ × longitudinal strain`, stage.w / 2, 24, c, { size: 12, bounds: stage, patch: false });
  },
  controls: [
    { title: 'Stretch the wire' },
    { key: 'm', label: 'Material', options: Object.entries(MAT).map(([k, v]) => [k, v[0]]) },
    { key: 'e', label: 'Stretch (drawn, %)', min: 0, max: 8, step: 0.5 },
    { readout: [
      ['Poisson\'s ratio σ', (s) => fixed(nu(s), 2)],
      ['Lateral strain', (s) => `−${fixed(nu(s) * s.e, 2)} (per ${s.e} of stretch)`],
    ] },
  ],
  tex: (s) => `\\sigma=-\\dfrac{\\varepsilon_{\\text{lateral}}}{\\varepsilon_{\\text{long}}}=${fixed(nu(s), 2)}`,
});
