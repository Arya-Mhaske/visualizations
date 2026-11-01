import { createTool } from '../../lib/tool.js';
import { dot, label, line, poly } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { cosD, scaled, sinD } from './_identities-math.js';
import { drawFrame, frame } from './_unit-circle-view.js';

const state = { kind: 'tan', theta: 40 };
const NAMES = {
  one: { adj: 'cos θ', opp: 'sin θ', hyp: '1', tex: (t) => `\\cos^2\\theta+\\sin^2\\theta=${fixed(t.adj ** 2, 3)}+${fixed(t.opp ** 2, 3)}=1` },
  tan: { adj: '1', opp: 'tan θ', hyp: 'sec θ', tex: (t) => `1+\\tan^2\\theta=1+${fixed(t.opp ** 2, 3)}=${fixed(t.hyp ** 2, 3)}=\\sec^2\\theta` },
  cot: { adj: 'cot θ', opp: '1', hyp: 'csc θ', tex: (t) => `\\cot^2\\theta+1=${fixed(t.adj ** 2, 3)}+1=${fixed(t.hyp ** 2, 3)}=\\csc^2\\theta` },
};

createTool({
  state,
  label: 'The unit circle with its small right triangle (legs cosine and sine, hypotenuse 1). The same triangle is blown up by one over cosine, or one over sine, so that one leg becomes exactly 1. Pythagoras on the big triangle gives the second and third identities.',
  draw(ctx, stage, c) {
    const t = scaled(state.kind, state.theta);
    const far = Math.max(1.5, t.adj * 1.12, t.opp * 1.12);
    const f = frame(stage, Math.min(far, 4.5));
    drawFrame(ctx, f, c, { ticks: false });
    const O = f.px([0, 0]);
    const small = [cosD(state.theta), sinD(state.theta)];
    const P = f.px(small);
    poly(ctx, [O, f.px([small[0], 0]), P], { fill: c.fillC, stroke: c.ink, width: 2 });
    if (state.kind !== 'one') {
      const corner = f.px([t.adj, t.opp]);
      const foot = f.px([t.adj, 0]);
      const top = f.px([0, t.opp]);
      const tri = state.kind === 'tan' ? [O, foot, corner] : [O, top, corner];
      poly(ctx, tri, { fill: c.fillA, stroke: c.ink, width: 3 });
      line(ctx, ...tri[1], ...tri[2], { color: c.b, width: 5 });
      line(ctx, ...O, ...tri[1], { color: c.c, width: 5 });
      line(ctx, ...O, ...tri[2], { color: c.d, width: 4 });
      const n = NAMES[state.kind];
      const A = state.kind === 'tan' ? n.adj : n.opp;
      const B = state.kind === 'tan' ? n.opp : n.adj;
      label(ctx, A, (O[0] + tri[1][0]) / 2, (O[1] + tri[1][1]) / 2 + (state.kind === 'tan' ? 14 : -14), c, { size: 11, color: c.c, bounds: stage, patch: false });
      label(ctx, B, (tri[1][0] + tri[2][0]) / 2 + (state.kind === 'tan' ? 24 : 0), (tri[1][1] + tri[2][1]) / 2 + (state.kind === 'tan' ? 0 : -12), c, { size: 11, color: c.b, bounds: stage, patch: false });
      label(ctx, n.hyp, (O[0] + tri[2][0]) / 2 - 22, (O[1] + tri[2][1]) / 2 - 12, c, { size: 11, color: c.d, bounds: stage, patch: false });
      dot(ctx, ...corner, 6, c.a, c.ink);
    } else {
      line(ctx, ...O, ...P, { color: c.d, width: 4 });
      line(ctx, ...O, ...f.px([small[0], 0]), { color: c.c, width: 5 });
      line(ctx, ...f.px([small[0], 0]), ...P, { color: c.b, width: 5 });
    }
    dot(ctx, ...P, 7, c.a, c.ink);
    label(ctx, state.kind === 'one' ? 'the triangle as it is' : `blown up ×${fixed(t.k, 2)}, so one side is 1`, stage.w / 2, 14, c, { size: 11, bounds: stage });
  },
  controls: [
    { title: 'Resize the triangle' },
    { key: 'kind', label: 'Scale it by', options: [['one', '1 (no change)'], ['tan', '1 ÷ cos θ'], ['cot', '1 ÷ sin θ']] },
    { key: 'theta', label: 'Angle, θ', min: 15, max: 75, step: 1, format: (n) => `${n}°` },
    { readout: [
      ['Scale factor', (s) => fixed(scaled(s.kind, s.theta).k, 3)],
      ['Legs', (s) => `${fixed(scaled(s.kind, s.theta).adj, 3)}, ${fixed(scaled(s.kind, s.theta).opp, 3)}`],
      ['Hypotenuse', (s) => fixed(scaled(s.kind, s.theta).hyp, 3)],
    ] },
  ],
  tex: (s) => NAMES[s.kind].tex(scaled(s.kind, s.theta)),
});
