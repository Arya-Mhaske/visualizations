import { createTool } from '../../lib/tool.js';
import { label, poly, wedge } from '../../lib/draw.js';
import { specFill } from './_aa-view.js';

// A crystal repeats one unit cell in every direction. Look at one corner where identical regular k-gons meet:
// their angles must add up to exactly 360°, or there is a gap or an overlap. That happens only for k = 3, 4 and 6.
const state = { k: 5, m: 3 };
export const interior = (k) => ((k - 2) * 180) / k;
export const leftover = (k, m) => 360 - m * interior(k);
export const tiles = (k) => Math.abs(360 / interior(k) - Math.round(360 / interior(k))) < 1e-9;

createTool({
  state,
  label: 'Several identical regular polygons meeting at one corner point. If their angles add up to 360 degrees they fit with no gap and no overlap. Otherwise a coral gap is left, or the shapes overlap. Only triangles, squares and hexagons fit.',
  draw(ctx, stage, c) {
    const [cx, cy] = [stage.w / 2, stage.h / 2];
    const side = Math.min(stage.w, stage.h) * (state.k > 6 ? 0.24 : 0.26);
    const inner = interior(state.k);
    const ext = 360 / state.k;
    const rad = Math.PI / 180;
    for (let i = 0; i < state.m; i++) {
      let heading = -90 + i * inner;
      let [x, y] = [cx, cy];
      const pts = [[x, y]];
      for (let j = 0; j < state.k - 1; j++) {
        x += side * Math.cos(heading * rad);
        y += side * Math.sin(heading * rad);
        pts.push([x, y]);
        heading += ext;
      }
      poly(ctx, pts, { fill: specFill(c, i), stroke: c.ink, width: 3 });
    }
    const total = state.m * inner;
    if (total < 360 - 1e-9) {
      wedge(ctx, cx, cy, side * 0.55, (-90 + total) * rad, (-90 + 360) * rad, { fill: c.a, stroke: c.ink, width: 2 });
    }
    label(ctx, total > 360 + 1e-9 ? 'overlap' : total < 360 - 1e-9 ? `gap ${(360 - total).toFixed(1)}°` : 'fits exactly', cx, 16, c, { size: 13, color: Math.abs(total - 360) < 1e-9 ? c.ink : c.a });
  },
  controls: (t) => [
    { title: 'Meet at a corner' },
    { key: 'k', label: 'Sides of each polygon, k', min: 3, max: 10, step: 1 },
    { key: 'm', label: 'Polygons at the corner', min: 1, max: 7, step: 1 },
    { row: [{ button: 'Add as many as fit', onClick() { state.m = Math.min(7, Math.floor(360 / interior(state.k) + 1e-9)); t.update(); } }] },
    { readout: [
      ['One angle', (s) => `${interior(s.k).toFixed(1)}°`],
      ['Angles add to', (s) => `${(s.m * interior(s.k)).toFixed(1)}°`],
      ['Left over', (s) => `${leftover(s.k, s.m).toFixed(1)}°`],
      ['Tiles the plane?', (s) => ({ text: tiles(s.k) ? 'yes: 360° divides evenly' : 'no: never fits exactly', good: tiles(s.k) })],
    ] },
  ],
  tex: (s) => `${s.m}\\times ${interior(s.k).toFixed(1)}^\\circ=${(s.m * interior(s.k)).toFixed(1)}^\\circ`,
});
