import { createTool } from '../../lib/tool.js';
import { createBench } from '../../lib/rays.js';
import { handles } from '../../lib/stage.js';
import { arrow, dot, label } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { ballField, monopoleField, sphereFlux } from './_magnetism-matter-math.js';

const state = { source: 'magnet', cx: 1.6, R: 1.6 };
const field = (s) => (s.source === 'magnet' ? (x, y) => ballField(x, y, 0) : (x, y) => monopoleField(x, y, 0));
const SNAP = 0.004;
function parts(s) {
  const { samples } = sphereFlux(field(s), s.cx, s.R, 720);
  let out = 0;
  let inn = 0;
  const k = (Math.PI / 720) * s.R * s.R * 2 * Math.PI / (4 * Math.PI);
  for (const { a, Bn } of samples) {
    const d = Bn * Math.sin(a) * k;
    if (d > 0) out += d; else inn += d;
  }
  let net = out + inn;
  if (Math.abs(net) < SNAP * Math.max(out, 1e-9) + 1e-6) net = 0;
  return { out, inn, net, samples };
}

const tool = createTool({
  state,
  label: 'A round surface drawn round a source. Coral arrows mark where field lines leave the surface and blue arrows where they enter it. For a magnet the lines in always equal the lines out. For a point charge, shown for contrast, they do not when it is inside.',
  setup: (stage, c) => createBench(stage, { x: [-5, 5], cy: 0.5, c }),
  draw(ctx, stage, c, bench) {
    const [ox, oy] = bench.toPx(0, 0);
    const [ux] = bench.toPx(1, 0);
    const unit = ux - ox;
    // the source
    if (state.source === 'magnet') {
      ctx.beginPath();
      ctx.arc(ox, oy, unit, 0, Math.PI * 2);
      ctx.fillStyle = c.fillA;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(ox, oy, unit, Math.PI / 2, (3 * Math.PI) / 2);
      ctx.fillStyle = c.fillB;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(ox, oy, unit, 0, Math.PI * 2);
      ctx.strokeStyle = c.ink;
      ctx.lineWidth = 3;
      ctx.stroke();
      label(ctx, 'S', ox - unit / 2, oy, c, { color: c.ink, size: 14, patch: false });
      label(ctx, 'N', ox + unit / 2, oy, c, { color: c.ink, size: 14, patch: false });
    } else {
      dot(ctx, ox, oy, 12, c.fillA, c.ink);
      label(ctx, '+', ox, oy, c, { color: c.ink, size: 16, patch: false });
    }
    const [cx, cy] = bench.toPx(state.cx, 0);
    const r = state.R * unit;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 6]);
    ctx.stroke();
    ctx.setLineDash([]);
    const { samples } = parts(state);
    const every = 18;
    const maxB = Math.max(...samples.map((s) => Math.abs(s.Bn)), 1e-9);
    samples.forEach(({ a, Bn }, i) => {
      if (i % every !== 8) return;
      for (const sign of [1, -1]) {
        const px = cx + r * Math.cos(a);
        const py = cy - sign * r * Math.sin(a);
        const nx = Math.cos(a);
        const ny = -sign * Math.sin(a);
        const L = 8 + 24 * Math.sqrt(Math.abs(Bn) / maxB);
        const dir = Bn > 0 ? 1 : -1;
        const sx = px - nx * L * 0.5 * dir;
        const sy = py - ny * L * 0.5 * dir;
        arrow(ctx, sx, sy, sx + nx * L * dir, sy + ny * L * dir, { color: Bn > 0 ? c.a : c.b, width: 3, head: 7 });
      }
    });
    dot(ctx, cx, cy, 6, c.fillY, c.ink);
  },
  controls: () => [
    { title: 'Surround the source' },
    { key: 'source', label: 'Source', options: [['magnet', 'Magnet'], ['charge', 'Point charge']] },
    { key: 'cx', label: 'Surface centre', min: -3, max: 3, step: 0.1, format: (n) => fixed(n, 1) },
    { key: 'R', label: 'Surface radius', min: 0.5, max: 3, step: 0.1, format: (n) => fixed(n, 1) },
    { readout: [
      ['Lines out', (s) => fixed(parts(s).out, 3)],
      ['Lines in', (s) => fixed(parts(s).inn, 3)],
      ['Net', (s) => { const n = parts(s).net; return n === 0 ? { text: '0: in = out', good: true } : { text: fixed(n, 3), good: false }; }],
    ] },
  ],
  tex: (s) => (s.source === 'magnet' ? '\\oint \\vec B\\cdot d\\vec A=0' : '\\oint \\vec E\\cdot d\\vec A=\\dfrac{q_{in}}{\\varepsilon_0}'),
});

handles(tool.stage, [{
  at: () => tool.extra.toPx(state.cx, 0),
  move(px) { state.cx = Math.max(-3, Math.min(3, Math.round(tool.extra.toWorld(px, 0)[0] * 10) / 10)); },
  nudge(direction) { state.cx = Math.max(-3, Math.min(3, Math.round((state.cx + direction * 0.1) * 10) / 10)); },
}], { onChange: () => tool.update() });
tool.update();
