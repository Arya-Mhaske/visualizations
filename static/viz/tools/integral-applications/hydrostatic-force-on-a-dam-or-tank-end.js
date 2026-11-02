import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { simpson, num } from './_ia.js';

// A flat plate under water. Width w(y) at depth y below the surface. F = ∫ ρ g y w(y) dy. The centre of pressure is deeper than the centroid.
const RHO = 1000; const G = 9.8;
// Each shape lies between depths top and bot below the plate's own top edge; the water surface is `level` above the plate's top.
const SHAPES = {
  rect: { name: 'Rectangular dam, 10 m wide, 6 m tall', h: 6, w: () => 10 },
  trap: { name: 'Trapezoid dam (wide at the bottom, 4 → 12 m)', h: 6, w: (u) => 4 + (8 * u) / 6 },
  circle: { name: 'Circular tank end, radius 2 m', h: 4, w: (u) => 2 * Math.sqrt(Math.max(0, 4 - (u - 2) ** 2)) },
  tri: { name: 'Triangle point down, 6 m wide, 6 m tall', h: 6, w: (u) => 6 * (1 - u / 6) },
};
const state = { shape: 'rect', level: 0 }; // level: depth of the surface above the top edge, m
const K = () => SHAPES[state.shape];
const F = () => simpson((u) => RHO * G * (u + state.level) * K().w(u), 0, K().h, 800);
const area = () => simpson(K().w, 0, K().h, 800);
const cp = () => simpson((u) => (u + state.level) ** 2 * K().w(u), 0, K().h, 800) / simpson((u) => (u + state.level) * K().w(u), 0, K().h, 800); // depth of centre of pressure
const cg = () => state.level + simpson((u) => u * K().w(u), 0, K().h, 800) / area();

createTool({
  state,
  label: 'Top: a plate under water with the water surface above it. Bottom: the width of the plate at each depth, against depth. Pressure grows with depth, so the force is a weighted area.',
  setup: (stage, c) => createPlot(stage, { x: [0, 12], y: [0, 10], c, box: (s) => ({ x: 0, y: s.h * 0.45, w: s.w, h: s.h * 0.55 }) }),
  draw(ctx, stage, c, plot) {
    const k = K();
    const H0 = stage.h * 0.45; const maxD = k.h + state.level;
    const sc = (H0 - 30) / maxD; const cx = stage.w / 2;
    const top0 = 14;
    ctx.fillStyle = c.fillB; ctx.fillRect(0, top0, stage.w, H0 - top0);
    ctx.strokeStyle = c.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, top0); ctx.lineTo(stage.w, top0); ctx.stroke();
    const wmax = Math.max(...Array.from({ length: 30 }, (_, i) => k.w((k.h * i) / 29)));
    const sx = (stage.w * 0.5) / wmax;
    ctx.fillStyle = c.fillA; ctx.beginPath();
    for (let i = 0; i <= 60; i++) { const u = (k.h * i) / 60; const x = cx - (k.w(u) * sx) / 2; const y = top0 + (u + state.level) * sc; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    for (let i = 60; i >= 0; i--) { const u = (k.h * i) / 60; ctx.lineTo(cx + (k.w(u) * sx) / 2, top0 + (u + state.level) * sc); }
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = c.c; ctx.beginPath(); ctx.arc(cx, top0 + cg() * sc, 5, 0, 7); ctx.fill();
    ctx.fillStyle = c.a; ctx.beginPath(); ctx.arc(cx, top0 + cp() * sc, 5, 0, 7); ctx.fill();
    plot.setRange([0, wmax * 1.15], [0, k.h]);
    plot.axes({ xLabel: 'width w (m)', yLabel: 'depth below top edge u (m)' });
    plot.shade(() => 0, null, 0, 0, c.fillA);
    const pts = Array.from({ length: 61 }, (_, i) => [(k.h * i) / 60, k.w((k.h * i) / 60)]);
    pts.forEach(([u, w], i) => { if (i) plot.segment(pts[i - 1][1], pts[i - 1][0], w, u, { color: c.ink, width: 3 }); });
  },
  controls: [
    { title: 'Put it under water' },
    { key: 'shape', label: 'Plate', options: Object.entries(SHAPES).map(([k, v]) => [k, v.name]) },
    { key: 'level', label: 'Surface above the top edge', min: 0, max: 10, step: 0.5, format: (v) => `${v} m` },
    { readout: [
      ['Area of the plate', () => `${num(area(), 5)} m²`],
      ['Force F = ∫ρ g y w dy', () => `${num(F() / 1000, 6)} kN`],
      ['Centroid depth (green)', () => `${num(cg(), 4)} m`],
      ['Centre of pressure (coral)', () => `${num(cp(), 4)} m`],
      ['Shortcut ρ g × centroid depth × area', () => `${num((RHO * G * cg() * area()) / 1000, 6)} kN`],
    ] },
  ],
  tex: () => 'F=\\int \\rho g\\,y\\,w(y)\\,dy=\\rho g\\,\\bar y\\,A',
});
