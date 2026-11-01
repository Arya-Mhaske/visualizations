import { createTool } from '../../lib/tool.js';
import { arc, dot, label, line } from '../../lib/draw.js';
import { fixed, sig } from '../../lib/format.js';
import { WAKES, rad, wakeHalfAngle } from './_right-triangle-math.js';

const state = { preset: 'boat', ratio: WAKES.boat.ratio };
let last = state.preset;
const half = (s = state) => wakeHalfAngle(s.ratio);

createTool({
  state,
  label: 'A source moving to the right faster than its own waves. Rings are the waves it sent out earlier, each centred where the source was at that moment. The rings all touch two straight lines from the source, which make the V of the wake. The faster the source, the narrower the V.',
  draw(ctx, stage, c) {
    const head = [stage.w * 0.88, stage.h / 2];
    const rings = 8;
    const unit = (head[0] - 8) / (rings * (state.ratio + 1));
    for (let k = 1; k <= rings; k++) {
      const centre = [head[0] - k * unit * state.ratio, head[1]];
      arc(ctx, ...centre, k * unit, 0, Math.PI * 2, { color: c.b, width: 2 });
      dot(ctx, ...centre, 2.5, c.ink, c.ink, 1);
    }
    const phi = rad(half());
    const reach = rings * unit * (state.ratio + 1) * 0.98;
    line(ctx, ...head, head[0] - reach * Math.cos(phi), head[1] - reach * Math.sin(phi), { color: c.a, width: 4 });
    line(ctx, ...head, head[0] - reach * Math.cos(phi), head[1] + reach * Math.sin(phi), { color: c.a, width: 4 });
    line(ctx, ...head, head[0] - reach, head[1], { color: c.grid, width: 1, dash: [5, 4] });
    arc(ctx, ...head, 44, Math.PI, Math.PI + phi, { color: c.ink, width: 3 });
    dot(ctx, ...head, 8, c.a, c.ink);
    label(ctx, `½θ = ${fixed(half(), 1)}°`, head[0] - 96, head[1] - 14, c, { size: 11, bounds: stage, patch: false });
    label(ctx, 'moving →', head[0] - 6, head[1] + 24, c, { size: 11, align: 'right', bounds: stage, patch: false });
  },
  controls: [
    { title: 'What is making the waves?' },
    { key: 'preset', label: 'Example', options: Object.entries(WAKES).map(([k, v]) => [k, v.text]) },
    { key: 'ratio', label: 'Source speed ÷ wave speed', min: 1.1, max: 4, step: 0.05, format: (n) => `× ${fixed(n, 2)}` },
    { readout: [
      ['Slow speed', (s) => `${WAKES[s.preset].c} (${WAKES[s.preset].slow})`],
      ['Fast speed', (s) => `${sig(WAKES[s.preset].speed * s.ratio, 3)} m/s`],
      ['Half-angle ½θ', (s) => `${fixed(half(s), 1)}°`],
      ['Whole V, θ', (s) => `${fixed(2 * half(s), 1)}°`],
    ] },
  ],
  onChange(s) {
    if (s.preset !== last) {
      last = s.preset;
      s.ratio = WAKES[s.preset].ratio;
    }
  },
  tex: (s) => `\\sin\\dfrac{\\theta}{2}=\\dfrac{v_{\\text{slow}}}{v_{\\text{fast}}}=\\dfrac{1}{${fixed(s.ratio, 2)}}=${fixed(1 / s.ratio, 3)}\\ \\Rightarrow\\ \\theta=${fixed(2 * half(s), 1)}^\\circ`,
});
