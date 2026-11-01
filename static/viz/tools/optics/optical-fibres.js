import { createTool } from '../../lib/tool.js';
import { createBench } from '../../lib/rays.js';
import { dot, label } from '../../lib/draw.js';
import { fixed, sig } from '../../lib/format.js';
import { fibreTrace, smallestBend, criticalAngle } from './_refraction-math.js';

// The fibre bends through half a circle round the origin. Its core is 1 unit wide.
const W = 1;
const state = { rc: 5, alpha: 8, nCore: 1.5, nClad: 1.3 };
const trace = (s) => fibreTrace({ rc: s.rc, w: W, alpha: s.alpha, nCore: s.nCore, nClad: s.nClad });
const smallest = (s) => smallestBend({ w: W, alpha: s.alpha, nCore: s.nCore, nClad: s.nClad });

const tool = createTool({
  state,
  label: 'A curved glass fibre drawn as half a ring, with a coral ray bouncing from wall to wall inside it. If the bend is gentle the ray reaches the far end. If the bend is too sharp the ray meets the outer wall at too steep an angle and leaks out.',
  setup: (stage, c) => createBench(stage, { x: [-5, 5], cy: 0.88, c }),
  draw(ctx, stage, c, bench) {
    const half = state.rc + 1.3;
    bench.setRange([-half, half]);
    const [ox, oy] = bench.toPx(0, 0);
    const [ux] = bench.toPx(1, 0);
    const u = ux - ox;
    const rOut = (state.rc + W / 2) * u;
    const rIn = (state.rc - W / 2) * u;
    ctx.beginPath();
    ctx.arc(ox, oy, rOut, 0, -Math.PI, true);
    ctx.arc(ox, oy, rIn, -Math.PI, 0, false);
    ctx.closePath();
    ctx.fillStyle = c.fillY;
    ctx.fill();
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 3;
    ctx.stroke();
    const out = trace(state);
    ctx.beginPath();
    out.points.forEach((p, k) => {
      const [x, y] = bench.toPx(p[0], p[1]);
      if (k === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = out.outcome === 'guided' ? c.c : c.a;
    ctx.lineWidth = 3;
    ctx.stroke();
    if (out.leakAt) dot(ctx, ...bench.toPx(...out.leakAt), 7, c.fillA, c.ink);
    label(ctx, 'light in', ...bench.toPx(state.rc, -0.35), c, { color: c.ink, size: 11, bounds: stage });
    label(ctx, out.outcome === 'guided' ? 'light gets through' : 'light leaks out', stage.w / 2, 18, c, { color: c.ink, size: 13 });
  },
  controls: () => [
    { title: 'Bend the fibre' },
    { key: 'rc', label: 'Bend radius (core widths)', min: 0.8, max: 12, step: 0.1, format: (n) => fixed(n, 1) },
    { key: 'alpha', label: 'Launch angle to the axis', min: 0, max: 30, step: 1, format: (n) => `${n}°` },
    { key: 'nCore', label: 'Core index', min: 1.45, max: 1.7, step: 0.01, format: (n) => fixed(n, 2) },
    { key: 'nClad', label: 'Cladding index', min: 1.2, max: 1.44, step: 0.01, format: (n) => fixed(n, 2) },
    { readout: [
      ['Critical angle', (s) => `${fixed(criticalAngle(s.nCore, s.nClad), 1)}°`],
      ['Bounces', (s) => `${trace(s).bounces}`],
      ['Result', (s) => (trace(s).outcome === 'guided' ? { text: 'guided to the end', good: true } : { text: 'leaks at the bend', good: false })],
      ['Tightest bend that works', (s) => { const m = smallest(s); return m === null ? 'none' : `${fixed(m, 2)} core widths`; }],
    ] },
  ],
  tex: (s) => `\\sin C=\\dfrac{n_{clad}}{n_{core}}=\\dfrac{${fixed(s.nClad, 2)}}{${fixed(s.nCore, 2)}}\\ \\Rightarrow\\ C=${fixed(criticalAngle(s.nCore, s.nClad), 1)}^\\circ`,
});
tool.update();
