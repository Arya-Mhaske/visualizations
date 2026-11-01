import { createTool } from '../../lib/tool.js';
import { label, line, wedge } from '../../lib/draw.js';
import { fixed, sig } from '../../lib/format.js';
import { NEAR, angleUnaided, angleWith, magnifier, objectFor } from './_instruments-math.js';

const state = { h: 4, f: 5, d: 25 };
const u = (s) => objectFor(s.f, s.d);

const tool = createTool({
  state,
  label: 'Two wedges from the eye. The top wedge is the angle the object makes when held at the near point, 25 centimetres away. The bottom wedge is the larger angle it makes when seen through a magnifier, with the object close to the lens.',
  draw(ctx, stage, c) {
    const a0 = angleUnaided(state.h);
    const a1 = angleWith(state.h, u(state));
    const R = stage.w * 0.78;
    const ex = 24;
    const rows = [[stage.h * 0.28, a0, c.b, `Without: ${fixed(a0 * 57.2958, 1)}° (object at 25 cm)`], [stage.h * 0.72, a1, c.a, `With the magnifier: ${fixed(a1 * 57.2958, 1)}°`]];
    for (const [y, a, color, text] of rows) {
      const half = Math.atan(Math.tan(a) ) ;
      wedge(ctx, ex, y, R, -half, half, { fill: color, stroke: c.ink, width: 3 });
      label(ctx, text, stage.w / 2 + 10, y + R * Math.sin(half) + 18, c, { color: c.ink, size: 11 });
    }
    line(ctx, ex, 10, ex, stage.h - 10, { color: c.ink, width: 2, dash: [4, 5] });
    label(ctx, 'eye', ex + 14, 14, c, { color: c.ink, size: 11 });
  },
  controls: () => [
    { title: 'Look at a small object' },
    { key: 'h', label: 'Object size, h', min: 1, max: 6, step: 0.5, format: (n) => `${fixed(n, 1)} cm` },
    { key: 'f', label: 'Magnifier focal length', min: 2, max: 10, step: 0.5, format: (n) => `${fixed(n, 1)} cm` },
    { key: 'd', label: 'Where the image appears', min: 15, max: 100, step: 5, format: (n) => `${n} cm` },
    { readout: [
      ['Object distance, u', (s) => `${sig(u(s), 3)} cm (less than f)`],
      ['Angle gain, M', (s) => `${sig(angleWith(s.h, u(s)) / angleUnaided(s.h), 3)}`],
      ['Formula 1 + 25/f at 25 cm', (s) => `${sig(magnifier(s.f, true), 3)}`],
    ] },
  ],
  tex: (s) => `M=\\dfrac{\\theta'}{\\theta}=\\dfrac{h/u}{h/${NEAR}}=\\dfrac{${NEAR}}{u}=${sig(NEAR / u(s), 3)}`,
});
tool.update();
