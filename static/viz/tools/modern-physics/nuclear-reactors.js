import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed, sig } from '../../lib/format.js';

// Each fission frees about 2.5 neutrons. The multiplication factor k is how many of them cause the NEXT fission.
// Fast neutrons rarely split U-235, so a moderator slows them. Control rods soak neutrons up. Values are illustrative.
const MODERATORS = { none: ['no moderator', 0.55], graphite: ['graphite', 1.25], heavy: ['heavy water', 1.35] };
const state = { mod: 'graphite', rods: 33 };
const kOf = (s) => MODERATORS[s.mod][1] * (1 - 0.6 * (s.rods / 100));
const verdict = (k) => (Math.abs(k - 1) < 0.02 ? 'critical: steady power' : k > 1 ? 'supercritical: power rising' : 'subcritical: dying out');

const tool = createTool({
  state,
  label: 'A graph of the number of fissions in each generation of neutrons, on a scale of powers of ten. A straight coral line rises when the multiplication factor is above one, stays flat when it is exactly one, and falls when below one.',
  setup: (stage, c) => createPlot(stage, { x: [0, 20], y: [-3, 6], c, pad: 28 }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'generation', yLabel: 'log₁₀ (fissions)' });
    plot.segment(0, 0, 20, 0, { color: c.ink, width: 2, dash: [5, 4] });
    const k = kOf(state);
    plot.fn((g) => g * Math.log10(k), { color: Math.abs(k - 1) < 0.02 ? c.c : k > 1 ? c.a : c.b });
    plot.point(20, 20 * Math.log10(k), { fill: c.a, r: 6 });
    plot.text('k = 1', 19.5, 0.35, { align: 'right', size: 10 });
  },
  controls: () => [
    { title: 'Run a reactor' },
    { key: 'mod', label: 'Moderator', options: Object.entries(MODERATORS).map(([key, v]) => [key, v[0]]) },
    { key: 'rods', label: 'Control rods pushed in', min: 0, max: 100, step: 1, format: (v) => `${v}%` },
    { readout: [
      ['Multiplication factor k', (s) => fixed(kOf(s), 2)],
      ['Fissions after 10 generations', (s) => sig(kOf(s) ** 10, 3)],
      ['State', (s) => ({ text: verdict(kOf(s)), good: Math.abs(kOf(s) - 1) < 0.02 })],
    ] },
  ],
  tex: (s) => `N_g=N_0\\,k^{g}:\\quad k=${fixed(kOf(s), 2)}\\Rightarrow N_{10}=${sig(kOf(s) ** 10, 3)}\\,N_0`,
});

tool.update();
