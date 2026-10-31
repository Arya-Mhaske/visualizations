import { createTool } from '../../lib/tool.js';
import { poly } from '../../lib/draw.js';
import { fixed, sig } from '../../lib/format.js';
import { arc, DEG, fanArea, sectorArea } from './_angles-arcs-math.js';

const state = { pieces: 8, r: 4, degrees: 120, rearranged: 0 };
const rad = (s) => s.degrees * DEG;

// Triangle i of the fan, in units of r, with the apex at the sector centre.
function fanTriangle(i, n, angle) {
  const a0 = -Math.PI / 2 - angle / 2 + (angle * i) / n;
  const a1 = a0 + angle / n;
  return [[0, 0], [Math.cos(a0), Math.sin(a0)], [Math.cos(a1), Math.sin(a1)]];
}

// The same triangle in the row: apexes alternate up and down, like a strip of sliced cake.
function rowTriangle(i, n, angle) {
  const base = 2 * Math.sin(angle / n / 2);
  const height = Math.cos(angle / n / 2);
  const left = (i - n / 2) * (base / 2);
  return i % 2
    ? [[left + base / 2, -height / 2], [left, height / 2], [left + base, height / 2]]
    : [[left + base / 2, height / 2], [left, -height / 2], [left + base, -height / 2]];
}

createTool({
  state,
  label: 'A sector cut into thin triangles, which slide into a row that looks more and more like a rectangle.',
  draw(ctx, stage, c) {
    const n = state.pieces;
    const angle = rad(state);
    const unit = (Math.min(stage.w, stage.h) * 0.16 * state.r) / 2;
    const sectorOrigin = [stage.w / 2, stage.h * 0.48];
    const rowOrigin = [stage.w / 2, stage.h * 0.72];
    const t = state.rearranged;
    for (let i = 0; i < n; i++) {
      const from = fanTriangle(i, n, angle).map(([x, y]) => [sectorOrigin[0] + x * unit, sectorOrigin[1] + y * unit]);
      const to = rowTriangle(i, n, angle).map(([x, y]) => [rowOrigin[0] + x * unit, rowOrigin[1] + y * unit]);
      const points = from.map((p, k) => [p[0] + (to[k][0] - p[0]) * t, p[1] + (to[k][1] - p[1]) * t]);
      poly(ctx, points, { fill: i % 2 ? c.fillB : c.fillA, stroke: c.ink, width: n > 24 ? 1 : 2 });
    }
  },
  controls: [
    { title: 'Cut and rearrange' },
    { key: 'rearranged', label: 'Fan → row', min: 0, max: 1, step: 0.01, format: (v) => `${Math.round(v * 100)}%` },
    { key: 'pieces', label: 'Triangles', min: 2, max: 40, step: 2 },
    { key: 'r', label: 'Radius, r', min: 2, max: 5, step: 0.5, format: (v) => fixed(v, 1) },
    { key: 'degrees', label: 'Angle, θ', min: 30, max: 180, step: 5, format: (v) => `${v}°` },
    { readout: [
      ['Row width (½ arc)', (s) => sig(arc(s.r, rad(s)) / 2, 4)],
      ['Row height (r)', (s) => fixed(s.r, 1)],
      ['Triangles add to', (s) => sig(fanArea(s.r, rad(s), s.pieces), 5)],
      ['½r²θ', (s) => sig(sectorArea(s.r, rad(s)), 5)],
      ['Share of the disc', (s) => `θ/2π = ${fixed(rad(s) / (2 * Math.PI), 3)}`],
    ] },
  ],
  tex: (s) => `A = \\frac{1}{2} \\times ${fixed(s.r, 1)}^2 \\times ${fixed(rad(s), 3)} = ${sig(sectorArea(s.r, rad(s)), 4)}`,
});
