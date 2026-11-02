import { createTool } from '../../lib/tool.js';
import { poly, arrow, label } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { LAND, SEA, layerRise } from './_heat-capacity-math.js';

const state = { night: false, h: 6, dl: 0.3, ds: 3 };
const Q = (s) => (s.night ? -100 : 400) * s.h * 3600;
const dTl = (s) => layerRise(Q(s), s.dl, LAND);
const dTs = (s) => layerRise(Q(s), s.ds, SEA);

createTool({
  state,
  label: 'Land on the left and sea on the right, each with a bar for its temperature change. Arrows above show the air rising over the warmer side and the breeze blowing along the ground towards it.',
  draw(ctx, stage, c) {
    const [w, h] = [stage.w, stage.h];
    const base = h * 0.78;
    const bar = (x0, x1, d, fill) => {
      const k = Math.max(-20, Math.min(20, d));
      const y = base - (k > 0 ? (k / 20) * h * 0.35 : (k / 20) * h * 0.1);
      poly(ctx, [[x0, base], [x1, base], [x1, base + h * 0.12], [x0, base + h * 0.12]], { fill, stroke: c.ink });
      poly(ctx, [[x0 + 12, base], [x1 - 12, base], [x1 - 12, y], [x0 + 12, y]], { fill: d >= 0 ? c.a : c.b, stroke: c.ink, width: 2 });
      label(ctx, `${d >= 0 ? '+' : '−'}${fixed(Math.abs(d), 2)} K`, (x0 + x1) / 2, Math.min(y, base) - 10, c, { size: 13, bounds: stage, patch: false });
    };
    bar(10, w / 2 - 6, dTl(state), c.fillC);
    bar(w / 2 + 6, w - 10, dTs(state), c.fillB);
    label(ctx, 'land', w * 0.25, h * 0.93, c, { size: 13, patch: false });
    label(ctx, 'sea', w * 0.75, h * 0.93, c, { size: 13, patch: false });
    const landWarmer = dTl(state) > dTs(state);
    const [ax, bx] = landWarmer ? [w * 0.8, w * 0.35] : [w * 0.2, w * 0.65];
    arrow(ctx, ax, h * 0.14, bx, h * 0.14, { color: c.ink, width: 3 });
    label(ctx, landWarmer ? 'sea breeze (air from the sea)' : 'land breeze (air from the land)', w / 2, h * 0.06, c, { size: 12, bounds: stage, patch: false });
  },
  controls: [
    { title: 'Sun on land and sea' },
    { key: 'night', label: 'Night (losing heat)', toggle: true },
    { key: 'h', label: 'Hours', min: 1, max: 12, step: 1 },
    { key: 'dl', label: 'Land layer depth (m)', min: 0.1, max: 3, step: 0.1 },
    { key: 'ds', label: 'Sea layer depth (m)', min: 0.1, max: 10, step: 0.1 },
    { readout: [
      ['Heat per m²', (s) => `${fixed(Q(s) / 1e6, 2)} MJ`],
      ['Land ΔT', (s) => `${fixed(dTl(s), 2)} K`],
      ['Sea ΔT', (s) => `${fixed(dTs(s), 2)} K`],
      ['Ratio', (s) => `×${fixed(dTl(s) / dTs(s), 1)}`],
    ] },
  ],
  tex: (s) => `\\Delta T=\\dfrac{Q}{m c}\\ :\\ \\text{land}\\ ${fixed(dTl(s), 2)}\\ \\mathrm{K},\\ \\text{sea}\\ ${fixed(dTs(s), 2)}\\ \\mathrm{K}`,
});
