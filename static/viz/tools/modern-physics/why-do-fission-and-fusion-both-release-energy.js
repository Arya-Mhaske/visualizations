import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed, sig } from '../../lib/format.js';
import { BA, baAt, U_KG } from './_nucleus.js';

// Fission: one nucleus A splits into two of A/2. Fusion: two nuclei A join to make 2A.
// Energy released = (B/A of the products − B/A of the start) × the nucleons involved.
const state = { mode: 'fission', A: 236 };
const COAL = 3.0e7; // J per kg
const MEV_J = 1.602e-13;
const split = (s) => (s.mode === 'fission' ? { from: s.A, to: s.A / 2, nucleons: s.A, fuel: s.A } : { from: s.A, to: 2 * s.A, nucleons: 2 * s.A, fuel: 2 * s.A });
const release = (s) => { const p = split(s); return p.nucleons * (baAt(p.to) - baAt(p.from)); };
const perKg = (s) => (release(s) * MEV_J) / (split(s).fuel * U_KG);

const tool = createTool({
  state,
  label: 'A graph of binding energy per nucleon against mass number. The curve climbs steeply, peaks near iron at 56, and falls slowly. A coral dot marks the starting nucleus and a green dot the products. A dashed arrow joins them: moving up the curve releases energy.',
  setup: (stage, c) => createPlot(stage, { x: [0, 250], y: [0, 10], c, pad: 28 }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'A', yLabel: 'B/A (MeV)' });
    plot.fn(baAt, { color: c.b, domain: [1, 238] });
    for (const [A, v] of BA) plot.point(A, v, { fill: c.b, r: 3 });
    const p = split(state);
    plot.segment(p.from, baAt(p.from), p.to, baAt(p.to), { color: c.ink, width: 2, dash: [6, 5] });
    plot.point(p.from, baAt(p.from), { fill: c.a, r: 7 });
    plot.point(p.to, baAt(p.to), { fill: c.c, r: 7 });
    plot.text('Fe', 56, 9.5, { size: 11 });
  },
  controls: () => [
    { title: 'Move along the curve' },
    { key: 'mode', label: 'Process', options: [['fission', 'fission (split)'], ['fusion', 'fusion (join)']] },
    { key: 'A', label: 'Starting nucleus A', min: 2, max: 238, step: 1 },
    { readout: [
      ['Start B/A', (s) => `${fixed(baAt(split(s).from), 2)} MeV`],
      ['Products B/A', (s) => `${fixed(baAt(split(s).to), 2)} MeV`],
      ['Energy released', (s) => ({ text: `${sig(release(s), 3)} MeV`, good: release(s) > 0 })],
      ['Per kg of fuel', (s) => `${sig(perKg(s), 2)} J`],
      ['Coal, per kg', () => `${sig(COAL, 1)} J`],
    ] },
  ],
  tex: (s) => `Q=\\left(\\dfrac{B}{A}\\right)_{\\text{after}}\\!\\!\\cdot A_{\\text{after}}-\\left(\\dfrac{B}{A}\\right)_{\\text{before}}\\!\\!\\cdot A_{\\text{before}}=${sig(release(s), 3)}\\ \\text{MeV}`,
});

tool.update();
