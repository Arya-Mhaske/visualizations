import { createTool } from '../../lib/tool.js';
import { vec, box } from '../../lib/quick.js';
import { label } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';

const state = { g: 400, R: 200, mH: 400, mC: 200 };
const a = (s) => (s.g - s.R) / (s.mH + s.mC);
const T = (s) => s.mC * a(s) + s.R;

createTool({
  state,
  label: 'Free-body diagrams of the horse and of the cart. The horse has the ground push forward and the tension backward. The cart has the tension forward and resistance backward.',
  draw(ctx, stage, c) {
    const k = 0.08;
    const y = stage.h * 0.4;
    box(ctx, c, stage.w * 0.1, y - 24, 70, 48, c.fillA, 'horse');
    box(ctx, c, stage.w * 0.55, y - 24, 70, 48, c.fillB, 'cart');
    vec(ctx, c, stage.w * 0.1 + 70, y - 8, -T(state) * k, 0, { color: c.b, text: 'pull by cart' });
    vec(ctx, c, stage.w * 0.1 + 70, y + 8, state.g * k, 0, { color: c.c, text: 'ground push' });
    vec(ctx, c, stage.w * 0.55, y - 8, T(state) * k, 0, { color: c.a, text: 'pull by horse' });
    vec(ctx, c, stage.w * 0.55 + 70, y + 8, -state.R * k, 0, { color: c.d, text: 'resistance' });
    label(ctx, a(state) > 0 ? 'both accelerate forward' : 'no forward acceleration', stage.w / 2, stage.h * 0.82, c, { size: 14, bounds: stage, patch: false });
  },
  controls: [
    { title: 'Horse and cart' },
    { key: 'g', label: 'Ground push on horse (N)', min: 0, max: 800, step: 20 },
    { key: 'R', label: 'Resistance on cart (N)', min: 0, max: 800, step: 20 },
    { key: 'mH', label: 'Horse mass (kg)', min: 200, max: 600, step: 50 },
    { key: 'mC', label: 'Cart mass (kg)', min: 100, max: 600, step: 50 },
    { readout: [
      ['Acceleration', (s) => `${fixed(a(s), 2)} m/s²`],
      ['Tension in the harness', (s) => `${fixed(T(s), 0)} N`],
    ] },
  ],
  tex: (s) => `a=\\dfrac{F_{\\text{ground}}-R}{m_H+m_C}=${fixed(a(s), 2)}\\ \\mathrm{m/s^2}`,
});
