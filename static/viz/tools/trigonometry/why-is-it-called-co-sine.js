import { createTool } from '../../lib/tool.js';
import { arc, label, line, poly } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { complement, fromCorner, sinD } from './_right-triangle-math.js';

const state = { corner: 'A', theta: 30 };

createTool({
  state,
  label: 'A right triangle with two acute corners, A on the left and B at the top. The chosen corner is marked, and the two legs are labelled opposite and adjacent as seen from it. Switching corner swaps the two labels, so the sine of one corner is the cosine of the other.',
  draw(ctx, stage, c) {
    const k = Math.min(stage.w, stage.h) * 0.62;
    const A = [stage.w * 0.15, stage.h * 0.82];
    const C = [A[0] + k * Math.cos((state.theta * Math.PI) / 180), A[1]];
    const B = [C[0], A[1] - k * Math.sin((state.theta * Math.PI) / 180)];
    poly(ctx, [A, C, B], { fill: c.fillC, stroke: c.ink, width: 3 });
    const here = state.corner === 'A' ? A : B;
    const radius = 34;
    if (state.corner === 'A') arc(ctx, ...A, radius, -(state.theta * Math.PI) / 180, 0, { color: c.a, width: 4 });
    else arc(ctx, ...B, radius, Math.PI / 2, Math.PI - (state.theta * Math.PI) / 180, { color: c.a, width: 4 });
    const seen = state.corner === 'A' ? { v: 'opp', h: 'adj' } : { v: 'adj', h: 'opp' };
    const colour = (n) => (n === 'opp' ? c.a : c.b);
    line(ctx, ...C, ...B, { color: colour(seen.v), width: 6 });
    line(ctx, ...A, ...C, { color: colour(seen.h), width: 6 });
    label(ctx, seen.v === 'opp' ? 'opposite' : 'adjacent', C[0] + 6, (C[1] + B[1]) / 2, c, { size: 12, align: 'left', color: colour(seen.v), bounds: stage, patch: false });
    label(ctx, seen.h === 'opp' ? 'opposite' : 'adjacent', (A[0] + C[0]) / 2, A[1] + 18, c, { size: 12, color: colour(seen.h), bounds: stage, patch: false });
    label(ctx, 'A', A[0] - 8, A[1] + 14, c, { size: 13, bounds: stage, patch: false });
    label(ctx, 'B', B[0] + 2, B[1] - 14, c, { size: 13, bounds: stage, patch: false });
    label(ctx, `${fixed(fromCorner(state.theta, state.corner).angle, 0)}° here`, here[0] + (state.corner === 'A' ? 52 : -62), here[1] + (state.corner === 'A' ? -14 : 36), c, { size: 11, color: c.a, bounds: stage, patch: false });
  },
  controls: [
    { title: 'Look from either corner' },
    { key: 'corner', label: 'Standing at corner', options: [['A', 'A'], ['B', 'B']] },
    { key: 'theta', label: 'Angle at A', min: 10, max: 80, step: 1, format: (n) => `${n}°` },
    { readout: [
      ['Angle at A', (s) => `${s.theta}°`],
      ['Angle at B (complement)', (s) => `${complement(s.theta)}°`],
      ['sin A = cos B', (s) => fixed(sinD(s.theta), 4)],
      ['cos A = sin B', (s) => fixed(sinD(complement(s.theta)), 4)],
    ] },
  ],
  tex: (s) => `\\cos ${s.theta}^\\circ=\\sin(90^\\circ-${s.theta}^\\circ)=\\sin ${complement(s.theta)}^\\circ=${fixed(sinD(complement(s.theta)), 4)}`,
});
