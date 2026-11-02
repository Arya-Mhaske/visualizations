import { createTool } from '../../lib/tool.js';
import { label, line, poly, arc, dot } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';

// A right triangle with hypotenuse a, side x opposite θ: the other side is √(a² − x²) = a cos θ. Pythagoras does the work.
const state = { a: 3, th: 40 };
const rad = (d) => (d * Math.PI) / 180;

const tool = createTool({
  state,
  label: 'A quarter circle of radius a with a right triangle inside. The hypotenuse is the radius a, the vertical side is x, the horizontal side is the square root of a squared minus x squared. The angle theta sits at the centre. With x equal to a sine theta the root becomes a cosine theta, with no root sign.',
  draw(ctx, stage, c) {
    const R = Math.min(stage.w, stage.h) * 0.62;
    const ox = stage.w * 0.14;
    const oy = stage.h * 0.82;
    const th = rad(state.th);
    const px = ox + R * Math.cos(th);
    const py = oy - R * Math.sin(th);
    arc(ctx, ox, oy, R, -Math.PI / 2, 0, { color: c.grid, width: 2 });
    poly(ctx, [[ox, oy], [px, oy], [px, py]], { fill: c.fillY, stroke: c.ink, width: 3 });
    line(ctx, px, oy, px, py, { color: c.a, width: 5 });
    line(ctx, ox, oy, px, oy, { color: c.b, width: 5 });
    line(ctx, ox, oy, px, py, { color: c.c, width: 5 });
    arc(ctx, ox, oy, 26, -th, 0, { color: c.ink, width: 2 });
    dot(ctx, px, py, 5, c.ink, c.ink, 1);
    label(ctx, 'θ', ox + 40, oy - 8, c, { size: 13, bounds: stage, patch: false });
    label(ctx, `x = a sin θ = ${fixed(state.a * Math.sin(th), 2)}`, px + 8, (oy + py) / 2, c, { size: 11, align: 'left', bounds: stage });
    label(ctx, `√(a² − x²) = a cos θ = ${fixed(state.a * Math.cos(th), 2)}`, (ox + px) / 2, oy + 20, c, { size: 11, bounds: stage });
    label(ctx, `a = ${fixed(state.a, 1)}`, (ox + px) / 2 - 20, (oy + py) / 2 - 12, c, { size: 11, bounds: stage });
  },
  controls: () => [
    { title: 'Turn the radius' },
    { key: 'a', label: 'Radius a', min: 1, max: 5, step: 0.5, format: (v) => fixed(v, 1) },
    { key: 'th', label: 'Angle θ', min: 5, max: 85, step: 1, format: (v) => `${v}°` },
    { readout: [
      ['x', (s) => fixed(s.a * Math.sin(rad(s.th)), 4)],
      ['√(a² − x²)', (s) => fixed(Math.sqrt(s.a * s.a - (s.a * Math.sin(rad(s.th))) ** 2), 4)],
      ['a cos θ', (s) => fixed(s.a * Math.cos(rad(s.th)), 4)],
      ['dx = a cos θ dθ', (s) => `${fixed(s.a * Math.cos(rad(s.th)), 3)} dθ`],
    ] },
  ],
  tex: (s) => `\\sqrt{a^2-x^2}=\\sqrt{a^2-a^2\\sin^2\\theta}=a\\cos\\theta=${fixed(s.a * Math.cos(rad(s.th)), 3)}`,
});

tool.update();
