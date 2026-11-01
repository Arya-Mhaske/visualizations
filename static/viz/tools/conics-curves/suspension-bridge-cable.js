import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { curve, trace } from './_conics-view.js';

// Axes at the lowest point of the cable, so y = x² / (4a). The towers are at x = ±L/2, height `sag` above it.
const state = { L: 600, sag: 80, x: 150 };
const a = (s = state) => (s.L * s.L) / (16 * s.sag);
const heightAt = (s, x) => (x * x) / (4 * a(s));

createTool({
  state,
  label: 'A suspension bridge in side view. Two towers hold a cable that hangs in a parabola. The origin is at the lowest point of the cable. The span and the sag fix the equation y equals x squared over 4a, and from it the height of the cable at any distance x from the middle, where a hanger would go.',
  setup: (stage, c) => createPlot(stage, { x: [-500, 500], y: [-20, 220], c, pad: 14 }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'x (m)', yLabel: '' });
    const h = state.L / 2;
    plot.segment(-h, 0, -h, state.sag + 25, { color: c.ink, width: 7 });
    plot.segment(h, 0, h, state.sag + 25, { color: c.ink, width: 7 });
    curve(plot, trace((x) => [x, heightAt(state, x)], -h, h, 160), { color: c.a, width: 4 });
    for (let x = -h + 50; x < h; x += 50) plot.segment(x, 0, x, heightAt(state, x), { color: c.grid, width: 1 });
    plot.segment(state.x, 0, state.x, heightAt(state, state.x), { color: c.b, width: 5 });
    plot.point(state.x, heightAt(state, state.x), { fill: c.fillY, r: 8 });
    plot.point(0, a(state), { fill: c.c, r: 6 });
    plot.text('focus', 0, a(state) + 12, { size: 11, patch: false });
  },
  controls: [
    { title: 'Design the bridge' },
    { key: 'L', label: 'Span between towers, L', min: 300, max: 900, step: 50, format: (n) => `${n} m` },
    { key: 'sag', label: 'Sag, tower top to lowest point', min: 40, max: 160, step: 10, format: (n) => `${n} m` },
    { key: 'x', label: 'Hanger at x =', min: 0, max: 450, step: 10, format: (n) => `${n} m` },
    { readout: [
      ['a in y = x²/4a', (s) => fixed(a(s), 1)],
      ['Cable height there', (s) => (s.x > s.L / 2 ? 'beyond the tower' : `${fixed(heightAt(s, s.x), 1)} m above the lowest point`)],
      ['Focus above the lowest point', (s) => `${fixed(a(s), 1)} m`],
    ] },
  ],
  tex: (s) => `\\left(\\dfrac L2\\right)^2=4a(\\text{sag})\\Rightarrow a=\\dfrac{${s.L}^2}{16(${s.sag})}=${fixed(a(s), 1)},\\quad y(${s.x})=\\dfrac{${s.x}^2}{4(${fixed(a(s), 1)})}=${fixed(heightAt(s, s.x), 1)}`,
});
