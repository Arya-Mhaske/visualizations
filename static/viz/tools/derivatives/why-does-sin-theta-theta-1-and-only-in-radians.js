import { createTool } from '../../lib/tool.js';
import { label, line, poly, wedge } from '../../lib/draw.js';
import { fixed, sig } from '../../lib/format.js';

const state = { theta: 0.8, deg: false };
const ratio = (s) => (s.deg ? Math.sin((s.theta * Math.PI) / 180 * 0 + s.theta) / s.theta : Math.sin(s.theta) / s.theta);

createTool({
  state,
  label: 'A unit circle with a thin sector of angle theta. A small triangle lies inside the sector, with area half sine theta, and a larger triangle lies around it, with area half tangent theta. The sector itself, with area half theta, is squeezed between them. Dividing through by half sine theta shows that theta over sine theta is between 1 and 1 over cosine theta, which goes to 1. This works because the sector\'s area is half theta only when theta is measured in radians.',
  draw(ctx, stage, c) {
    const t = state.deg ? (state.theta * Math.PI) / 180 : state.theta;
    const R = Math.min(stage.w * 0.55, stage.h * 0.62);
    const O = [stage.w * 0.14, stage.h * 0.72];
    const P = [O[0] + R * Math.cos(t), O[1] - R * Math.sin(t)];
    const F = [O[0] + R * Math.cos(t), O[1]];
    const T = [O[0] + R, O[1] - R * Math.tan(t)];
    poly(ctx, [O, [O[0] + R, O[1]], T], { fill: c.fillB, stroke: c.ink, width: 2 });
    wedge(ctx, ...O, R, -t, 0, { fill: c.fillY, stroke: c.ink, width: 2 });
    poly(ctx, [O, F, P], { fill: c.fillA, stroke: c.ink, width: 2 });
    line(ctx, ...O, ...P, { color: c.ink, width: 3 });
    label(ctx, '½ sin θ  <  ½ θ  <  ½ tan θ', stage.w * 0.5, stage.h * 0.08, c, { size: 12, bounds: stage });
    label(ctx, state.deg ? 'angle in degrees: sector area is not ½θ' : 'angle in radians', stage.w * 0.5, stage.h * 0.16, c, { size: 11, color: state.deg ? c.a : c.c, bounds: stage });
  },
  controls: [
    { title: 'Shrink the angle' },
    { key: 'deg', label: 'Measure the angle in degrees', toggle: true },
    { key: 'theta', label: 'θ', min: 0.01, max: 1.4, step: 0.01, format: (v) => (state.deg ? `${fixed(v, 2)}° (${sig((v * Math.PI) / 180, 3)} rad)` : `${fixed(v, 2)} rad`) },
    { readout: [
      ['sin θ ÷ θ, θ in radians', (s) => { const t = s.deg ? (s.theta * Math.PI) / 180 : s.theta; return fixed(Math.sin(t) / t, 5); }],
      ['sin(θ°) ÷ θ with θ in degrees', (s) => ({ text: fixed(Math.sin((s.theta * Math.PI) / 180) / s.theta, 5), good: false })],
      ['π ÷ 180', () => fixed(Math.PI / 180, 5)],
    ] },
  ],
  tex: (s) => `\\sin\\theta<\\theta<\\tan\\theta\\ \\Rightarrow\\ \\cos\\theta<\\dfrac{\\sin\\theta}{\\theta}<1\\ \\Rightarrow\\ \\dfrac{\\sin\\theta}\\theta\\to1`,
});
