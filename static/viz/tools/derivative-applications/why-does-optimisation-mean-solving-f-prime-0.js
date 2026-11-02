import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { poly } from '../../lib/draw.js';
import { roots, num } from './_da.js';

// Step 1: write the quantity as a function of ONE variable. Step 2: find where it is flat. Step 3: check it is the best.
const PROBS = {
  fence: { name: 'Fence 100 m of wire on three sides of a field (river on the fourth)', v: 'Width x (m)', out: 'Area (m²)', lo: 1, hi: 49, start: 12, f: (x) => x * (100 - 2 * x), d: (x) => 100 - 4 * x, tex: 'A=x(100-2x)', best: 'max' },
  box: { name: 'Cut squares of side x from a 30 cm square sheet and fold up a box', v: 'Cut x (cm)', out: 'Volume (cm³)', lo: 0.5, hi: 14.5, start: 2, f: (x) => x * (30 - 2 * x) ** 2, d: (x) => (30 - 2 * x) ** 2 - 4 * x * (30 - 2 * x), tex: 'V=x(30-2x)^2', best: 'max' },
  can: { name: 'A closed can holds 1 litre (1000 cm³): least metal', v: 'Radius r (cm)', out: 'Metal area (cm²)', lo: 2, hi: 12, start: 4, f: (r) => 2 * Math.PI * r * r + 2000 / r, d: (r) => 4 * Math.PI * r - 2000 / (r * r), tex: 'S=2\\pi r^2+\\dfrac{2000}{r}', best: 'min' },
};
const state = { kind: 'fence', x: 12 };
const K = () => PROBS[state.kind];
const opt = () => roots(K().d, K().lo, K().hi)[0];

createTool({
  state,
  label: 'Top: a picture of the shape with its current size. Bottom: the quantity to optimise against the free variable. The best value is where the graph is flat.',
  setup: (stage, c) => createPlot(stage, { x: [0, 50], y: [0, 1300], c, box: (s) => ({ x: 0, y: s.h * 0.5, w: s.w, h: s.h * 0.5 }) }),
  draw(ctx, stage, c, plot) {
    const k = K();
    const h = stage.h * 0.5;
    const x = state.x;
    // schematic
    const mid = [stage.w / 2, h / 2];
    ctx.lineWidth = 3; ctx.strokeStyle = c.ink; ctx.fillStyle = c.fillA;
    if (state.kind === 'fence') {
      const w = (x / 50) * (stage.w * 0.6); const hh = ((100 - 2 * x) / 100) * (h * 0.7) * 1.2;
      ctx.fillRect(mid[0] - w / 2, mid[1] - hh / 2, w, hh); ctx.strokeRect(mid[0] - w / 2, mid[1] - hh / 2, w, hh);
      ctx.fillStyle = c.fillB; ctx.fillRect(mid[0] - stage.w * 0.35, mid[1] + hh / 2 + 4, stage.w * 0.7, 8);
    } else if (state.kind === 'box') {
      const side = Math.min(stage.w * 0.5, h * 0.8); const q = (x / 30) * side;
      const [x0, y0] = [mid[0] - side / 2, mid[1] - side / 2];
      ctx.fillStyle = c.fillB; ctx.fillRect(x0, y0, side, side); ctx.strokeRect(x0, y0, side, side);
      ctx.fillStyle = c.paper;
      for (const [cx, cy] of [[0, 0], [1, 0], [0, 1], [1, 1]]) { ctx.fillRect(x0 + cx * (side - q), y0 + cy * (side - q), q, q); ctx.strokeRect(x0 + cx * (side - q), y0 + cy * (side - q), q, q); }
    } else {
      const sc = (h * 0.8) / 24; const hh = 1000 / (Math.PI * x * x);
      const w = Math.min(2 * x * sc, stage.w * 0.8); const ht = Math.min(hh * sc, h * 0.85);
      ctx.fillRect(mid[0] - w / 2, mid[1] - ht / 2, w, ht); ctx.strokeRect(mid[0] - w / 2, mid[1] - ht / 2, w, ht);
    }
    const best = opt();
    plot.setRange([k.lo, k.hi], [0, Math.max(...[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => k.f(k.lo + ((k.hi - k.lo) * i) / 10))) * 1.15]);
    if (state.kind === 'can') plot.setRange([k.lo, k.hi], [0, 1000]);
    plot.axes({ xLabel: k.v, yLabel: k.out });
    plot.fn(k.f, { color: c.ink, width: 3, domain: [k.lo, k.hi] });
    plot.segment(best, 0, best, 1e5, { color: c.c, width: 2, dash: [6, 4] });
    plot.point(best, k.f(best), { fill: c.c, r: 8 });
    plot.point(x, k.f(x), { fill: c.a });
  },
  controls: (tool) => [
    { title: 'Build it, then find the flat point' },
    { key: 'kind', label: 'Problem', options: Object.entries(PROBS).map(([k, v]) => [k, v.name.split(':')[0].split(' (')[0]]) },
    { key: 'x', label: 'Free variable', min: 0.5, max: 49, step: 0.5, format: (v) => v.toFixed(1) },
    { button: 'Jump to f′ = 0', onClick() { state.x = Math.round(opt() * 100) / 100; tool.update(); } },
    { readout: [
      ['Problem', () => K().name],
      ['Value now', () => num(K().f(state.x), 5)],
      ['Slope now', () => num(K().d(state.x), 4)],
      ['Flat at', () => `${num(opt(), 4)} giving ${num(K().f(opt()), 5)} (${K().best})`],
    ] },
  ],
  onChange: (s) => {
    const k = PROBS[s.kind];
    const input = document.querySelector('#panel input.nb-range');
    if (input && (Number(input.min) !== k.lo || Number(input.max) !== k.hi)) {
      input.min = k.lo; input.max = k.hi; input.step = 0.1;
      s.x = k.start;
      input.value = k.start;
      const out = input.parentElement.querySelector('output');
      if (out) out.textContent = k.start.toFixed(1);
    }
  },
  tex: () => K().tex + "\\ \\Rightarrow\\ \\dfrac{d}{dx}=0",
});
