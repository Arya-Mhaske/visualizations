import { createTool } from '../../lib/tool.js';
import { createBench, refract, unit } from '../../lib/rays.js';
import { dot, label, line } from '../../lib/draw.js';
import { fixed, sig } from '../../lib/format.js';
import { surfaceImage } from './_lenses-math.js';

// Air on the left (n1 = 1), glass on the right (n2). The surface has its vertex at x = 0 and its centre of curvature at x = R.
const state = { shape: 'curved', n2: 1.5, R: 3, u: 8 }; // u: object distance to the left
const radius = (s) => (s.shape === 'flat' ? Infinity : s.R);
const vOf = (s) => surfaceImage(1, s.n2, radius(s), -s.u);
const HEIGHTS = [-1.2, -0.8, -0.4, 0.4, 0.8, 1.2];

const tool = createTool({
  state,
  label: 'Rays from a point on the left meet a glass surface and bend. For a curved surface rays that hit further from the axis bend more, and they meet at a point inside the glass. For a flat surface they spread out and never meet.',
  setup: (stage, c) => createBench(stage, { x: [-10, 6], cy: 0.5, c }),
  draw(ctx, stage, c, bench) {
    const R = radius(state);
    const [vx, vy] = bench.toPx(0, 0);
    const [rx] = bench.toPx(14, 0);
    const curve = () => {
      ctx.beginPath();
      for (let k = -30; k <= 30; k++) {
        const y = (k / 30) * 2.4;
        const x = R === Infinity ? 0 : R - Math.sqrt(Math.max(R * R - y * y, 0));
        const [px, py] = bench.toPx(x, y);
        if (k === -30) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
    };
    curve();
    ctx.lineTo(rx, bench.toPx(0, 2.4)[1]);
    ctx.lineTo(rx, bench.toPx(0, -2.4)[1]);
    ctx.closePath();
    ctx.fillStyle = c.fillB;
    ctx.fill();
    curve();
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 3;
    ctx.stroke();
    bench.axis();
    const O = [-state.u, 0];
    for (const y of HEIGHTS) {
      const x = R === Infinity ? 0 : R - Math.sqrt(R * R - y * y);
      const d = unit([x - O[0], y - O[1]]);
      bench.ray(O, [x, y], { color: c.b, width: 2, arrow: false });
      // the normal facing the incoming ray points back towards the object side
      const nrm = R === Infinity ? [-1, 0] : unit([x - R, y]);
      const out = refract(d, nrm, 1, state.n2);
      if (out) bench.rayTo([x, y], out, { color: c.a, width: 2, arrow: false });
    }
    dot(ctx, ...bench.toPx(...O), 7, c.fillY, c.ink);
    label(ctx, 'object', ...bench.toPx(O[0], -0.7), c, { color: c.ink, size: 11, bounds: stage });
    const v = vOf(state);
    if (Number.isFinite(v) && v > 0) {
      dot(ctx, ...bench.toPx(v, 0), 7, c.fillC, c.ink);
      label(ctx, 'image', ...bench.toPx(v, -0.7), c, { color: c.ink, size: 11, bounds: stage });
    } else if (Number.isFinite(v)) {
      dot(ctx, ...bench.toPx(v, 0), 7, c.fillC, c.ink);
      label(ctx, 'seems to be here', ...bench.toPx(v, 0.7), c, { color: c.ink, size: 11, bounds: stage });
    }
    line(ctx, vx, vy - 4, vx, vy + 4, { color: c.ink, width: 3 });
    label(ctx, 'air, n = 1', 50, 16, c, { color: c.ink, size: 11 });
    label(ctx, `glass, n = ${fixed(state.n2, 2)}`, stage.w - 60, 16, c, { color: c.ink, size: 11 });
  },
  controls: () => [
    { title: 'A point of light meets glass' },
    { key: 'shape', label: 'Surface', options: [['curved', 'Curved'], ['flat', 'Flat']] },
    { key: 'R', label: 'Radius of curvature, R', min: 2, max: 10, step: 0.5, format: (n) => fixed(n, 1) },
    { key: 'n2', label: 'Index of glass, n₂', min: 1.2, max: 2, step: 0.05, format: (n) => fixed(n, 2) },
    { key: 'u', label: 'Object distance', min: 3, max: 9, step: 0.5, format: (n) => fixed(n, 1) },
    { readout: [
      ['Image distance, v', (s) => (Number.isFinite(vOf(s)) ? `${sig(vOf(s), 3)}` : 'at infinity')],
      ['Rays meet?', (s) => (vOf(s) > 0 ? { text: 'yes: a real image', good: true } : { text: 'no: they spread', good: false })],
    ] },
  ],
  tex: (s) => `\\dfrac{n_2}{v}-\\dfrac{n_1}{u}=\\dfrac{n_2-n_1}{R}\\ \\Rightarrow\\ v=${Number.isFinite(vOf(s)) ? sig(vOf(s), 3) : '\\infty'}`,
});
tool.update();
