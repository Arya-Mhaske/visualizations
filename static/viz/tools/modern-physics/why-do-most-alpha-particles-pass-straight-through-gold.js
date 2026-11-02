import { createTool } from '../../lib/tool.js';
import { dot, label, line, poly } from '../../lib/draw.js';
import { sig } from '../../lib/format.js';

// Units: the head-on distance of closest approach r0 = 1 (about 41 fm for a 5.5 MeV alpha on gold).
// The alpha has m = 1 and kinetic energy 1, so v0 = sqrt 2. The nucleus pushes with a = 1/r^2 (hat r).
// Exact angle: tan(θ/2) = r0 / (2b) = 1/(2b).
const state = { B: 3 };
const R0_FM = 41;
const ATOM_FM = 1e5; // 1e-10 m
const N = 13;

export const impacts = (B, n = N) => Array.from({ length: n }, (_, i) => ((i - (n - 1) / 2) / ((n - 1) / 2)) * B);
export const angleOf = (b) => 2 * Math.atan2(1, 2 * Math.abs(b));

function path(b, L = 9) {
  const sign = b < 0 ? -1 : 1;
  let [x, y, vx, vy] = [-L, Math.abs(b), Math.SQRT2, 0];
  const pts = [[x, y]];
  const acc = (px, py) => {
    const r2 = px * px + py * py;
    const r = Math.sqrt(r2);
    return [px / (r2 * r), py / (r2 * r)];
  };
  let [ax, ay] = acc(x, y);
  for (let i = 0; i < 6000; i++) {
    const r = Math.hypot(x, y);
    const dt = 0.02 * Math.min(1, Math.max(0.05, r) / 1.5);
    x += vx * dt + 0.5 * ax * dt * dt;
    y += vy * dt + 0.5 * ay * dt * dt;
    const [bx, by] = acc(x, y);
    vx += 0.5 * (ax + bx) * dt;
    vy += 0.5 * (ay + by) * dt;
    [ax, ay] = [bx, by];
    pts.push([x, y]);
    if (Math.hypot(x, y) > L * 1.05 && i > 10) break;
  }
  return pts.map(([px, py]) => [px, sign * py]);
}

const tool = createTool({
  state,
  label: 'A nucleus at the centre of the stage with a row of alpha particles fired from the left at different heights. Far-off paths go almost straight. Paths that pass close are bent sharply, and the closest ones bounce nearly backwards. Paths bending more than 90 degrees are coral.',
  draw(ctx, stage, c) {
    const half = 9;
    const k = Math.min(stage.w, stage.h) / (2 * half + 1);
    const ox = stage.w / 2;
    const oy = stage.h / 2;
    for (const b of impacts(state.B)) {
      const pts = path(b).map(([x, y]) => [ox + x * k, oy - y * k]);
      const big = angleOf(b) > Math.PI / 2;
      poly(ctx, pts, { stroke: big ? c.a : c.b, width: big ? 3 : 2, closed: false });
    }
    dot(ctx, ox, oy, 8, c.fillY, c.ink);
    label(ctx, 'nucleus', ox, oy + 20, c, { size: 10, patch: false });
    // scale bar: one r0
    line(ctx, 12, stage.h - 14, 12 + k, stage.h - 14, { color: c.ink, width: 3 });
    label(ctx, '1 r₀ ≈ 41 fm', 16 + k, stage.h - 14, c, { size: 10, align: 'left', bounds: stage, patch: false });
  },
  controls: () => [
    { title: 'Fire alphas at gold' },
    { key: 'B', label: 'Aim spread, b up to', min: 0.3, max: 8, step: 0.1, format: (v) => `${sig(v, 2)} r₀` },
    { readout: [
      ['Closest alpha bends', (s) => `${sig((angleOf(s.B / 6) * 180) / Math.PI, 3)}°`],
      ['Furthest alpha bends', (s) => `${sig((angleOf(s.B) * 180) / Math.PI, 3)}°`],
      ['Head-on closest approach', () => `${R0_FM} fm`],
      ['Size: nucleus ÷ atom', () => `about 1 : ${sig(ATOM_FM / 7, 2)}`],
      ['Aimed at the atom, hit > 90°', () => `1 in ${sig(((ATOM_FM) / (R0_FM / 2)) ** 2, 2)}`],
    ] },
  ],
  tex: (s) => `\\tan\\dfrac{\\theta}{2}=\\dfrac{r_0}{2b}:\\quad b=${sig(s.B, 2)}\\,r_0\\Rightarrow\\theta=${sig((angleOf(s.B) * 180) / Math.PI, 3)}^{\\circ}`,
});

tool.update();
