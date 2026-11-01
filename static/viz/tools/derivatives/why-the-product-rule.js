import { createTool } from '../../lib/tool.js';
import { label, poly } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';

const state = { u: 4, v: 3, du: 0.5, dv: 0.4 };

createTool({
  state,
  label: 'A rectangle u wide and v tall that grows to u plus du wide and v plus dv tall. The new area is the old rectangle plus two thin strips, one of area u times dv and one of area v times du, plus a tiny corner of area du times dv. When du and dv are small the corner is far smaller than the strips, so the growth is u dv plus v du.',
  draw(ctx, stage, c) {
    const { u, v, du, dv } = state;
    const k = (Math.min(stage.w, stage.h) * 0.74) / Math.max(u + du, v + dv);
    const [x0, y0] = [stage.w * 0.12, stage.h * 0.1];
    const r = (a, b, w, h, fill) => poly(ctx, [[x0 + a * k, y0 + (v + dv - b - h) * k], [x0 + (a + w) * k, y0 + (v + dv - b - h) * k], [x0 + (a + w) * k, y0 + (v + dv - b) * k], [x0 + a * k, y0 + (v + dv - b) * k]], { fill, stroke: c.ink, width: 2 });
    r(0, 0, u, v, c.fillB);
    r(u, 0, du, v, c.fillA);
    r(0, v, u, dv, c.fillC);
    r(u, v, du, dv, c.fillY);
    label(ctx, 'u·v', x0 + (u * k) / 2, y0 + (dv + v / 2) * k, c, { size: 13, bounds: stage, patch: false });
    label(ctx, 'v·du', x0 + (u + du / 2) * k + 22, y0 + (dv + v / 2) * k, c, { size: 10, bounds: stage, patch: false });
    label(ctx, 'u·dv', x0 + (u * k) / 2, y0 + (dv / 2) * k, c, { size: 10, bounds: stage, patch: false });
    label(ctx, 'du·dv', x0 + (u + du) * k - 4, y0 + (dv / 2) * k - 12, c, { size: 9, bounds: stage, patch: false });
  },
  controls: [
    { title: 'Grow both sides' },
    { key: 'u', label: 'u', min: 1, max: 6, step: 0.5 },
    { key: 'v', label: 'v', min: 1, max: 6, step: 0.5 },
    { key: 'du', label: 'du', min: 0.05, max: 1, step: 0.05 },
    { key: 'dv', label: 'dv', min: 0.05, max: 1, step: 0.05 },
    { readout: [
      ['Actual growth', (s) => fixed((s.u + s.du) * (s.v + s.dv) - s.u * s.v, 4)],
      ['u·dv + v·du', (s) => fixed(s.u * s.dv + s.v * s.du, 4)],
      ['Corner du·dv', (s) => fixed(s.du * s.dv, 4)],
    ] },
  ],
  tex: (s) => `d(uv)\\approx u\\,dv+v\\,du=${fixed(s.u * s.dv + s.v * s.du, 3)}\\quad\\Rightarrow\\quad (uv)'=u'v+uv'`,
});
