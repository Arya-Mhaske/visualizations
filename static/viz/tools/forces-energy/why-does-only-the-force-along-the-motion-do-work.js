import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';

const state = { F: 50, d: 4, phi: 30 };
const rad = (d) => (d * Math.PI) / 180;
const W = (s, phi = s.phi) => s.F * s.d * Math.cos(rad(phi));

createTool({
  state,
  label: 'A graph of the work done by a pull against the angle of the pull to the motion: a cosine curve that is greatest along the motion and zero at a right angle.',
  setup: (stage, c) => createPlot(stage, { x: [0, 180], y: [-250, 250], c }),
  draw(ctx, stage, c, plot) {
    plot.setRange([0, 180], [-state.F * state.d * 1.1, state.F * state.d * 1.1]);
    plot.axes({ xLabel: 'angle φ (°)', yLabel: 'W (J)' });
    plot.fn((phi) => W(state, phi), { color: c.b });
    plot.point(state.phi, W(state), { fill: c.a });
  },
  controls: [
    { title: 'Pull the box' },
    { key: 'F', label: 'Force F (N)', min: 10, max: 100, step: 5 },
    { key: 'd', label: 'Distance d (m)', min: 1, max: 10, step: 1 },
    { key: 'phi', label: 'Angle φ (°)', min: 0, max: 180, step: 5 },
    { readout: [
      ['Along the motion F cos φ', (s) => `${fixed(s.F * Math.cos(rad(s.phi)), 1)} N`],
      ['Across it F sin φ', (s) => `${fixed(s.F * Math.sin(rad(s.phi)), 1)} N (no work)`],
      ['Work W', (s) => `${fixed(W(s), 1)} J`],
    ] },
  ],
  tex: (s) => `W=Fd\\cos\\varphi=${s.F}\\times${s.d}\\times\\cos${s.phi}^\\circ=${fixed(W(s), 1)}\\ \\mathrm{J}`,
});
