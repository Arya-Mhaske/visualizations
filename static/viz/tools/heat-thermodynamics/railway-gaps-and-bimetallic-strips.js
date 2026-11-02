import { createTool } from '../../lib/tool.js';
import { poly, label } from '../../lib/draw.js';
import { sig } from '../../lib/format.js';
import { railGap, bendRadius } from './_expansion-math.js';

const state = { view: 'rail', L: 12, dT: 40, d: 1 };
const [A_STEEL, A_BRASS] = [12e-6, 19e-6];
createTool({
  state,
  label: 'Either two rails with a gap between them that closes up when it is hot, or a two-metal strip that bends into an arc when heated.',
  draw(ctx, stage, c) {
    if (state.view === 'rail') {
      const g = railGap(A_STEEL, state.L, state.dT);
      const gapPx = Math.min(60, 8 + g * 1000 * 1.2);
      const y = stage.h * 0.4;
      const mid = stage.w / 2;
      [[10, mid - gapPx / 2, c.fillB], [mid + gapPx / 2, stage.w - 10, c.fillB]].forEach(([a, b]) => poly(ctx, [[a, y], [b, y], [b, y + 22], [a, y + 22]], { fill: c.fillB, stroke: c.ink }));
      label(ctx, `gap needed ≈ ${sig(g * 1000, 3)} mm`, mid, y + 60, c, { size: 14, bounds: stage, patch: false });
      label(ctx, '(gap drawn larger than life)', mid, y + 80, c, { size: 11, bounds: stage, patch: false });
      return;
    }
    const R = bendRadius(state.d / 1000, A_BRASS, A_STEEL, state.dT);
    const Rpx = Math.max(60, Math.min(260, (R / 0.05) * 60));
    const len = Math.min(stage.w * 0.8, 200);
    const ang = len / Rpx;
    const [cx, cy] = [stage.w / 2, stage.h * 0.5 + Rpx];
    for (const [r, fill] of [[Rpx + 7, c.a], [Rpx - 7, c.b]]) {
      ctx.save();
      ctx.strokeStyle = fill;
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.arc(cx, cy, r, -Math.PI / 2 - ang / 2, -Math.PI / 2 + ang / 2);
      ctx.stroke();
      ctx.restore();
    }
    label(ctx, 'brass (outside)', cx, 20, c, { size: 12, bounds: stage, patch: false });
    label(ctx, `radius ≈ ${sig(R * 100, 3)} cm`, cx, stage.h - 16, c, { size: 14, bounds: stage, patch: false });
  },
  controls: [
    { title: 'Design for heat' },
    { key: 'view', label: 'Design', options: [['rail', 'Railway gap'], ['strip', 'Bimetallic strip']] },
    { key: 'L', label: 'Rail length L (m)', min: 5, max: 50, step: 1 },
    { key: 'dT', label: 'Temperature change ΔT (K)', min: 10, max: 100, step: 5 },
    { key: 'd', label: 'Strip thickness d (mm)', min: 0.5, max: 3, step: 0.5 },
    { readout: [
      ['Rail gap αLΔT', (s) => `${sig(railGap(A_STEEL, s.L, s.dT) * 1000, 3)} mm`],
      ['Strip radius', (s) => `${sig(bendRadius(s.d / 1000, A_BRASS, A_STEEL, s.dT) * 100, 3)} cm`],
    ] },
  ],
  tex: (s) => (s.view === 'rail' ? `\\Delta L=\\alpha L\\Delta T=${sig(railGap(A_STEEL, s.L, s.dT) * 1000, 3)}\\ \\mathrm{mm}` : `R=\\dfrac{d}{(\\alpha_1-\\alpha_2)\\Delta T}=${sig(bendRadius(s.d / 1000, A_BRASS, A_STEEL, s.dT) * 100, 3)}\\ \\mathrm{cm}`),
  onChange: (s) => sync(s),
});
function sync(s) {
  const fields = [...document.querySelectorAll('#panel .nb-field')];
  fields[1].hidden = s.view !== 'rail';
  fields[3].hidden = s.view !== 'strip';
}
sync(state);
