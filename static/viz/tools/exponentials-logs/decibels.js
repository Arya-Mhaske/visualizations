import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { sci, fixed } from '../../lib/format.js';

const I0 = 1e-12; // W/m², the threshold of hearing
const state = { l1: 60, d: 10 };
const intensity = (db) => I0 * 10 ** (db / 10);
// Rough everyday levels, for orientation only.
const SOUNDS = [['whisper', 30], ['talk', 60], ['traffic', 80], ['concert', 110], ['jet', 130]];

createTool({
  state,
  label: 'A ruler of sound levels in decibels from 0 to 140 with everyday sounds marked. Two markers show a starting level and the level after you add some decibels. A curve above shows how many times the sound intensity multiplies: ten decibels is ten times the intensity.',
  setup: (stage, c) => createPlot(stage, { x: [0, 140], y: [0, 1], c }),
  draw(ctx, stage, c, plot) {
    const a = state.l1;
    const b = Math.min(140, state.l1 + state.d);
    plot.setRange([0, 140], [-0.55, 1.2]);
    plot.segment(0, 0, 140, 0, { color: c.ink, width: 4 });
    for (let v = 0; v <= 140; v += 10) {
      plot.segment(v, 0, v, -0.08, { color: c.ink, width: 2 });
      plot.text(`${v}`, v, -0.2, { size: 10, patch: false });
    }
    plot.text('dB', 136, -0.4, { size: 11, patch: false });
    SOUNDS.forEach(([name, db], i) => {
      plot.segment(db, 0, db, 0.12 + (i % 2) * 0.12, { color: c.c, width: 3 });
      plot.text(name, db, 0.3 + (i % 2) * 0.12, { size: 9, color: c.c, patch: false });
    });
    plot.shade(() => 0.08, null, a, b, c.fillY);
    plot.segment(a, 0, a, 0.9, { color: c.b, width: 3 });
    plot.segment(b, 0, b, 0.9, { color: c.a, width: 3 });
    plot.point(a, 0.9, { fill: c.b, r: 8 });
    plot.point(b, 0.9, { fill: c.a, r: 8 });
    plot.text(`×${sci(10 ** ((b - a) / 10), 3)}`, (a + b) / 2, 1.1, { size: 12 });
  },
  controls: [
    { title: 'Add decibels' },
    { key: 'l1', label: 'Starting level', min: 0, max: 130, step: 1, format: (v) => `${v} dB` },
    { key: 'd', label: 'Add', min: 0, max: 40, step: 1, format: (v) => `${v} dB` },
    { readout: [
      ['Intensity before', (s) => `${sci(intensity(s.l1), 2)} W/m²`],
      ['Intensity after', (s) => `${sci(intensity(Math.min(140, s.l1 + s.d)), 2)} W/m²`],
      ['Intensity is', (s) => `×${fixed(10 ** (Math.min(140 - s.l1, s.d) / 10), 2)}`],
    ] },
  ],
  tex: (s) => `L=10\\log_{10}\\dfrac{I}{I_0}\\ :\\ \\ +${Math.min(140 - s.l1, s.d)}\\text{ dB}\\Rightarrow I\\times10^{${fixed(Math.min(140 - s.l1, s.d) / 10, 1)}}=\\times${fixed(10 ** (Math.min(140 - s.l1, s.d) / 10), 2)}`,
});
