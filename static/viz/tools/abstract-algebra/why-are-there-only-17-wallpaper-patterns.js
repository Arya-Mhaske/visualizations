import { createTool } from '../../lib/tool.js';
import { dot, label, line } from '../../lib/draw.js';

// A repeating pattern sits on a lattice of points. If it has k-fold rotation symmetry, turning the lattice by 360°/k must put
// it back on itself. Try it: only k = 1, 2, 3, 4, 6 ever work. For each k, count how many wallpaper groups have it as their
// highest rotation order: 4 + 5 + 3 + 3 + 2 = 17.
const state = { lattice: 'hex', k: 6 };
const BASES = { square: [[1, 0], [0, 1]], hex: [[1, 0], [0.5, Math.sqrt(3) / 2]], oblique: [[1, 0], [0.3, 0.9]] };
const NAMES = { square: 'Square', hex: 'Hexagonal', oblique: 'Oblique (no special shape)' };
export const GROUPS_BY_ROTATION = { 1: ['p1', 'pm', 'pg', 'cm'], 2: ['p2', 'pmm', 'pmg', 'pgg', 'cmm'], 3: ['p3', 'p3m1', 'p31m'], 4: ['p4', 'p4m', 'p4g'], 6: ['p6', 'p6m'] };
const RADIUS = 2.6;

function points(lattice) {
  const [u, v] = BASES[lattice];
  const out = [];
  for (let i = -7; i <= 7; i++) for (let j = -7; j <= 7; j++) {
    const p = [i * u[0] + j * v[0], i * u[1] + j * v[1]];
    if (Math.hypot(...p) <= RADIUS) out.push({ ij: [i, j], p });
  }
  return out;
}
// Express a point back in lattice coordinates; it is a lattice point when both are whole numbers.
function onLattice(lattice, p) {
  const [u, v] = BASES[lattice];
  const det = u[0] * v[1] - u[1] * v[0];
  const i = (p[0] * v[1] - p[1] * v[0]) / det;
  const j = (u[0] * p[1] - u[1] * p[0]) / det;
  return Math.abs(i - Math.round(i)) < 1e-6 && Math.abs(j - Math.round(j)) < 1e-6;
}
export function rotate(p, k) {
  const t = (2 * Math.PI) / k;
  return [p[0] * Math.cos(t) - p[1] * Math.sin(t), p[0] * Math.sin(t) + p[1] * Math.cos(t)];
}
export const matchShare = (lattice, k) => { const pts = points(lattice); return pts.filter(({ p }) => onLattice(lattice, rotate(p, k))).length / pts.length; };
export const traceValue = (k) => 2 * Math.cos((2 * Math.PI) / k);

createTool({
  state,
  label: 'A lattice of blue dots and the same lattice turned by 360 over k degrees as coral rings. Green dots mark where a turned point lands exactly on an original point. Only for k equal to 1, 2, 3, 4 or 6 do all the points match.',
  draw(ctx, stage, c) {
    const [cx, cy] = [stage.w / 2, stage.h / 2];
    const s = Math.min(stage.w, stage.h) / (2 * RADIUS + 1.2);
    const px = ([x, y]) => [cx + x * s, cy - y * s];
    const pts = points(state.lattice);
    pts.forEach(({ p }) => {
      const q = rotate(p, state.k);
      const [x, y] = px(q);
      const hit = onLattice(state.lattice, q);
      ctx.beginPath();
      ctx.arc(x, y, 7, 0, Math.PI * 2);
      ctx.strokeStyle = hit ? c.c : c.a;
      ctx.lineWidth = 3;
      ctx.stroke();
    });
    pts.forEach(({ p }) => {
      const [x, y] = px(p);
      dot(ctx, x, y, 4, c.fillB, c.ink, 1.5);
    });
    line(ctx, cx - 6, cy, cx + 6, cy, { color: c.ink, width: 2 });
    label(ctx, `turned by ${(360 / state.k).toFixed(1).replace('.0', '')}°`, stage.w / 2, 14, c, { size: 12 });
    const share = Math.round(matchShare(state.lattice, state.k) * 100);
    label(ctx, `${share}% of the turned points land on the lattice`, stage.w / 2, stage.h - 14, c, { size: 12, color: share === 100 ? c.ink : c.a, bounds: stage });
  },
  controls: [
    { title: 'Turn a lattice' },
    { key: 'lattice', label: 'Lattice shape', options: Object.entries(NAMES) },
    { key: 'k', label: 'Fold of the rotation, k', min: 1, max: 12, step: 1 },
    { readout: [
      ['2 cos(360°/k)', (s) => traceValue(s.k).toFixed(3)],
      ['A whole number?', (s) => { const ok = Math.abs(traceValue(s.k) - Math.round(traceValue(s.k))) < 1e-9; return { text: ok ? 'yes: allowed' : 'no: impossible', good: ok }; }],
      ['Wallpaper groups with top rotation k', (s) => (GROUPS_BY_ROTATION[s.k] ? `${GROUPS_BY_ROTATION[s.k].length}: ${GROUPS_BY_ROTATION[s.k].join(', ')}` : '0')],
    ] },
  ],
  tex: (s) => `2\\cos\\frac{360^\\circ}{${s.k}}=${traceValue(s.k).toFixed(3)}`,
});
