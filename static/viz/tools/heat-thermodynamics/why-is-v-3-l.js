import { createTool } from '../../lib/tool.js';
import { poly, label } from '../../lib/draw.js';
import { sig } from '../../lib/format.js';
import { cubeTerms } from './_expansion-math.js';

const state = { x: 100 }; // x in thousandths
const x = (s) => s.x / 1000;

createTool({
  state,
  label: 'Top: a square grown by a fraction x on each side, split into the original square, two thin strips and one tiny corner square. Bottom: a bar showing the extra volume split into 3x, 3x squared and x cubed.',
  draw(ctx, stage, c) {
    const u = Math.min(stage.w, stage.h * 0.62) * 0.7;
    const [x0, y0] = [stage.w / 2 - u / 2 - 6, 14];
    const s = x(state) * u;
    const rect = (px, py, w, h, fill) => poly(ctx, [[px, py], [px + w, py], [px + w, py + h], [px, py + h]], { fill, stroke: c.ink, width: 2 });
    rect(x0, y0, u, u, c.fillB);
    rect(x0 + u, y0, s, u, c.fillC);
    rect(x0, y0 + u, u, s, c.fillC);
    rect(x0 + u, y0 + u, s, s, c.a);
    label(ctx, '1', x0 + u / 2, y0 + u / 2, c, { size: 16, patch: false });
    label(ctx, '(1+x)² = 1 + 2x + x²', stage.w / 2, y0 + u + s + 18, c, { size: 11, bounds: stage, patch: false });
    const t = cubeTerms(x(state));
    const total = t.first + t.second + t.third;
    const [bx, by, bw] = [14, stage.h - 44, stage.w - 28];
    let cursor = bx;
    [[t.first, c.fillC, '3x'], [t.second, c.fillA, '3x²'], [t.third, c.a, 'x³']].forEach(([v, fill]) => {
      const w = (v / total) * bw;
      rect(cursor, by, Math.max(w, 1), 24, fill);
      cursor += w;
    });
    label(ctx, 'extra volume: 3x  |  3x²  |  x³', stage.w / 2, stage.h - 8, c, { size: 11, bounds: stage, patch: false });
  },
  controls: [
    { title: 'Grow the cube' },
    { key: 'x', label: 'Fractional growth x (thousandths)', min: 1, max: 300, step: 1 },
    { readout: [
      ['3x', (s) => sig(cubeTerms(x(s)).first, 3)],
      ['3x²', (s) => sig(cubeTerms(x(s)).second, 3)],
      ['x³', (s) => sig(cubeTerms(x(s)).third, 3)],
      ['Dropped terms are', (s) => `${sig(((cubeTerms(x(s)).second + cubeTerms(x(s)).third) / cubeTerms(x(s)).first) * 100, 2)}% of 3x`],
    ] },
  ],
  tex: (s) => `\\dfrac{\\Delta V}{V}=3x+3x^2+x^3\\approx 3x\\quad(x=${sig(x(s), 3)})`,
});
