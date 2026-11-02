import { createTool } from '../../lib/tool.js';
import { bars, G } from '../../lib/quick.js';
import { fixed } from '../../lib/format.js';

const state = { v: 18, R: 3, mu: 0.1 };
const ms = (s) => s.v / 3.6;
const need = (s) => ms(s) ** 2 / s.R;
const have = (s) => s.mu * G;

createTool({
  state,
  label: 'Two bars: the acceleration the turn requires and the largest acceleration friction can give. If the first is longer, the cyclist slips.',
  draw(ctx, stage, c) {
    bars(ctx, stage, c, [['turn needs', need(state), c.fillA, `${fixed(need(state), 2)} m/s²`], ['friction gives', have(state), c.fillC, `${fixed(have(state), 2)} m/s²`]], { max: Math.max(need(state), have(state), 1) });
  },
  controls: [
    { title: 'The turn' },
    { key: 'v', label: 'Speed (km/h)', min: 3, max: 40, step: 1 },
    { key: 'R', label: 'Radius (m)', min: 1, max: 20, step: 0.5 },
    { key: 'mu', label: 'Friction μ', min: 0.05, max: 0.8, step: 0.05 },
    { readout: [
      ['Speed', (s) => `${fixed(ms(s), 2)} m/s`],
      ['Verdict', (s) => ({ text: need(s) > have(s) ? 'slips' : 'holds', good: need(s) <= have(s) })],
      ['Safe speed limit', (s) => `${fixed(Math.sqrt(s.mu * s.R * G) * 3.6, 1)} km/h`],
    ] },
  ],
  tex: (s) => `\\dfrac{v^2}{R}=\\dfrac{${fixed(ms(s), 2)}^2}{${s.R}}=${fixed(need(s), 2)}\\ \\text{vs}\\ \\mu g=${fixed(have(s), 2)}`,
});
