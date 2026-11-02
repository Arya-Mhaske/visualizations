import { createTool } from '../../lib/tool.js';
import { dot, label, line } from '../../lib/draw.js';

// A length is constructible with ruler and compass only if it lives at the top of a tower of degree-2 extensions of ℚ,
// so its degree over ℚ is a power of 2. To trisect θ we need y = cos(θ/3), which solves 4y³ − 3y = cos θ.
// If that cubic has no rational root it is irreducible, y has degree 3, and 3 is not a power of 2.
const ANGLES = { 60: [1, 2], 120: [-1, 2], 90: [0, 1], 180: [-1, 1] }; // cos θ = num/den
const state = { theta: 60 };
const coeffs = (theta) => { const [num, den] = ANGLES[theta]; return { num, den, c: [-num, -3 * den, 0, 4 * den] }; };
const divisorsOf = (n) => { const out = []; for (let d = 1; d <= Math.abs(n); d++) if (n % d === 0) out.push(d); return out; };

export function rationalRoots(theta) {
  const { num, den } = coeffs(theta);
  const found = [];
  const tops = num === 0 ? [0] : divisorsOf(num);
  const bottoms = divisorsOf(4 * den);
  const tried = [];
  for (const r of tops) for (const s of bottoms) for (const sign of [1, -1]) {
    const R = sign * r;
    if (tried.includes(`${R}/${s}`)) continue;
    tried.push(`${R}/${s}`);
    // D·(4R³ − 3R s²) − num·s³ = 0  is  4y³ − 3y = num/den  at y = R/s, multiplied through
    if (den * (4 * R ** 3 - 3 * R * s * s) - num * s ** 3 === 0) found.push([R, s]);
  }
  return { found, tried: tried.length };
}
export const degreeOver = (theta) => (rationalRoots(theta).found.length ? 'at most 2' : '3');
export const roots = (theta) => [0, 1, 2].map((k) => Math.cos(((theta + 360 * k) / 3) * (Math.PI / 180)));

createTool({
  state,
  label: 'The graph of the cubic that cos of theta over 3 must satisfy, with its three roots marked. A root that is a rational number is green. Below it, boxes of degree 1, 2, 4 and 8 mark the degrees ruler and compass can reach, and 3 sits outside them.',
  draw(ctx, stage, c) {
    const { c: co, den } = coeffs(state.theta);
    const p = (y) => co[0] + co[1] * y + co[3] * y ** 3;
    const [xl, xr, top, bottom] = [24, stage.w - 12, 26, stage.h * 0.68];
    const ymax = 1.3 * den;
    const sx = (y) => xl + ((y + 1.2) / 2.4) * (xr - xl);
    const sy = (v) => (top + bottom) / 2 - (v / ymax) * ((bottom - top) / 2);
    line(ctx, xl, sy(0), xr, sy(0), { color: c.grid, width: 1.5 });
    ctx.beginPath();
    for (let i = 0; i <= 200; i++) {
      const y = -1.2 + (2.4 * i) / 200;
      const [px, py] = [sx(y), Math.max(top, Math.min(bottom, sy(p(y))))];
      if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py);
    }
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 3;
    ctx.stroke();
    const rr = rationalRoots(state.theta).found.map(([R, s]) => R / s);
    roots(state.theta).forEach((y, k) => {
      const rational = rr.some((v) => Math.abs(v - y) < 1e-9);
      dot(ctx, sx(y), sy(0), k === 0 ? 10 : 7, rational ? c.fillC : c.a, c.ink);
      label(ctx, k === 0 ? `cos ${state.theta / 3}° ≈ ${y.toFixed(3)}` : y.toFixed(3), sx(y), sy(0) + (k === 0 ? -20 : 20), c, { size: 11, bounds: stage });
    });
    label(ctx, `4y³ − 3y = cos ${state.theta}°`, stage.w / 2, 12, c, { size: 12, bounds: stage });
    const reducible = rr.length > 0;
    [1, 2, 3, 4, 8].forEach((d, i) => {
      const x = 14 + i * ((stage.w - 28) / 5);
      const w = (stage.w - 28) / 5 - 8;
      const ok = d !== 3;
      const hit = reducible ? d <= 2 : d === 3;
      ctx.fillStyle = hit ? (ok ? c.fillC : c.fillA) : ok ? c.paper : c.grid;
      ctx.fillRect(x, stage.h * 0.8, w, 34);
      ctx.strokeStyle = c.ink;
      ctx.lineWidth = hit ? 4 : 2;
      ctx.strokeRect(x, stage.h * 0.8, w, 34);
      label(ctx, String(d), x + w / 2, stage.h * 0.8 + 17, c, { size: 14, patch: false });
    });
    label(ctx, 'degrees ruler and compass can reach: 1, 2, 4, 8 …', stage.w / 2, stage.h * 0.8 - 12, c, { size: 11, bounds: stage });
  },
  controls: [
    { title: 'Trisect this angle' },
    { key: 'theta', label: 'Angle θ', options: [[60, '60°'], [90, '90°'], [120, '120°'], [180, '180°']] },
    { readout: [
      ['cos θ', (s) => `${ANGLES[s.theta][0]}${ANGLES[s.theta][1] === 1 ? '' : `/${ANGLES[s.theta][1]}`}`],
      ['Rational roots found', (s) => { const r = rationalRoots(s.theta); return `${r.found.length} (of ${r.tried} tested)`; }],
      ['Degree of cos(θ/3) over ℚ', (s) => degreeOver(s.theta)],
      ['Trisectable?', (s) => { const ok = rationalRoots(s.theta).found.length > 0; return { text: ok ? 'yes: degree 1 or 2' : 'no: degree 3', good: ok }; }],
    ] },
  ],
  tex: (s) => { const { den, num } = coeffs(s.theta); return `${4 * den}y^3-${3 * den}y${num === 0 ? '' : num < 0 ? '+' : '-'}${num === 0 ? '' : Math.abs(num)}=0`; },
});
