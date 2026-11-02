import { createTool } from '../../lib/tool.js';
import { bars, G } from '../../lib/quick.js';
import { fixed } from '../../lib/format.js';

const SHELF = [['A', 0], ['B', 10], ['C', 25]];
const state = { zero: 0, m: 2 };
const pe = (s, h) => s.m * G * (h - s.zero);

createTool({
  state,
  label: 'Bars of the gravitational potential energy of a mass on three shelves measured from a movable zero. The values change when the zero moves but the gaps between them do not.',
  draw(ctx, stage, c) {
    bars(ctx, stage, c, SHELF.map(([n, h], i) => [`shelf ${n} (${h} m)`, Math.abs(pe(state, h)), pe(state, h) >= 0 ? [c.fillA, c.fillB, c.fillC][i] : c.paper, `${fixed(pe(state, h), 0)} J`]), { max: 700, left: 0.34 });
  },
  controls: [
    { title: 'Choose the zero' },
    { key: 'zero', label: 'Zero level at height (m)', min: -10, max: 30, step: 5 },
    { key: 'm', label: 'Mass (kg)', min: 1, max: 5, step: 1 },
    { readout: [
      ['PE at A | B | C', (s) => SHELF.map(([, h]) => fixed(pe(s, h), 0)).join(' | ')],
      ['PE(C) − PE(A)', (s) => `${fixed(pe(s, 25) - pe(s, 0), 0)} J`],
      ['PE(B) − PE(A)', (s) => `${fixed(pe(s, 10) - pe(s, 0), 0)} J`],
    ] },
  ],
  tex: (s) => `\\Delta U=mg\\,\\Delta h=${fixed(pe(s, 25) - pe(s, 0), 0)}\\ \\mathrm{J}\\ (A\\to C)`,
});
