import { plotTool } from '../../lib/recipes.js';
import { fixed } from '../../lib/format.js';

const state = { h: 1 };

plotTool({
  state,
  label: 'The graph of the absolute value with a chord from the origin to a point on the right and another to a point on the left. Their slopes are plus one and minus one however close the points are.',
  x: [-3, 3],
  y: [-0.5, 3],
  range: (s) => [[-Math.max(s.h * 1.8, 0.2), Math.max(s.h * 1.8, 0.2)], [-0.2 * s.h, s.h * 1.8]],
  curves: (s, c) => [[Math.abs, { color: c.ink }]],
  segments: (s, c) => [[0, 0, s.h, s.h, { color: c.a, width: 4 }], [0, 0, -s.h, s.h, { color: c.b, width: 4 }]],
  points: (s, c) => [[s.h, s.h, c.a], [-s.h, s.h, c.b], [0, 0, c.ink, 6]],
  controls: [
    { title: 'Chords from 0' },
    { key: 'h', label: 'Distance h of the points from 0', min: 0.01, max: 2, step: 0.01 },
    { readout: [['Right slope (|h| − 0)/h', (s) => fixed(s.h / s.h, 2)], ['Left slope (|−h| − 0)/(−h)', (s) => fixed(s.h / -s.h, 2)], ['Limit exists?', () => ({ text: 'no: +1 ≠ −1', good: false })]] },
  ],
  tex: () => `\\lim_{h\\to0^+}\\dfrac{|h|}{h}=1\\ne-1=\\lim_{h\\to0^-}\\dfrac{|h|}{h}`,
});
