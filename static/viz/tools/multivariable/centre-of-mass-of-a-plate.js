import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { poly } from '../../lib/draw.js';

// Mass m = ∬ ρ dA. Centre of mass: x̄ = (1/m)∬ x ρ dA, ȳ = (1/m)∬ y ρ dA. Balance the plate on a pin at (x̄, ȳ) and it does not tip.
const REGIONS = { rect: { name: 'Rectangle 4 × 2', has: (x, y) => x >= 0 && x <= 4 && y >= 0 && y <= 2, outline: [[0, 0], [4, 0], [4, 2], [0, 2]] }, tri: { name: 'Triangle (0,0), (4,0), (0,2)', has: (x, y) => x >= 0 && y >= 0 && x / 4 + y / 2 <= 1, outline: [[0, 0], [4, 0], [0, 2]] } };
const DENS = { uni: { name: 'Uniform: ρ = 1', f: () => 1 }, right: { name: 'Heavier to the right: ρ = 1 + x', f: (x) => 1 + x }, top: { name: 'Heavier above: ρ = 1 + 2y', f: (x, y) => 1 + 2 * y } };
const state = { region: 'tri', dens: 'right', sx: 1.5, sy: 0.6 };
export function plate(region, dens, n = 160) {
  const R = REGIONS[region];
  const rho = DENS[dens].f;
  const [w, h] = [4 / n, 2 / n];
  let m = 0;
  let mx = 0;
  let my = 0;
  let a = 0;
  let ax = 0;
  let ay = 0;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    const x = (i + 0.5) * w;
    const y = (j + 0.5) * h;
    if (!R.has(x, y)) continue;
    const dm = rho(x, y) * w * h;
    m += dm; mx += x * dm; my += y * dm;
    a += w * h; ax += x * w * h; ay += y * w * h;
  }
  return { m, x: mx / m, y: my / m, cx: ax / a, cy: ay / a };
}
export function torque(region, dens, sx, sy, n = 160) {
  const R = REGIONS[region];
  const rho = DENS[dens].f;
  let tx = 0;
  let ty = 0;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    const x = (i + 0.5) * (4 / n);
    const y = (j + 0.5) * (2 / n);
    if (R.has(x, y)) { const dm = rho(x, y) * (4 / n) * (2 / n); tx += (x - sx) * dm; ty += (y - sy) * dm; }
  }
  return [tx, ty];
}

createTool({
  state,
  label: 'A flat plate shaded by density, darker where it is heavier. A coral dot is the centre of mass, a blue dot is the geometric centre, and a movable black pin shows how far the plate is from balancing on that pin.',
  setup: (stage, c) => createPlot(stage, { x: [-0.5, 4.5], y: [-0.5, 2.5], c }),
  draw(ctx, stage, c, plot) {
    plot.axes();
    const R = REGIONS[state.region];
    const rho = DENS[state.dens].f;
    const step = 0.1;
    for (let x = 0; x < 4; x += step) for (let y = 0; y < 2; y += step) {
      if (!R.has(x + step / 2, y + step / 2)) continue;
      const [px, py] = plot.toPx(x, y + step);
      const [qx, qy] = plot.toPx(x + step, y);
      ctx.globalAlpha = Math.min(0.2 + (rho(x, y) / 6) * 0.8, 1);
      ctx.fillStyle = c.fillB;
      ctx.fillRect(px, py, qx - px + 0.5, qy - py + 0.5);
    }
    ctx.globalAlpha = 1;
    poly(ctx, R.outline.map(([x, y]) => plot.toPx(x, y)), { stroke: c.ink, width: 3 });
    const p = plate(state.region, state.dens);
    plot.point(p.cx, p.cy, { fill: c.fillB });
    plot.point(p.x, p.y, { fill: c.a });
    plot.point(state.sx, state.sy, { fill: c.ink, r: 5 });
  },
  controls: [
    { title: 'Build the plate' },
    { key: 'region', label: 'Shape', options: Object.entries(REGIONS).map(([k, v]) => [k, v.name]) },
    { key: 'dens', label: 'Density', options: Object.entries(DENS).map(([k, v]) => [k, v.name]) },
    { key: 'sx', label: 'Pin x', min: 0, max: 4, step: 0.05, format: (v) => v.toFixed(2) },
    { key: 'sy', label: 'Pin y', min: 0, max: 2, step: 0.05, format: (v) => v.toFixed(2) },
    { readout: [
      ['Mass m', (s) => plate(s.region, s.dens).m.toFixed(3)],
      ['Centre of mass', (s) => { const p = plate(s.region, s.dens); return `${p.x.toFixed(3)}, ${p.y.toFixed(3)}`; }],
      ['Geometric centre', (s) => { const p = plate(s.region, s.dens); return `${p.cx.toFixed(3)}, ${p.cy.toFixed(3)}`; }],
      ['Tipping about the pin (x, y)', (s) => torque(s.region, s.dens, s.sx, s.sy).map((v) => v.toFixed(2)).join(', ')],
    ] },
  ],
  tex: () => '\\bar x=\\dfrac{\\iint x\\rho\\,dA}{\\iint\\rho\\,dA},\\quad \\bar y=\\dfrac{\\iint y\\rho\\,dA}{\\iint\\rho\\,dA}',
});
