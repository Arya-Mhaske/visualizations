import { createTool } from '../../lib/tool.js';
import { arrow, dot, label, line } from '../../lib/draw.js';
import { handles } from '../../lib/stage.js';
import { fixed, sig } from '../../lib/format.js';
import { forces, netForce, netTorque, torqueSize } from './_loops-meters-math.js';

// A rectangular loop a (up the axis) by b, seen from above the axis. B points right. Page: x right, z up.
const A = 0.2;
const B_LEN = 0.1;
const state = { theta: 60, B: 0.5, I: 2 };
const list = (s) => forces(s.I, A, B_LEN, s.theta, s.B);
const rad = (d) => (d * Math.PI) / 180;
const mOf = (s) => s.I * A * B_LEN;

const tool = createTool({
  state,
  label: 'The loop seen end-on from above its axis: a line with two wire ends, one with current out of the page and one into it. A uniform field points right. Equal and opposite blue forces act on the two ends, in different places, so they twist the loop but do not push it. The moment arrow m is at angle theta to the field.',
  draw(ctx, stage, c) {
    const cx = stage.w / 2;
    const cy = stage.h / 2;
    const s = Math.min(stage.w, stage.h) * 0.36;
    const t = rad(state.theta);
    const d = [-Math.sin(t), Math.cos(t)]; // the loop's width, in (x, z)
    const p1 = [cx + d[0] * s, cy - d[1] * s]; // the +d side
    const p2 = [cx - d[0] * s, cy + d[1] * s];
    // the field
    for (let k = -2; k <= 2; k++) {
      const y = cy + k * stage.h * 0.17;
      arrow(ctx, 14, y, stage.w - 14, y, { color: c.grid, width: 2, head: 8 });
    }
    label(ctx, 'B', stage.w - 24, cy - stage.h * 0.17 * 2 - 14, c, { color: c.grid, size: 12 });
    line(ctx, p1[0], p1[1], p2[0], p2[1], { color: c.ink, width: 5 });
    // the two vertical sides: current into the page on the +d side's partner... both shown with their symbols
    const f = list(state);
    const right = f[0];
    const left = f[2];
    const sym = (p, outOfPage) => {
      ctx.beginPath();
      ctx.arc(p[0], p[1], 12, 0, Math.PI * 2);
      ctx.fillStyle = c.fillY;
      ctx.fill();
      ctx.strokeStyle = c.ink;
      ctx.lineWidth = 3;
      ctx.stroke();
      if (outOfPage) dot(ctx, p[0], p[1], 3.5, c.ink, c.ink, 1);
      else {
        line(ctx, p[0] - 6, p[1] - 6, p[0] + 6, p[1] + 6, { color: c.ink, width: 3 });
        line(ctx, p[0] - 6, p[1] + 6, p[0] + 6, p[1] - 6, { color: c.ink, width: 3 });
      }
    };
    // y runs into the page here: the +d side carries -y, so its current comes out of the page
    sym(p1, true);
    sym(p2, false);
    const scale = (stage.h * 0.2) / 0.8; // 0.8 N is the largest possible force (4 A, 0.2 m, 1 T)
    for (const [side, p] of [[right, p1], [left, p2]]) {
      const fz = side.F[2] * scale;
      arrow(ctx, p[0], p[1], p[0], p[1] - fz, { color: c.b, width: 5, head: 12 });
    }
    // the moment, from the centre
    const mx = cx + Math.cos(t) * s * 0.9;
    const my = cy - Math.sin(t) * s * 0.9;
    arrow(ctx, cx, cy, mx, my, { color: c.a, width: 5, head: 13 });
    label(ctx, 'm', mx + 14, my - 12, c, { color: c.a, size: 13 });
    label(ctx, 'F', p1[0] + 22, p1[1] - (right.F[2] * scale) / 2, c, { color: c.b, size: 12, patch: false });
  },
  controls: () => [
    { title: 'Turn the loop in a field' },
    { key: 'theta', label: 'Angle between m and B, θ', min: 0, max: 180, step: 5, format: (n) => `${n}°` },
    { key: 'B', label: 'Field, B', min: 0.1, max: 1, step: 0.1, format: (n) => `${fixed(n, 1)} T` },
    { key: 'I', label: 'Current, I', min: 0.5, max: 4, step: 0.5, format: (n) => `${fixed(n, 1)} A` },
    { readout: [
      ['Force on each long side', (s) => `${sig(s.I * A * s.B, 3)} N`],
      ['Net force', (s) => { const F = netForce(list(s)); return `${sig(Math.hypot(...F.map((x) => Math.round(x * 1e12) / 1e12)), 3)} N`; }],
      ['Torque, τ', (s) => `${sig(Math.abs(netTorque(list(s))[1]), 3)} N m`],
      ['mB sin θ', (s) => `${sig(torqueSize(mOf(s), s.B, s.theta), 3)} N m`],
    ] },
  ],
  tex: (s) => `\\tau=Bl\\,\\cdot\\,IaB\\sin\\theta=mB\\sin\\theta=${sig(torqueSize(mOf(s), s.B, s.theta), 3)}\\ \\text{N m}`,
});

handles(tool.stage, [{
  at: () => {
    const s = Math.min(tool.stage.w, tool.stage.h) * 0.36;
    const t = rad(state.theta);
    return [tool.stage.w / 2 + Math.cos(t) * s * 0.9, tool.stage.h / 2 - Math.sin(t) * s * 0.9];
  },
  move(px, py) {
    const dx = px - tool.stage.w / 2;
    const dy = tool.stage.h / 2 - py;
    let deg = (Math.atan2(dy, dx) * 180) / Math.PI;
    if (deg < 0) deg += 360;
    state.theta = Math.max(0, Math.min(180, Math.round(deg / 5) * 5));
  },
  nudge(direction) { state.theta = Math.max(0, Math.min(180, state.theta + direction * 5)); },
}], { onChange: () => tool.update() });
tool.update();
