import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';

// X and Y are independent waiting times with means μ₁, μ₂ and joint density f(x, y) = e^(−x/μ₁ − y/μ₂)/(μ₁μ₂) for x, y ≥ 0.
// P((X, Y) in D) = ∬_D f dA: the volume over D under the density surface.
const state = { m1: 2, m2: 3, region: 'box', a: 2, b: 3 };
const dens = (s, x, y) => Math.exp(-x / s.m1 - y / s.m2) / (s.m1 * s.m2);
const inside = (s, x, y) => (s.region === 'box' ? x <= s.a && y <= s.b : x > y);
export function prob(s, n = 300) {
  const L = 8 * Math.max(s.m1, s.m2);
  const d = L / n;
  let sum = 0;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { const x = (i + 0.5) * d; const y = (j + 0.5) * d; if (inside(s, x, y)) sum += dens(s, x, y) * d * d; }
  return sum;
}
export const exact = (s) => (s.region === 'box' ? (1 - Math.exp(-s.a / s.m1)) * (1 - Math.exp(-s.b / s.m2)) : s.m1 / (s.m1 + s.m2));

createTool({
  state,
  label: 'A map of a joint probability density with darker shading where outcomes are more likely. The region D is outlined and filled in coral. The probability is the volume over D under the density, and the readouts compare a numerical sum with the exact answer.',
  setup: (stage, c) => createPlot(stage, { x: [0, 12], y: [0, 12], c }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'X', yLabel: 'Y' });
    const top = dens(state, 0, 0);
    const step = 0.25;
    for (let x = 0; x < 12; x += step) for (let y = 0; y < 12; y += step) {
      const t = dens(state, x + step / 2, y + step / 2) / top;
      const [px, py] = plot.toPx(x, y + step);
      const [qx, qy] = plot.toPx(x + step, y);
      ctx.globalAlpha = 0.05 + 0.85 * t;
      ctx.fillStyle = inside(state, x + step / 2, y + step / 2) ? c.a : c.b;
      ctx.fillRect(px, py, qx - px + 0.5, qy - py + 0.5);
    }
    ctx.globalAlpha = 1;
  },
  controls: [
    { title: 'Waiting times' },
    { key: 'm1', label: 'Mean of X, μ₁', min: 1, max: 4, step: 0.25 },
    { key: 'm2', label: 'Mean of Y, μ₂', min: 1, max: 4, step: 0.25 },
    { key: 'region', label: 'Event D', options: [['box', 'X ≤ a and Y ≤ b'], ['race', 'X > Y']] },
    { key: 'a', label: 'a', min: 0.5, max: 10, step: 0.5 },
    { key: 'b', label: 'b', min: 0.5, max: 10, step: 0.5 },
    { readout: [
      ['P by summing columns', (s) => prob(s).toFixed(4)],
      ['P exact', (s) => exact(s).toFixed(4)],
    ] },
  ],
  tex: () => 'P((X,Y)\\in D)=\\iint_D f(x,y)\\,dA',
});
