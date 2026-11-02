import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { simpson, num } from './_ia.js';

// Spin the region under y = h(x) about the y-axis. A thin vertical strip at x becomes a cylindrical shell; cut it down one side and flatten it: a slab 2πx long, h(x) tall, dx thick.
const SHAPES = {
  hump: { name: 'y = x(4 − x) on [0, 4]', h: (x) => x * (4 - x), b: 4, y: [0, 5] },
  half: { name: 'y = 4 − x on [0, 4]', h: (x) => 4 - x, b: 4, y: [0, 5] },
  sq: { name: 'y = x² on [0, 2]', h: (x) => x * x, b: 2, y: [0, 5] },
};
const state = { fn: 'hump', x: 1.5 };
const K = () => SHAPES[state.fn];
const X = () => Math.min(state.x, K().b);
const shell = (x) => 2 * Math.PI * x * K().h(x);
const V = (x) => simpson(shell, 0, x, 200);

createTool({
  state,
  label: 'Top: the region under a curve with one thin strip. Bottom: the strip spun into a shell and unrolled into a flat rectangle whose length is the circumference 2 pi x and whose height is the curve height.',
  setup: (stage, c) => createPlot(stage, { x: [0, 4], y: [0, 5], c, box: (s) => ({ x: 0, y: 0, w: s.w, h: s.h * 0.5 }) }),
  draw(ctx, stage, c, plot) {
    const k = K();
    plot.setRange([0, 4.4], k.y);
    plot.axes({ xLabel: 'x', yLabel: 'y' });
    plot.shade(k.h, null, 0, k.b, c.fillB);
    plot.fn(k.h, { color: c.ink, width: 3, domain: [0, k.b] });
    plot.segment(X(), 0, X(), k.h(X()), { color: c.a, width: 5 });
    // unrolled slab: width 2πx (scaled), height h(x)
    const top = stage.h * 0.55;
    const avail = stage.h - top - 24;
    const wMax = 2 * Math.PI * 4;
    const sx = (stage.w - 40) / wMax;
    const sy = avail / 5;
    const w = 2 * Math.PI * X() * sx;
    const h = k.h(X()) * sy;
    ctx.fillStyle = c.fillA; ctx.strokeStyle = c.ink; ctx.lineWidth = 3;
    ctx.fillRect(20, top + avail - h, w, h);
    ctx.strokeRect(20, top + avail - h, w, h);
    ctx.fillStyle = c.ink;
    ctx.font = `12px ${c.fontMono}`;
    ctx.fillText(`length 2πx = ${num(2 * Math.PI * X(), 3)}   height = ${num(k.h(X()), 3)}`, 20, top + avail + 16);
  },
  controls: [
    { title: 'Unroll a shell' },
    { key: 'fn', label: 'Region', options: Object.entries(SHAPES).map(([k, v]) => [k, v.name]) },
    { key: 'x', label: 'Strip at x', min: 0.1, max: 4, step: 0.05, format: (v) => v.toFixed(2) },
    { readout: [
      ['Slab volume per dx', () => num(shell(X()), 4)],
      ['Volume of shells out to x', () => num(V(X()), 5)],
      ['Whole solid', () => num(V(K().b), 5)],
    ] },
  ],
  tex: () => 'dV=2\\pi x\\,h(x)\\,dx,\\qquad V=2\\pi\\int_a^{b}x\\,h(x)\\,dx',
});
