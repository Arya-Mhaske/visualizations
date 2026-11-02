import { createTool } from '../../lib/tool.js';
import { arc, dot, label, line, poly } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { TAU, deg } from './_inverses-math.js';
import { eqFrame, drawGrid } from './_kit.js';

const state = { x: 0.6 };
const theta = () => Math.acos(state.x);
const root = () => Math.sqrt(1 - state.x * state.x);

createTool({
  state,
  label: 'The upper half of the unit circle. A point P at angle cos inverse of x sits at horizontal distance x from the centre. The right triangle it makes has hypotenuse 1 and base x, so its height, which is sine of the angle, is the square root of one minus x squared. The lower half is dashed because cos inverse never reaches it.',
  draw(ctx, stage, c) {
    const f = eqFrame(stage, [-1.4, 1.4], [-0.5, 1.4]);
    drawGrid(ctx, f, c, stage, { step: 0.5, labels: false });
    const O = f.px([0, 0]);
    arc(ctx, ...O, f.k, -Math.PI, 0, { color: c.ink, width: 3 });
    arc(ctx, ...O, f.k, 0, Math.PI, { color: c.grid, width: 2, dash: [5, 5] });
    const P = f.px([state.x, root()]);
    const F = f.px([state.x, 0]);
    poly(ctx, [O, F, P], { fill: c.fillC, stroke: c.ink, width: 3 });
    line(ctx, ...F, ...P, { color: c.a, width: 6 });
    line(ctx, ...O, ...F, { color: c.b, width: 6 });
    line(ctx, ...O, ...P, { color: c.d, width: 4 });
    arc(ctx, ...O, 26, -theta(), 0, { color: c.ink, width: 3 });
    dot(ctx, ...P, 7, c.a, c.ink);
    label(ctx, '1', (O[0] + P[0]) / 2 - 10, (O[1] + P[1]) / 2 - 10, c, { size: 12, color: c.d, bounds: stage, patch: false });
    label(ctx, `x = ${fixed(state.x, 2)}`, (O[0] + F[0]) / 2, O[1] + 16, c, { size: 11, color: c.b, bounds: stage, patch: false });
    label(ctx, `√(1 − x²) = ${fixed(root(), 3)}`, F[0] + (state.x > 0 ? 8 : -8), (F[1] + P[1]) / 2, c, { size: 11, align: state.x > 0 ? 'left' : 'right', color: c.a, bounds: stage, patch: false });
    label(ctx, 'θ', O[0] + 38 * Math.cos(theta() / 2), O[1] - 38 * Math.sin(theta() / 2), c, { size: 12, bounds: stage, patch: false });
  },
  controls: [
    { title: 'Pick x' },
    { key: 'x', label: 'x', min: -1, max: 1, step: 0.05, format: (n) => fixed(n, 2) },
    { readout: [
      ['θ = cos⁻¹ x', () => `${fixed(theta(), 3)} rad = ${fixed(deg(theta()), 1)}°`],
      ['sin θ', () => fixed(Math.sin(theta()), 4)],
      ['√(1 − x²)', () => fixed(root(), 4)],
    ] },
  ],
  tex: (s) => `\\sin(\\cos^{-1}x)=\\sqrt{1-x^2}=\\sqrt{1-(${fixed(s.x, 2)})^2}=${fixed(root(), 3)}`,
});
void TAU;
