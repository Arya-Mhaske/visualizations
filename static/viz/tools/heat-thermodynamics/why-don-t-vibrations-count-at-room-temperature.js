import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { einstein } from './_equipartition.js';
import { fixed } from '../../lib/format.js';

// C_v/R = 3/2 (translation) + rotation (smooth switch-on, illustrative) + vibration (Einstein, exact for one mode).
const GASES = {
  H2: { name: 'H₂', thetaV: 6215, thetaR: 85 },
  N2: { name: 'N₂', thetaV: 3374, thetaR: 3 },
  Cl2: { name: 'Cl₂', thetaV: 805, thetaR: 0.4 },
};
const state = { gas: 'N2', T: 300 };
const rot = (g, T) => 1 / (1 + (g.thetaR / T) ** 2);
const vib = (g, T) => einstein(g.thetaV, T);
const cv = (g, T) => 1.5 + rot(g, T) + vib(g, T);

createTool({
  state,
  label: 'The heat capacity per mole of a diatomic gas against temperature, in units of R. It starts at three halves with only translation, steps up to five halves when rotation switches on, and climbs again only at high temperature when vibration switches on. At room temperature vibration has barely started for hydrogen and nitrogen.',
  setup: (stage, c) => createPlot(stage, { c, x: [0, 3000], y: [0, 4] }),
  draw(ctx, stage, c, plot) {
    const g = GASES[state.gas];
    plot.axes({ xLabel: 'T (K)', yLabel: 'Cv/R' });
    for (const [y, name] of [[1.5, '3/2'], [2.5, '5/2'], [3.5, '7/2']]) {
      plot.fn(() => y, { color: c.grid, dash: [6, 5], width: 1.5 });
      plot.text(name, 2850, y + 0.12, { size: 11, patch: false });
    }
    plot.fn((T) => cv(g, T), { color: c.a, domain: [5, 3000] });
    plot.segment(300, 0, 300, 4, { color: c.b, width: 2, dash: [4, 4] });
    plot.point(state.T, cv(g, state.T), { fill: c.a });
    plot.text('room', 300, 3.75, { size: 11, color: c.b });
  },
  controls: [
    { title: 'Warm a diatomic gas' },
    { key: 'gas', label: 'Gas', options: Object.entries(GASES).map(([k, g]) => [k, g.name]) },
    { key: 'T', label: 'Temperature (K)', min: 20, max: 3000, step: 20 },
    { readout: [
      ['Translation', () => '1.50 R'],
      ['Rotation', (s) => `${fixed(rot(GASES[s.gas], s.T), 2)} R`],
      ['Vibration', (s) => `${fixed(vib(GASES[s.gas], s.T), 2)} R`],
      ['Cv in total', (s) => `${fixed(cv(GASES[s.gas], s.T), 2)} R`],
    ] },
  ],
  tex: (s) => `\\dfrac{C_v}{R}=\\dfrac32+${fixed(rot(GASES[s.gas], s.T), 2)}+${fixed(vib(GASES[s.gas], s.T), 2)}=${fixed(cv(GASES[s.gas], s.T), 2)}`,
});
