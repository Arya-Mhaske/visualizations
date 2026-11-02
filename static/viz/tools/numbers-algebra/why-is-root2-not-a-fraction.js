import { createTool } from '../../lib/tool.js';
import { poly, label } from '../../lib/draw.js';
import { bestP, residual } from './_number-systems-math.js';

const state = { q: 12 };

createTool({
  state,
  label: 'A big square of side p beside two squares of side q. For every q the big square is a little bigger or smaller in area than the two small squares together, never exactly equal.',
  draw(ctx, stage, c) {
    const q = state.q;
    const p = bestP(q);
    const u = (stage.w - 40) / (p + 2 * q + 2);
    const base = stage.h * 0.78;
    const sq = (x, side, fill) => poly(ctx, [[x, base - side * u], [x + side * u, base - side * u], [x + side * u, base], [x, base]], { fill, stroke: c.ink });
    sq(14, p, c.fillA);
    sq(14 + p * u + 6, q, c.fillB);
    sq(14 + (p + q) * u + 6, q, c.fillB);
    label(ctx, `p² = ${p * p}`, 14 + (p * u) / 2, base + 16, c, { size: 12, bounds: stage, patch: false });
    label(ctx, `2q² = ${2 * q * q}`, 14 + (p + q) * u + 6, base + 16, c, { size: 12, bounds: stage, patch: false });
    label(ctx, `${p}/${q} = ${(p / q).toFixed(6)}`, stage.w / 2, 22, c, { size: 13, bounds: stage, patch: false });
    label(ctx, `√2 = ${Math.SQRT2.toFixed(6)}`, stage.w / 2, 44, c, { size: 13, bounds: stage, patch: false });
    label(ctx, `difference = ${residual(q) > 0 ? '+' : ''}${residual(q)} (never 0)`, stage.w / 2, stage.h - 12, c, { size: 12, bounds: stage, patch: false });
  },
  controls: [
    { title: 'Zoom in on √2' },
    { key: 'q', label: 'Denominator q', min: 1, max: 70, step: 1 },
    { readout: [
      ['Nearest p', (s) => String(bestP(s.q))],
      ['p² − 2q²', (s) => String(residual(s.q))],
      ['Gap |p/q − √2|', (s) => Math.abs(bestP(s.q) / s.q - Math.SQRT2).toExponential(2)],
    ] },
  ],
  tex: (s) => `p^2-2q^2=${bestP(s.q)}^2-2\\times ${s.q}^2=${residual(s.q)}\\neq 0`,
});
