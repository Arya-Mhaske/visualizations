import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { simpson, num } from './_ia.js';

// Join (0, 0) to (4, 0) with y = a sin(πx/4) + b sin(2πx/4) + c sin(3πx/4). Length = ∫√(1 + y′²) dx. The straight line (4) is the shortest; wiggles make it longer.
const state = { a: 1, b: 0, c: 0 };
const y = (x) => state.a * Math.sin((Math.PI * x) / 4) + state.b * Math.sin((2 * Math.PI * x) / 4) + state.c * Math.sin((3 * Math.PI * x) / 4);
const dy = (x) => (Math.PI / 4) * (state.a * Math.cos((Math.PI * x) / 4) + 2 * state.b * Math.cos((2 * Math.PI * x) / 4) + 3 * state.c * Math.cos((3 * Math.PI * x) / 4));
const length = () => simpson((x) => Math.sqrt(1 + dy(x) ** 2), 0, 4, 2000);
let best = { short: Infinity, long: 0 };

createTool({
  state,
  label: 'A curve from the point zero comma zero to the point four comma zero, shaped by three sliders. A readout gives its length, which can never be less than 4, with the shortest and longest lengths found so far.',
  setup: (stage, c) => createPlot(stage, { x: [0, 4], y: [-3, 3], c }),
  draw(ctx, stage, c, plot) {
    plot.setRange([-0.3, 4.3], [-3.2, 3.2]);
    plot.axes({ xLabel: 'x', yLabel: 'y' });
    plot.segment(0, 0, 4, 0, { color: c.b, width: 2, dash: [6, 4] });
    plot.fn(y, { color: c.a, width: 3.5, domain: [0, 4] });
    plot.point(0, 0, { fill: c.ink }); plot.point(4, 0, { fill: c.ink });
  },
  controls: [
    { title: 'Shape the curve' },
    { key: 'a', label: 'Big hump a', min: -3, max: 3, step: 0.1, format: (v) => v.toFixed(1) },
    { key: 'b', label: 'Double wave b', min: -3, max: 3, step: 0.1, format: (v) => v.toFixed(1) },
    { key: 'c', label: 'Triple wave c', min: -3, max: 3, step: 0.1, format: (v) => v.toFixed(1) },
    { readout: [
      ['Length of your curve', () => { const L = length(); best = { short: Math.min(best.short, L), long: Math.max(best.long, L) }; return num(L, 5); }],
      ['Shortest so far', () => num(best.short, 5)],
      ['Longest so far', () => num(best.long, 5)],
      ['Straight line', () => { return '4 (cannot be beaten)'; }],
    ] },
  ],
  tex: () => 'L=\\int_0^{4}\\sqrt{1+y\'^2}\\,dx\\ \\ge\\ 4',
});
