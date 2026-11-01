import { createTool } from '../../lib/tool.js';
import { createBench, unit } from '../../lib/rays.js';
import { handles } from '../../lib/stage.js';
import { arrow, line, label } from '../../lib/draw.js';
import { fixed, sig } from '../../lib/format.js';
import { lensImage } from './_lenses-math.js';

// The lens is at x = 0, light goes to the right. u is the distance of the object to the left of the lens.
const state = { kind: 'convex', f: 5, u: 9 };
const H = 1.4;
const F = (s) => (s.kind === 'convex' ? s.f : -s.f);
const vOf = (s) => lensImage(F(s), -s.u);
const mOf = (s) => vOf(s) / -s.u;
const describe = (s) => {
  const v = vOf(s);
  if (!Number.isFinite(v)) return 'image at infinity';
  const m = mOf(s);
  return `${v > 0 ? 'real' : 'virtual'}, ${m < 0 ? 'inverted' : 'upright'}, ${Math.abs(m) > 1.001 ? 'magnified' : Math.abs(m) < 0.999 ? 'diminished' : 'same size'}`;
};

const tool = createTool({
  state,
  label: 'A lens on the axis with an arrow-shaped object to its left. Three rays from the tip of the arrow are drawn: one parallel to the axis, one through the centre and one aimed at the focus. Where they meet, or seem to meet, is the tip of the image.',
  setup: (stage, c) => createBench(stage, { x: [-16, 16], cy: 0.5, c }),
  draw(ctx, stage, c, bench) {
    const f = F(state);
    bench.axis();
    // the lens
    const top = bench.toPx(0, 4.6);
    const bottom = bench.toPx(0, -4.6);
    line(ctx, top[0], top[1], bottom[0], bottom[1], { color: c.ink, width: 4 });
    const tip = state.kind === 'convex' ? 1 : -1;
    for (const end of [top, bottom]) {
      const dir = end === top ? 1 : -1;
      arrow(ctx, end[0], end[1] + dir * 0, end[0] - 9, end[1] + dir * tip * 10, { color: c.ink, width: 3, head: 8 });
      arrow(ctx, end[0], end[1], end[0] + 9, end[1] + dir * tip * 10, { color: c.ink, width: 3, head: 8 });
    }
    bench.mark('F', -Math.abs(f), { color: c.grid });
    bench.mark('F', Math.abs(f), { color: c.grid });
    bench.object(-state.u, H, c.a);
    const tipPt = [-state.u, H];
    const v = vOf(state);
    const rays = [];
    // 1: parallel to the axis, then through (or away from) F2
    rays.push({ y: H, after: unit([Math.abs(f), -H * Math.sign(f)]) });
    // 2: through the centre
    rays.push({ y: H - (H / state.u) * state.u, after: unit([state.u, -H]) });
    // 3: aimed at the first focus, then parallel
    if (Math.abs(state.u - f) > 0.05) rays.push({ y: (-H * f) / (state.u - f), after: [1, 0] });
    const colors = [c.b, c.c, c.d];
    rays.forEach((r, k) => {
      const hit = [0, r.y];
      if (Math.abs(r.y) > 4.6) return;
      bench.ray(tipPt, hit, { color: colors[k], width: 2 });
      bench.rayTo(hit, r.after, { color: colors[k], width: 2 });
      if (Number.isFinite(v) && v < 0) bench.ray(hit, [v, mOf(state) * H], { color: colors[k], width: 2, dash: [6, 5], arrow: false });
    });
    if (Number.isFinite(v)) {
      bench.object(v, mOf(state) * H, c.a, { dash: v < 0 ? [7, 5] : [] });
      label(ctx, 'image', ...bench.toPx(v, mOf(state) * H + (mOf(state) > 0 ? 0.9 : -0.9)), c, { color: c.ink, size: 11, bounds: stage });
    }
  },
  controls: () => [
    { title: 'Place the object' },
    { key: 'kind', label: 'Lens', options: [['convex', 'Converging'], ['concave', 'Diverging']] },
    { key: 'f', label: 'Focal length, |f|', min: 2, max: 10, step: 0.5, format: (n) => `${fixed(n, 1)} cm` },
    { key: 'u', label: 'Object distance, |u|', min: 1, max: 15, step: 0.5, format: (n) => `${fixed(n, 1)} cm` },
    { readout: [
      ['Image distance, v', (s) => (Number.isFinite(vOf(s)) ? `${sig(vOf(s), 3)} cm` : '∞')],
      ['Magnification, m', (s) => (Number.isFinite(vOf(s)) ? sig(mOf(s), 3) : '∞')],
      ['The image is', describe],
    ] },
  ],
  tex: (s) => `\\dfrac{1}{v}-\\dfrac{1}{u}=\\dfrac{1}{f}\\ \\Rightarrow\\ v=${Number.isFinite(vOf(s)) ? sig(vOf(s), 3) : '\\infty'}\\ \\text{cm}\\quad m=\\dfrac{v}{u}=${Number.isFinite(vOf(s)) ? sig(mOf(s), 3) : '\\infty'}`,
});

handles(tool.stage, [{
  at: () => tool.extra.toPx(-state.u, H),
  move(px) { state.u = Math.max(1, Math.min(15, Math.round(-tool.extra.toWorld(px, 0)[0] * 2) / 2)); },
  nudge(direction) { state.u = Math.max(1, Math.min(15, state.u - direction * 0.5)); },
}], { onChange: () => tool.update() });
tool.update();
