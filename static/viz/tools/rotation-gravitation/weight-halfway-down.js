import { barTool } from '../../lib/recipes.js';
import { fixed } from '../../lib/format.js';

const state = { W: 250, f: 0.5 };

barTool({
  state,
  label: 'Two bars: the weight at the surface and the weight at the chosen fraction of the radius, which is the same fraction of the surface weight.',
  rows: (s, c) => [['at the surface', s.W, c.fillB, `${s.W} N`], [`at ${Math.round(s.f * 100)}% of the radius`, s.W * s.f, c.fillA, `${fixed(s.W * s.f, 1)} N`]],
  max: 400,
  left: 0.36,
  controls: [
    { title: 'Go down' },
    { key: 'W', label: 'Weight at the surface (N)', min: 100, max: 400, step: 10 },
    { key: 'f', label: 'Distance from the centre (fraction of R)', min: 0, max: 1, step: 0.05 },
    { readout: [['Weight there', (s) => `${fixed(s.W * s.f, 1)} N`], ['Depth', (s) => `${fixed((1 - s.f) * 6371, 0)} km`]] },
  ],
  tex: (s) => `W'=W\\dfrac{r}{R}=${s.W}\\times${s.f}=${fixed(s.W * s.f, 1)}\\ \\mathrm{N}`,
});
