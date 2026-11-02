import { createTool } from '../../lib/tool.js';
import { createTimeline } from '../../lib/timeline.js';
import { transport } from '../../lib/sim.js';
import { arrow, label, line } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';

// A plane wave along +x: E = E₀ sin(kx − ωt) along y, B = B₀ sin(kx − ωt) along z. E × B points along the way it travels.
// Drawn in oblique projection: x to the right, y up, z toward the viewer and down-left.
const CYCLE = 4;
const state = { t: 0.5, lam: 3, showE: true, showB: true };
const line2 = createTimeline(document.querySelector('#stage'), state, { cycle: () => CYCLE, update: () => tool.update() });
const phase = (s, x) => 2 * Math.PI * (x / s.lam - s.t / CYCLE);

const tool = createTool({
  state,
  label: 'A plane wave in a three-dimensional picture. A line shows the direction of travel to the right. Blue arrows pointing up and down along the line are the electric field, and green arrows pointing toward and away from the viewer are the magnetic field. They rise and fall together and are at right angles to each other and to the direction of travel.',
  draw(ctx, stage, c) {
    const ox = 20;
    const oy = stage.h * 0.55;
    const len = stage.w - 40;
    const amp = stage.h * 0.28;
    const X = (x) => ox + (x / 8) * len;
    line(ctx, ox, oy, ox + len, oy, { color: c.ink, width: 3 });
    arrow(ctx, ox + len - 40, oy, ox + len, oy, { color: c.ink, width: 3, head: 10 });
    label(ctx, 'direction of travel', ox + len - 70, oy + 20, c, { size: 10, bounds: stage, patch: false });
    // depth axis: z toward viewer is (-0.5, +0.35) per unit
    const zx = -0.5;
    const zy = 0.35;
    for (let i = 0; i <= 64; i++) {
      const x = (8 * i) / 64;
      const s = Math.sin(phase(state, x));
      if (i % 2 === 0 || true) {
        if (state.showE && i % 2 === 0) arrow(ctx, X(x), oy, X(x), oy - amp * s, { color: c.b, width: 2, head: 5 });
        if (state.showB && i % 2 === 0) arrow(ctx, X(x), oy, X(x) + zx * amp * s, oy + zy * amp * s, { color: c.c, width: 2, head: 5 });
      }
    }
    label(ctx, 'E (up and down)', ox + 60, stage.h * 0.1, c, { size: 11, color: c.b, bounds: stage, patch: false });
    label(ctx, 'B (toward and away)', ox + 80, stage.h * 0.9, c, { size: 11, color: c.c, bounds: stage, patch: false });
  },
  controls: () => [
    { title: 'Watch the wave go by' },
    { key: 't', label: 'Time', min: 0, max: CYCLE, step: 0.01, format: (v) => `${fixed(v, 2)} s` },
    transport(line2.clock),
    { key: 'lam', label: 'Wavelength', min: 1.5, max: 6, step: 0.5, format: (v) => fixed(v, 1) },
    { key: 'showE', label: 'Show E', toggle: true },
    { key: 'showB', label: 'Show B', toggle: true },
    { readout: [
      ['E at x = 0', (s) => fixed(Math.sin(phase(s, 0)), 3)],
      ['B at x = 0', (s) => fixed(Math.sin(phase(s, 0)), 3)],
      ['E × B points', () => 'along the travel'],
    ] },
  ],
  onChange: () => line2.sync(),
  tex: () => 'E_y=E_0\\sin(kx-\\omega t),\\ B_z=B_0\\sin(kx-\\omega t),\\ \\ \\vec E\\times\\vec B\\parallel\\hat x',
});
line2.sync();
tool.update();
