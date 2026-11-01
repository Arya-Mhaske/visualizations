import { createTool } from '../../lib/tool.js';
import { dot, label, line } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { scallop, sources } from './_huygens-wavefronts-math.js';

const L = 10; // wavefront length, in world units
const state = { n: 5, r: 3, forward: true };
const spacing = (s) => L / (s.n - 1);

const tool = createTool({
  state,
  label: 'A straight wavefront along the bottom with evenly spaced coral source points. Each source has a circular wavelet of the same radius. The forward ends of the wavelets nearly touch a blue line one radius ahead, which is the new wavefront. With few sources the envelope is scalloped, and with many it becomes straight.',
  draw(ctx, stage, c) {
    const k = (stage.w - 30) / (L + 2 * 0.0 + 0); // pixels per unit
    const x0 = stage.w / 2;
    const y0 = stage.h - 26;
    line(ctx, x0 - (L / 2) * k, y0, x0 + (L / 2) * k, y0, { color: c.ink, width: 4 });
    label(ctx, 'wavefront now', x0, y0 + 14, c, { size: 10, bounds: stage, patch: false });
    const r = state.r * k;
    for (const x of sources(state.n, L)) {
      ctx.strokeStyle = c.b;
      ctx.lineWidth = 2;
      ctx.beginPath();
      if (state.forward) ctx.arc(x0 + x * k, y0, r, Math.PI, 0);
      else ctx.arc(x0 + x * k, y0, r, 0, Math.PI * 2);
      ctx.stroke();
    }
    for (const x of sources(state.n, L)) dot(ctx, x0 + x * k, y0, 4, c.a, c.ink, 2);
    line(ctx, x0 - (L / 2) * k, y0 - r, x0 + (L / 2) * k, y0 - r, { color: c.c, width: 3, dash: [8, 5] });
    label(ctx, 'new wavefront, r = vt ahead', x0, y0 - r - 12, c, { size: 10, bounds: stage, patch: false });
  },
  controls: () => [
    { title: 'Build the next front' },
    { key: 'n', label: 'Source points', min: 2, max: 30, step: 1 },
    { key: 'r', label: 'Wavelet radius, r = vt', min: 0.5, max: 6, step: 0.25, format: (n) => fixed(n, 2) },
    { key: 'forward', label: 'Forward half only', toggle: true },
    { readout: [
      ['Spacing, s', (s) => fixed(spacing(s), 2)],
      ['Scallop depth', (s) => fixed(scallop(s.n, L, s.r), 3)],
      ['Scallop ÷ r', (s) => `${fixed((scallop(s.n, L, s.r) / s.r) * 100, 1)} %`],
    ] },
  ],
  tex: (s) => `d=r-\sqrt{r^2-(s/2)^2}=${fixed(s.r, 2)}-\sqrt{${fixed(s.r, 2)}^2-${fixed(spacing(s) / 2, 2)}^2}=${fixed(scallop(s.n, L, s.r), 3)}`,
});

tool.update();
