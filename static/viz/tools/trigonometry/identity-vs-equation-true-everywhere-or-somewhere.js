import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { PAIRS, agreement, crossings } from './_identities-math.js';

const state = { i: 2 };
const LO = -2 * Math.PI;
const HI = 2 * Math.PI;
const cache = PAIRS.map((p) => ({ points: crossings(p.f, p.g, LO, HI), share: agreement(p.f, p.g, LO, HI) }));
const pair = (s = state) => PAIRS[s.i];
const info = (s = state) => cache[s.i];

createTool({
  state,
  label: 'Two curves, the left side in coral and the right side in blue, drawn over two full turns. For an identity the curves lie on top of each other everywhere. For an equation they cross at a few points, marked with dots, and those points are the solutions.',
  setup: (stage, c) => createPlot(stage, { x: [LO, HI], y: [-2.5, 2.5], ticks: 'pi', c }),
  draw(ctx, stage, c, plot) {
    const p = pair();
    plot.setRange([LO, HI], [-2.5, 2.5]);
    plot.axes({ xLabel: 'x', yLabel: 'y' });
    plot.fn(p.g, { color: c.b, width: 7 });
    plot.fn(p.f, { color: c.a, width: 3 });
    if (p.kind === 'equation') for (const x of info().points) if (Math.abs(p.f(x)) < 2.5) plot.point(x, p.f(x), { fill: c.c, r: 6 });
  },
  controls: [
    { title: 'Left side = right side' },
    { key: 'i', label: 'Statement', min: 0, max: PAIRS.length - 1, step: 1, format: (n) => PAIRS[n].name },
    { readout: [
      ['Left side', () => 'coral line'],
      ['Right side', () => 'blue line'],
      ['They agree at', (s) => (info(s).share > 0.99 ? { text: 'every x', good: true } : { text: `${info(s).points.length} points`, good: false })],
      ['Verdict', (s) => ({ text: pair(s).kind, good: pair(s).kind === 'identity' })],
    ] },
  ],
  tex: (s) => (info(s).share > 0.99
    ? `\\text{true for every }x:\\ \\text{an identity}`
    : `\\text{true only at }x\\approx ${info(s).points.slice(0, 3).map((v) => fixed(v, 2)).join(',\\ ')}${info(s).points.length > 3 ? ',\\dots' : ''}`),
});
