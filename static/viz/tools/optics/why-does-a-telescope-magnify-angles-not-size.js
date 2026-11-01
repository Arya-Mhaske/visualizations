import { createTool } from '../../lib/tool.js';
import { createBench } from '../../lib/rays.js';
import { line, label } from '../../lib/draw.js';
import { fixed, sig } from '../../lib/format.js';
import { telescopeAngle } from './_instruments-math.js';

const FO = 10;
const state = { fe: 2.5, alpha: 4 };
const tanA = (s) => Math.tan((s.alpha * Math.PI) / 180);
const beta = (s) => telescopeAngle(FO, s.fe, s.alpha);

const tool = createTool({
  state,
  label: 'Parallel rays from a distant object, tilted by a small angle, enter a long-focus objective on the left. They meet at a small image in the middle. The short-focus eyepiece on the right turns them into parallel rays again, tilted at a much bigger angle.',
  setup: (stage, c) => createBench(stage, { x: [-2, 18], cy: 0.5, c }),
  draw(ctx, stage, c, bench) {
    bench.axis();
    const eyeX = FO + state.fe;
    for (const [x, color] of [[0, c.ink], [eyeX, c.ink]]) {
      line(ctx, ...bench.toPx(x, 2.2), ...bench.toPx(x, -2.2), { color, width: 5 });
    }
    label(ctx, 'objective', ...bench.toPx(0, 2.9), c, { color: c.ink, size: 11 });
    label(ctx, 'eyepiece', ...bench.toPx(eyeX, 2.9), c, { color: c.ink, size: 11, bounds: stage });
    const hi = -FO * tanA(state); // the image at the focus: upside down
    // three parallel beams' central rays, entering tilted by alpha (going down to the right)
    const s2 = -hi / state.fe; // every ray leaves the eyepiece with the slope of the ray from the image through its centre
    for (const y of [-1.6, 0, 1.6]) {
      const y0 = y + 2 * tanA(state); // started further back along the slope
      const s1 = (hi - y) / FO;
      const yE = hi + s1 * state.fe;
      bench.ray([-2, y0], [0, y], { color: c.b, width: 2, arrow: false });
      bench.ray([0, y], [FO, hi], { color: c.b, width: 2, arrow: false });
      bench.ray([FO, hi], [eyeX, yE], { color: c.b, width: 2, arrow: false });
      bench.rayTo([eyeX, yE], [1, s2], { color: c.a, width: 2, arrow: false });
    }
    // the small image
    line(ctx, ...bench.toPx(FO, 0), ...bench.toPx(FO, hi), { color: c.d, width: 5 });
    label(ctx, 'image', ...bench.toPx(FO + 0.2, hi - 0.8), c, { color: c.d, size: 11, bounds: stage });
  },
  controls: () => [
    { title: 'A distant object' },
    { key: 'fe', label: 'Eyepiece focal length', min: 1, max: 5, step: 0.5, format: (n) => `${fixed(n, 1)} (objective = 10)` },
    { key: 'alpha', label: 'Angle of the object, α', min: 1, max: 8, step: 0.5, format: (n) => `${fixed(n, 1)}°` },
    { readout: [
      ['Angle of the image, β', (s) => `${fixed(beta(s), 2)}°`],
      ['β ÷ α', (s) => sig(Math.tan((beta(s) * Math.PI) / 180) / tanA(s), 3)],
      ['m = f₀ / fₑ', (s) => sig(FO / s.fe, 3)],
    ] },
  ],
  tex: (s) => `m=\\dfrac{\\beta}{\\alpha}=\\dfrac{f_o}{f_e}=\\dfrac{${FO}}{${fixed(s.fe, 1)}}=${sig(FO / s.fe, 3)}`,
});
tool.update();
