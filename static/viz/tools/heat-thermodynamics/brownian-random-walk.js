import { createTool } from '../../lib/tool.js';
import { createClock, transport } from '../../lib/sim.js';
import { createPlot } from '../../lib/plot.js';
import { createRng } from '../../lib/rng.js';
import { dot, label } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';

// 25 dust grains start at the centre. Each step moves a grain by a Gaussian kick of width σ in x and in y, so <r²> = 2 σ² n after n steps.
const NW = 25;
const state = { sigma: 1 };
let rng = createRng(9);
const gauss = () => Math.sqrt(-2 * Math.log(1 - rng.next())) * Math.cos(2 * Math.PI * rng.next());
let walkers;
let steps;
let curve;
function reset() {
  rng = createRng(9);
  walkers = Array.from({ length: NW }, () => ({ x: 0, y: 0, trail: [[0, 0]] }));
  steps = 0;
  curve = [[0, 0]];
}
reset();
let last = 0;
const clock = createClock(document.querySelector('#stage'), {
  onFrame: (st) => {
    if (st.t < last) reset();
    const n = Math.max(0, Math.round((st.t - last) * 120));
    last = st.t;
    for (let k = 0; k < n; k++) {
      for (const w of walkers) {
        w.x += gauss() * state.sigma; w.y += gauss() * state.sigma;
        if (steps % 3 === 0) { w.trail.push([w.x, w.y]); if (w.trail.length > 200) w.trail.shift(); }
      }
      steps++;
      curve.push([steps, walkers.reduce((p, w) => p + w.x * w.x + w.y * w.y, 0) / NW]);
    }
    tool.update();
  },
});
const msd = () => (steps ? walkers.reduce((p, w) => p + w.x * w.x + w.y * w.y, 0) / NW : 0);

const tool = createTool({
  state,
  label: 'Left: the paths of 25 dust grains starting together at the centre, each jittering by random kicks from molecules. Right: the average of the squared distance against the number of kicks, with the straight line that theory predicts. The average squared distance grows in proportion to the time.',
  setup: (stage, c) => createPlot(stage, { c, x: [0, 1500], y: [0, 100], box: (st) => ({ x: st.w * 0.52, y: 0, w: st.w * 0.48, h: st.h }) }),
  draw(ctx, stage, c, plot) {
    const [W, H] = [stage.w, stage.h];
    const [cx, cy] = [W * 0.25, H / 2];
    const span = Math.max(8, Math.sqrt(2 * state.sigma ** 2 * Math.max(steps, 200)) * 3.2);
    const s = Math.min(W * 0.23, H * 0.46) / span;
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 2;
    ctx.strokeRect(8, H / 2 - Math.min(W * 0.24, H * 0.47), W * 0.48, 2 * Math.min(W * 0.24, H * 0.47));
    walkers.forEach((w, i) => {
      ctx.beginPath();
      w.trail.forEach(([x, y], k) => (k ? ctx.lineTo(cx + x * s, cy + y * s) : ctx.moveTo(cx + x * s, cy + y * s)));
      ctx.strokeStyle = i === 0 ? c.a : c.grid;
      ctx.lineWidth = i === 0 ? 3 : 1.5;
      ctx.stroke();
      if (i === 0) dot(ctx, cx + w.x * s, cy + w.y * s, 5, c.a, c.ink, 2);
    });
    dot(ctx, cx, cy, 4, c.paper, c.ink, 2);
    const top = Math.max(100, Math.ceil((2 * state.sigma ** 2 * Math.max(steps, 600) * 1.3) / 50) * 50);
    plot.setRange([0, Math.max(600, Math.ceil(steps / 300) * 300 + 300)], [0, top]);
    plot.axes({ xLabel: 'kicks', yLabel: '⟨r²⟩' });
    plot.fn((n) => 2 * state.sigma ** 2 * n, { color: c.grid, dash: [6, 5], width: 3 });
    ctx.beginPath();
    curve.forEach(([n, v], i) => (i ? ctx.lineTo(...plot.toPx(n, v)) : ctx.moveTo(...plot.toPx(n, v))));
    ctx.strokeStyle = c.b;
    ctx.lineWidth = 3;
    ctx.stroke();
    label(ctx, 'average of 25 grains', W * 0.75, H * 0.06, c, { size: 11, bounds: stage, patch: false });
  },
  controls: () => [
    { title: 'Jiggle the grains' },
    { key: 'sigma', label: 'Kick size σ', min: 0.5, max: 2, step: 0.25, format: (v) => fixed(v, 2) },
    transport(clock),
    { readout: [
      ['Kicks so far', () => steps],
      ['Average ⟨r²⟩', () => fixed(msd(), 1)],
      ['Theory 2σ²n', () => fixed(2 * state.sigma ** 2 * steps, 1)],
      ['Grain 1: kicks × σ', () => fixed(steps * state.sigma, 1)],
    ] },
  ],
  onChange() { reset(); last = 0; clock.reset(); clock.play(); },
  tex: () => `\\langle r^{2}\\rangle=2\\sigma^{2}n=2\\times ${fixed(state.sigma, 2)}^{2}\\times ${steps}=${fixed(2 * state.sigma ** 2 * steps, 1)}`,
});
clock.play();
