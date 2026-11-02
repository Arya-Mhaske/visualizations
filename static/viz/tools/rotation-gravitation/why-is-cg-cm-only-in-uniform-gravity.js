import { plotTool } from '../../lib/recipes.js';
import { fixed } from '../../lib/format.js';

const state = { k: 0.2, mTop: 1, mBot: 1 };
const H = 10;
const cm = (s) => (s.mTop * H) / (s.mTop + s.mBot);
const g = (s, h) => 1 - s.k * (h / H);
const cg = (s) => (s.mTop * g(s, H) * H) / (s.mTop * g(s, H) + s.mBot * g(s, 0));

plotTool({
  state,
  label: 'A tall body modelled as a heavy top and bottom block on a vertical line, with markers for the centre of mass and the centre of gravity. When gravity weakens with height, the centre of gravity is lower than the centre of mass.',
  x: [-3, 3],
  y: [-1, 12],
  yLabel: 'height',
  range: () => [[-3, 3], [-1, 12]],
  segments: (s, c) => [[0, 0, 0, H, { color: c.ink, width: 3 }]],
  points: (s, c) => [[0, 0, c.fillB, 6 + s.mBot * 3], [0, H, c.fillB, 6 + s.mTop * 3], [-0.8, cm(s), c.a, 8], [0.8, cg(s), c.c, 8]],
  texts: (s) => [['CM', -1.5, cm(s), {}], ['CG', 1.5, cg(s), {}]],
  controls: [
    { title: 'A tall body' },
    { key: 'k', label: 'How much g falls from bottom to top', min: 0, max: 0.6, step: 0.05, format: (v) => `${Math.round(v * 100)}%` },
    { key: 'mTop', label: 'Top mass', min: 1, max: 5, step: 1 },
    { key: 'mBot', label: 'Bottom mass', min: 1, max: 5, step: 1 },
    { readout: [
      ['Centre of mass', (s) => fixed(cm(s), 3)],
      ['Centre of gravity', (s) => fixed(cg(s), 3)],
      ['Same point?', (s) => ({ text: Math.abs(cm(s) - cg(s)) < 1e-9 ? 'yes: g uniform' : 'no', good: s.k === 0 })],
    ] },
  ],
  tex: (s) => `h_{cg}=\\dfrac{\\sum m g h}{\\sum m g}\\ \\ne\\ h_{cm}=\\dfrac{\\sum m h}{\\sum m}`,
});
