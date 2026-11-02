import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { arc, TAU } from '../../lib/draw.js';
import { simpson, num } from './_ia.js';

// Rotate the region between y = √x (outer) and y = g(x) about the x-axis. A slice at x is a disc (g = 0) or a ring (washer).
const INNER = { none: { name: 'down to the x-axis (discs)', g: () => 0, tex: '0' }, line: { name: 'down to y = x/2 (washers)', g: (x) => x / 2, tex: 'x/2' } };
const R = (x) => Math.sqrt(x);
const state = { inner: 'none', x: 2 };
const G = () => INNER[state.inner].g;
const area = (x) => Math.PI * (R(x) ** 2 - G()(x) ** 2);
const V = (x) => simpson(area, 0, x, 200);

createTool({
  state,
  label: 'Top: the flat region between a curve and an inner boundary with one thin vertical slice. Bottom: what that slice becomes when the region spins about the x-axis, a full disc or a ring.',
  setup: (stage, c) => createPlot(stage, { x: [0, 4], y: [-0.2, 2.2], c, box: (s) => ({ x: 0, y: 0, w: s.w, h: s.h * 0.5 }) }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'x', yLabel: 'y' });
    plot.shade(R, G(), 0, 4, c.fillB);
    plot.fn(R, { color: c.ink, width: 3 });
    if (state.inner === 'line') plot.fn(G(), { color: c.ink, width: 3 });
    plot.segment(state.x, G()(state.x), state.x, R(state.x), { color: c.a, width: 5 });
    const H = stage.h * 0.5;
    const sc = (H - 24) / 2 / 2.1;
    const [cx, cy] = [stage.w / 2, H + (stage.h - H) / 2];
    arc(ctx, cx, cy, R(state.x) * sc, 0, TAU, { color: c.ink, width: 3 });
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, R(state.x) * sc, 0, TAU);
    if (state.inner === 'line') { ctx.moveTo(cx + G()(state.x) * sc, cy); ctx.arc(cx, cy, G()(state.x) * sc, 0, TAU, true); }
    ctx.fillStyle = c.fillA;
    ctx.fill('evenodd');
    ctx.restore();
    if (state.inner === 'line') arc(ctx, cx, cy, G()(state.x) * sc, 0, TAU, { color: c.ink, width: 3 });
  },
  controls: [
    { title: 'Slice and spin' },
    { key: 'inner', label: 'Region goes', options: Object.entries(INNER).map(([k, v]) => [k, v.name]) },
    { key: 'x', label: 'Slice at x', min: 0.1, max: 4, step: 0.1, format: (v) => v.toFixed(1) },
    { readout: [
      ['Outer radius', () => num(R(state.x), 4)],
      ['Inner radius', () => num(G()(state.x), 4)],
      ['Slice area π(R² − r²)', () => num(area(state.x), 5)],
      ['Volume from 0 to x', () => num(V(state.x), 5)],
      ['Whole solid (0 to 4)', () => num(V(4), 5)],
    ] },
  ],
  tex: (s) => `V=\\pi\\int_0^{4}\\left[(\\sqrt{x})^2-(${INNER[s.inner].tex})^2\\right]dx`,
});
