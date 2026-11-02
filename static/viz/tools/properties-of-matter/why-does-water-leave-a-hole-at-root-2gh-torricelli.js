import { plotTool } from '../../lib/recipes.js';
import { fixed } from '../../lib/format.js';
import { G } from '../../lib/quick.js';

const state = { H: 2, h: 0.5 };
const range = (s, h) => 2 * Math.sqrt(h * (s.H - h));

plotTool({
  state,
  label: 'Horizontal range of the jet from a hole against the depth of the hole below the surface. It is zero at the top and the bottom and greatest at half the depth.',
  x: [0, 2],
  y: [0, 2],
  xLabel: 'depth of the hole below the surface (m)',
  yLabel: 'range of the jet (m)',
  range: (s) => [[0, s.H], [0, s.H * 1.05]],
  curves: (s, c) => [[(h) => range(s, h), { color: c.b }]],
  points: (s, c) => [[s.h, range(s, s.h), c.a], [s.H / 2, range(s, s.H / 2), c.c, 5]],
  controls: [
    { title: 'The tank' },
    { key: 'H', label: 'Water depth H (m)', min: 0.5, max: 4, step: 0.5 },
    { key: 'h', label: 'Hole depth h (m)', min: 0.05, max: 3.95, step: 0.05 },
    { readout: [
      ['Exit speed √(2gh)', (s) => `${fixed(Math.sqrt(2 * G * Math.min(s.h, s.H)), 2)} m/s`],
      ['Range', (s) => `${fixed(range(s, Math.min(s.h, s.H)), 2)} m`],
      ['Longest range at', (s) => `h = ${fixed(s.H / 2, 2)} m`],
    ] },
  ],
  tex: (s) => `v=\\sqrt{2gh},\\quad x=2\\sqrt{h(H-h)}`,
  onChange: (s) => {
    s.h = Math.min(s.h, s.H - 0.05);
  },
});
