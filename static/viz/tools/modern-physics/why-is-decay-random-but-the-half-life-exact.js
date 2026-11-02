import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { createRng } from '../../lib/rng.js';
import { dot, label } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';

// Each nucleus has its own random decay time, t = -ln(u) T½ / ln 2 (T½ = 1). Nothing says which goes next,
// yet the count left follows N0 e^(-λt).
const state = { n: 100, t: 1, seed: 1 };
const LN2 = Math.LN2;
let times = [];
let key = '';
function rebuild() {
  const k = `${state.n}/${state.seed}`;
  if (k === key) return;
  key = k;
  const rng = createRng(state.seed * 7919 + state.n);
  times = Array.from({ length: state.n }, () => -Math.log(1 - rng.next()) / LN2).sort((a, b) => a - b);
}
const left = (t) => {
  rebuild();
  let lo = 0;
  let hi = times.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (times[mid] <= t) lo = mid + 1;
    else hi = mid;
  }
  return times.length - lo;
};
const medianTime = () => { rebuild(); return times[Math.ceil(state.n / 2) - 1]; };

const tool = createTool({
  state,
  label: 'Top: a grid of dots, one per nucleus. Solid dots have not decayed yet and hollow dots have. Bottom: a graph of the fraction left against time in half-lives. A jagged coral staircase is this run; the smooth blue curve is the exponential law. With few nuclei they differ a lot, with many they agree.',
  setup: (stage, c) => createPlot(stage, { x: [0, 6], y: [0, 1.05], c, pad: 26, box: (g) => ({ x: 0, y: g.h * 0.5, w: g.w, h: g.h * 0.5 }) }),
  draw(ctx, stage, c, plot) {
    rebuild();
    const cols = Math.round(Math.sqrt(state.n * 2));
    const rows = Math.ceil(state.n / cols);
    const gx = (stage.w - 24) / cols;
    const gy = (stage.h * 0.46 - 12) / rows;
    const r = Math.max(1.5, Math.min(gx, gy) * 0.36);
    // the dot order is shuffled by decay time so the grid looks random, not a sweep
    const order = Array.from({ length: state.n }, (_, i) => i);
    const rng = createRng(99 + state.seed);
    rng.shuffle(order).forEach((idx, slot) => {
      const x = 12 + (slot % cols + 0.5) * gx;
      const y = 8 + (Math.floor(slot / cols) + 0.5) * gy;
      const gone = times[idx] <= state.t;
      dot(ctx, x, y, r, gone ? c.paper : c.a, gone ? c.grid : c.ink, gone ? 1 : Math.min(2, r / 2));
    });
    plot.axes({ xLabel: 't (half-lives)', yLabel: 'N/N₀' });
    plot.fn((t) => left(t) / state.n, { color: c.a, width: 2 });
    plot.fn((t) => 2 ** -t, { color: c.b, dash: [6, 4] });
    plot.point(state.t, left(state.t) / state.n, { fill: c.a, r: 6 });
    label(ctx, `${left(state.t)} left`, stage.w - 50, 14, c, { size: 11, patch: false });
  },
  controls: () => [
    { title: 'Decay a sample' },
    { key: 'n', label: 'Nuclei', options: [[25, '25'], [100, '100'], [400, '400'], [1600, '1600']] },
    { key: 't', label: 'Time', min: 0, max: 6, step: 0.05, format: (v) => `${fixed(v, 2)} half-lives` },
    { row: [{ button: 'Run it again', onClick: () => { state.seed += 1; tool.update(); } }] },
    { readout: [
      ['Left', (s) => `${left(s.t)} of ${s.n}`],
      ['Law says N₀e^(−λt)', (s) => fixed(s.n * 2 ** -s.t, 1)],
      ['Time to lose half', () => `${fixed(medianTime(), 2)} half-lives`],
    ] },
  ],
  tex: (s) => `N=N_0e^{-\\lambda t}=N_0\\left(\\dfrac12\\right)^{t/T_{1/2}}=${fixed(s.n * 2 ** -s.t, 1)}`,
});

tool.update();
