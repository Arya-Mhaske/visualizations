import { createDrill } from '../../lib/drill.js';
import { cloud, linearFit } from './_modelling-math.js';

// The clouds are generated, then the answer is checked: a "linear" cloud has r² high and a bent one has a clear curve.
function make(rng, linear) {
  const seed = rng.int(1, 100000);
  const base = cloud(seed, 14, 0, 0).map(([x]) => x);
  const noise = cloud(seed + 1, 14, 0, 0.5).map(([, y]) => y);
  const kind = rng.pick(['quad', 'exp', 'sine']);
  const pts = base.map((x, i) => {
    const y = linear ? 0.8 * x + 1 : kind === 'quad' ? 0.35 * x * x - 3 : kind === 'exp' ? 0.35 * Math.exp(0.6 * x) : 3 * Math.sin(0.9 * x);
    return [x, y + noise[i] * (linear ? 1 : 0.4)];
  });
  return pts;
}

createDrill({
  stage: document.querySelector('#stage'),
  panel: document.querySelector('#panel'),
  seed: 21,
  generate(rng) {
    const linear = rng.next() < 0.5;
    const pts = make(rng, linear);
    const r = linearFit(pts).r;
    return {
      prompt: 'Is a straight line a good model for these points?',
      options: ['Yes, linear', 'No, nonlinear'],
      answer: linear ? 0 : 1,
      alt: 'A scatter plot of fourteen points',
      figure(ctx, stage, c) {
        const [xs, ys] = [pts.map((p) => p[0]), pts.map((p) => p[1])];
        const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys) - 1, Math.max(...ys) + 1];
        const px = (x) => 14 + ((x - x0) / (x1 - x0)) * (stage.w - 28);
        const py = (y) => stage.h - 14 - ((y - y0) / (y1 - y0)) * (stage.h - 28);
        ctx.fillStyle = c.b;
        ctx.strokeStyle = c.ink;
        ctx.lineWidth = 2;
        pts.forEach(([x, y]) => { ctx.beginPath(); ctx.arc(px(x), py(y), 6, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); });
      },
      hint: 'Look at whether the points bend away from any straight line, rather than just scatter about it.',
      explain: linear ? `The points scatter evenly about a line (r = ${r.toFixed(2)}).` : `The points follow a curve, so a line misses them in a pattern. r = ${r.toFixed(2)} can still look high, so look at the shape too.`,
    };
  },
});
