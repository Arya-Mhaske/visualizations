import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { enableDrag } from '../../lib/stage.js';
import { line } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { solve, euler } from './_de-math.js';

const FIELDS = {
  x: { name: 'dy/dx = x', f: (x) => x, eq: [] },
  y: { name: 'dy/dx = y', f: (x, y) => y, eq: [0] },
  xy: { name: 'dy/dx = x − y', f: (x, y) => x - y, eq: [] },
  logi: { name: 'dy/dx = y(1 − y)', f: (x, y) => y * (1 - y), eq: [0, 1] },
  sine: { name: 'dy/dx = sin x', f: (x) => Math.sin(x), eq: [] },
};
const state = { field: 'y', x0: 0, y0: 1, euler: false, h: 0.5 };
const seeds = [[0, 1], [0, -1], [0, 0.4]];
const F = () => FIELDS[state.field];
const curve = (f, x0, y0, from, to) => solve((t, [y]) => [f(t, y)], [y0], x0, to, Math.max(2, Math.round(Math.abs(to - x0) * 40))).map((r) => [r[0], r[1]]);

const tool = createTool({
  state,
  label: 'A slope field: short arrows showing the slope of every solution that passes through each point. Tap anywhere on the picture, or use the buttons, to drop a seed. The seed flows along the arrows in both directions and traces its own solution curve. An Euler overlay replaces the last curve with straight steps of a size you choose.',
  setup: (stage, c) => createPlot(stage, { x: [-4, 4], y: [-3, 3], c }),
  draw(ctx, stage, c, plot) {
    const { f, eq } = F();
    plot.axes({ xLabel: 'x', yLabel: 'y' });
    const sx = Math.abs(plot.toPx(1, 0)[0] - plot.toPx(0, 0)[0]);
    const sy = Math.abs(plot.toPx(0, 1)[1] - plot.toPx(0, 0)[1]);
    for (let gx = -3.75; gx <= 3.75; gx += 0.5) {
      for (let gy = -2.75; gy <= 2.75; gy += 0.5) {
        const m = f(gx, gy);
        const dx = sx;
        const dy = -m * sy;
        const n = Math.hypot(dx, dy) || 1;
        const [px, py] = plot.toPx(gx, gy);
        const L = 9;
        line(ctx, px - (dx / n) * L, py - (dy / n) * L, px + (dx / n) * L, py + (dy / n) * L, { color: c.grid, width: 2 });
      }
    }
    for (const y of eq) plot.segment(-4, y, 4, y, { color: c.c, width: 3, dash: [7, 5] });
    seeds.forEach(([x0, y0], i) => {
      const color = i === seeds.length - 1 ? c.a : c.b;
      for (const to of [4, -4]) {
        const pts = curve(f, x0, y0, x0, to);
        for (let k = 1; k < pts.length; k++) {
          if (Math.abs(pts[k][1]) < 8 && Math.abs(pts[k - 1][1]) < 8) plot.segment(...pts[k - 1], ...pts[k], { color, width: 3 });
        }
      }
      plot.point(x0, y0, { fill: color, r: 5 });
    });
    if (state.euler && seeds.length) {
      const [x0, y0] = seeds[seeds.length - 1];
      const pts = euler(f, x0, y0, state.h, Math.max(1, Math.round((4 - x0) / state.h)));
      for (let k = 1; k < pts.length; k++) plot.segment(...pts[k - 1], ...pts[k], { color: c.ink, width: 3, dash: [5, 4] });
      pts.forEach(([x, y]) => plot.point(x, y, { fill: c.fillY, r: 3 }));
    }
  },
  controls: (t) => [
    { title: 'Drop seeds' },
    { key: 'field', label: 'Equation', options: Object.entries(FIELDS).map(([k, v]) => [k, v.name]) },
    { key: 'x0', label: 'Seed x', min: -3.5, max: 3.5, step: 0.5, format: (v) => fixed(v, 1) },
    { key: 'y0', label: 'Seed y', min: -2.5, max: 2.5, step: 0.25, format: (v) => fixed(v, 2) },
    { row: [
      { button: 'Drop seed', onClick: () => { seeds.push([state.x0, state.y0]); if (seeds.length > 8) seeds.shift(); t.update(); } },
      { button: 'Clear', ghost: true, onClick: () => { seeds.length = 0; seeds.push([state.x0, state.y0]); t.update(); } },
    ] },
    { key: 'euler', label: 'Overlay Euler steps on the last seed', toggle: true },
    { key: 'h', label: 'Euler step size', min: 0.1, max: 1, step: 0.1, format: (v) => fixed(v, 1) },
    { readout: [
      ['Seeds on the field', () => `${seeds.length}`],
      ['Slope at last seed', (s) => fixed(F().f(seeds[seeds.length - 1]?.[0] ?? s.x0, seeds[seeds.length - 1]?.[1] ?? s.y0), 3)],
    ] },
  ],
  tex: () => String.raw`\dfrac{dy}{dx}=f(x,y)\ \text{gives the slope at every point}`,
});

enableDrag(tool.stage.canvas, {
  start(px, py) {
    const [x, y] = tool.extra.toWorld(px, py);
    if (Math.abs(x) <= 4 && Math.abs(y) <= 3) {
      seeds.push([x, y]);
      if (seeds.length > 8) seeds.shift();
      tool.update();
    }
    return false;
  },
  move() {},
  end() {},
});
