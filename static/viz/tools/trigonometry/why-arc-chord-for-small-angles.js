import { createTool } from '../../lib/tool.js';
import { arc as drawArc, dot, label, line } from '../../lib/draw.js';
import { fixed, sig } from '../../lib/format.js';
import { arc, chord, DEG } from './_angles-arcs-math.js';

const state = { degrees: 60 };
const rad = (s) => s.degrees * DEG;
const R = 10;
const gap = (s) => (arc(R, rad(s)) - chord(R, rad(s))) / arc(R, rad(s));

createTool({
  state,
  label: 'An arc with its chord. The view zooms in as the angle shrinks, so the two lines visibly merge.',
  draw(ctx, stage, c) {
    const half = rad(state) / 2;
    // Keep the arc the same size on screen, so shrinking the angle zooms in on the curve.
    const r = (stage.w * 0.42) / Math.sin(Math.min(half, Math.PI / 2));
    const [cx, cy] = [stage.w / 2, stage.h * 0.3 + r];
    const [a0, a1] = [-Math.PI / 2 - half, -Math.PI / 2 + half];
    drawArc(ctx, cx, cy, r, a0, a1, { color: c.a, width: 6 });
    const p0 = [cx + r * Math.cos(a0), cy + r * Math.sin(a0)];
    const p1 = [cx + r * Math.cos(a1), cy + r * Math.sin(a1)];
    line(ctx, ...p0, ...p1, { color: c.b, width: 4 });
    dot(ctx, ...p0, 6, c.paper, c.ink);
    dot(ctx, ...p1, 6, c.paper, c.ink);
    label(ctx, 'arc', stage.w / 2, stage.h * 0.21, c, { color: c.a, size: 13 });
    label(ctx, 'chord', stage.w / 2, Math.min(p0[1] + 18, stage.h - 40), c, { color: c.b, size: 13 });
    const gapShare = gap(state);
    label(ctx, `gap between them: ${fixed(gapShare * 100, 3)}% of the arc`, stage.w / 2, stage.h - 16, c, { size: 11, bounds: stage });
  },
  controls: [
    { title: 'Shrink the angle' },
    { text: 'The picture zooms in as you go, so watch the gap close.' },
    { key: 'degrees', label: 'Angle, θ', min: 0.5, max: 120, step: 0.5, format: (v) => `${fixed(v, 1)}°` },
    { readout: [
      ['Arc, rθ (r = 10)', (s) => sig(arc(R, rad(s)), 6)],
      ['Chord, 2r sin(θ/2)', (s) => sig(chord(R, rad(s)), 6)],
      ['Chord ÷ arc', (s) => fixed(chord(R, rad(s)) / arc(R, rad(s)), 5)],
      ['Gap', (s) => `${fixed(gap(s) * 100, 3)}%`],
    ] },
  ],
  tex: (s) => `\\frac{2r\\sin(\\theta/2)}{r\\theta} = \\frac{\\sin(${fixed(rad(s) / 2, 4)})}{${fixed(rad(s) / 2, 4)}} = ${fixed(chord(1, rad(s)) / rad(s), 5)}`,
});
