import { createTool } from '../../lib/tool.js';
import { poly, label } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { DISTS, dist, mean, torque, fr } from './_rv.js';

// Weights p_i hang at x_i on a beam. The pivot balances when the weighted distances on both sides are equal:
// sum p_i (x_i − pivot) = 0, which is the same as pivot = sum x_i p_i.
const state = { d: 'sum2', pivot: 5 };

const tool = createTool({
  state,
  label: 'A horizontal beam marked with the possible values of X. A column stands on each value, as tall as its probability. A triangle pivot sits under the beam where you place it. The beam tilts towards the heavier side and lies flat when the pivot is at the mean.',
  draw(ctx, stage, c) {
    const d = dist(state.d);
    const lo = d.xs[0] - 0.8;
    const hi = d.xs[d.xs.length - 1] + 0.8;
    const X = (v) => 24 + ((v - lo) / (hi - lo)) * (stage.w - 48);
    const by = stage.h * 0.68;
    const pmax = Math.max(...d.ps);
    const tq = torque(d, state.pivot);
    const angle = Math.max(-0.3, Math.min(0.3, tq * 0.12));
    const px = X(state.pivot);
    ctx.save();
    ctx.translate(px, by);
    ctx.rotate(angle);
    ctx.translate(-px, -by);
    d.xs.forEach((x, i) => {
      const h = (stage.h * 0.4 * d.ps[i]) / pmax;
      ctx.fillStyle = c.fillA;
      ctx.fillRect(X(x) - 9, by - h, 18, h);
      ctx.strokeStyle = c.ink;
      ctx.lineWidth = 3;
      ctx.strokeRect(X(x) - 9, by - h, 18, h);
    });
    ctx.fillStyle = c.fillY;
    ctx.fillRect(X(lo + 0.3) - 6, by, X(hi - 0.3) - X(lo + 0.3) + 12, 10);
    ctx.strokeRect(X(lo + 0.3) - 6, by, X(hi - 0.3) - X(lo + 0.3) + 12, 10);
    ctx.restore();
    poly(ctx, [[px, by + 10], [px - 14, by + 40], [px + 14, by + 40]], { fill: c.a, stroke: c.ink, width: 3 });
    d.xs.forEach((x) => label(ctx, String(x), X(x), by + 56, c, { size: 10, patch: false }));
    label(ctx, 'value of X', stage.w / 2, by + 74, c, { size: 9, patch: false });
    label(ctx, `E(X) = ${fr(mean(d))}`, stage.w / 2, 16, c, { size: 11, patch: false });
  },
  controls: () => [
    { title: 'Find the balance point' },
    { key: 'd', label: 'Distribution', options: Object.entries(DISTS).map(([k, v]) => [k, v.name]) },
    { key: 'pivot', label: 'Pivot position', min: 1, max: 12, step: 0.05, format: (v) => fixed(v, 2) },
    { row: [{ button: 'Set the pivot at the mean', onClick: () => { state.pivot = Math.round(mean(dist(state.d)) * 20) / 20; tool.update(); } }] },
    { readout: [
      ['Mean E(X) = Σ xᵢpᵢ', (s) => fixed(mean(dist(s.d)), 3)],
      ['Pull: right minus left', (s) => fixed(torque(dist(s.d), s.pivot), 3)],
      ['Beam', (s) => { const t = torque(dist(s.d), s.pivot); return { text: Math.abs(t) < 0.03 ? 'balanced' : t > 0 ? 'tips right' : 'tips left', good: Math.abs(t) < 0.03 }; }],
    ] },
  ],
  tex: (s) => `\\sum p_i(x_i-${fixed(s.pivot, 2)})=${fixed(torque(dist(s.d), s.pivot), 3)}\\ \\Rightarrow\\ E(X)=\\sum x_ip_i=${fixed(mean(dist(s.d)), 3)}`,
});

tool.update();
