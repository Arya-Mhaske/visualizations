import { createTool } from '../../lib/tool.js';
import { label, line, dot } from '../../lib/draw.js';
import { fixed, sig } from '../../lib/format.js';
import { COLOURS } from './_prism-math.js';
import { lensColour, blurSize } from './_instruments-math.js';

const state = { D: 1, ratio: 10 };
const lens = (s) => lensColour(s.D, s.ratio);

const tool = createTool({
  state,
  label: 'Two number lines along the axis near the focus, in millimetres. On the top one, the focus of a glass lens, the red focus and the violet focus are spread apart. On the bottom one, the focus of a mirror, all the colours land on the same point.',
  draw(ctx, stage, c) {
    const L = lens(state);
    const mid = L.f;
    const half = Math.max(L.spread * 0.8, 0.002);
    const X = (f) => stage.w / 2 + ((f - mid) / half) * (stage.w * 0.36);
    const rows = [[stage.h * 0.3, 'Lens: each colour focuses at a different place', (nm) => L.at(nm)], [stage.h * 0.72, 'Mirror: all colours focus together', () => mid]];
    rows.forEach(([y, name, at]) => {
      line(ctx, 14, y, stage.w - 14, y, { color: c.ink, width: 2 });
      label(ctx, name, stage.w / 2, y - 44, c, { color: c.ink, size: 12, bounds: stage });
      COLOURS.forEach((col, k) => dot(ctx, X(at(col.nm)), y + (k % 2 ? 14 : -14) * 0 + 0, 8, c.spec[k], c.ink, 2));
    });
    label(ctx, `red and violet are ${sig(L.spread * 1000, 3)} mm apart`, stage.w / 2, stage.h * 0.3 + 34, c, { color: c.ink, size: 11, bounds: stage });
  },
  controls: () => [
    { title: 'A telescope\'s main light-collector' },
    { key: 'D', label: 'Diameter, D', min: 0.1, max: 10, step: 0.1, format: (n) => `${fixed(n, 1)} m` },
    { key: 'ratio', label: 'Focal ratio, f / D', min: 3, max: 20, step: 1, format: (n) => `f/${n}` },
    { readout: [
      ['Focal length, f', (s) => `${sig(lens(s).f, 3)} m`],
      ['Red–violet focus gap (lens)', (s) => `${sig(lens(s).spread * 1000, 3)} mm`],
      ['Colour blur at the image (lens)', (s) => `${sig(blurSize(s.D, lens(s).spread, lens(s).f) * 1000, 3)} mm`],
      ['Colour blur (mirror)', () => '0: no dispersion'],
    ] },
  ],
  tex: (s) => `\\Delta f=f_{red}-f_{violet}=${sig(lens(s).spread * 1000, 3)}\\ \\text{mm}\\qquad f_{mirror}=\\dfrac{R}{2}\\ \\text{for every colour}`,
});
tool.update();
