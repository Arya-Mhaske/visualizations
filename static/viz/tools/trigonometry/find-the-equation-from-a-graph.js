import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed, piFrac } from '../../lib/format.js';
import { TARGETS, TAU, gap, wave } from './_sine-cosine-math.js';

const state = { idx: 0, A: 1, B: 1, cn: 0, k: 0, reveal: false }; // C = cn × π/12
let tool;
const C = (s) => (s.cn * Math.PI) / 12;
const mine = (s = state) => wave(s.A, s.B, C(s), s.k);
const target = (s = state) => TARGETS[s.idx % TARGETS.length];
const goal = (s = state) => wave(target(s).A, target(s).B, target(s).C, target(s).k);
const miss = (s = state) => gap(mine(s), goal(s), -TAU, TAU);
const matched = (s = state) => miss(s) < 0.02;
const say = (x) => piFrac(x) ?? fixed(x, 2);
const sgn = (x) => (x < 0 ? '-' : '+');
const pi = (x) => say(x).replace('π', '\\pi ');
const eq = (A, B, Cc, k) => `y=${fixed(A, 1)}\\sin(${fixed(B, 1)}x${sgn(Cc)}${pi(Math.abs(Cc))})${sgn(k)}${fixed(Math.abs(k), 1)}`;

tool = createTool({
  state,
  label: 'A target wave drawn as a thick blue line, and your own wave in coral. Change A, B, C and k until your curve lies exactly on the target. The gap between the two curves is shown, and when it is nearly zero the equation of the target has been found.',
  setup: (stage, c) => createPlot(stage, { x: [-TAU, TAU], y: [-5, 5], c, ticks: 'pi' }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'x', yLabel: 'y' });
    plot.fn(goal(), { color: c.b, width: 8 });
    plot.fn(mine(), { color: matched() ? c.c : c.a, width: 3 });
    plot.text(matched() ? 'matched!' : 'not yet', -TAU + 1.2, 4.4, { size: 12, color: matched() ? c.c : c.a });
  },
  controls: [
    { title: 'Fit your wave to the target' },
    { row: [
      { button: 'New target', onClick() { state.idx += 1; state.reveal = false; tool.update(); } },
    ] },
    { key: 'A', label: 'Amplitude, A', min: -3, max: 3, step: 0.5, format: (n) => fixed(n, 1) },
    { key: 'B', label: 'B', min: 0.5, max: 4, step: 0.5, format: (n) => fixed(n, 1) },
    { key: 'cn', label: 'C, in steps of π/12', min: -12, max: 12, step: 1, format: (n) => say((n * Math.PI) / 12) },
    { key: 'k', label: 'Lift, k', min: -2, max: 2, step: 0.5, format: (n) => fixed(n, 1) },
    { key: 'reveal', label: 'Show the target’s equation', toggle: true },
    { readout: [
      ['Gap between curves', (s) => fixed(miss(s), 3)],
      ['Match?', (s) => ({ text: matched(s) ? 'yes' : 'no', good: matched(s) })],
      ['Target’s period', (s) => say((TAU) / target(s).B)],
      ['Target’s equation', (s) => (s.reveal ? `A=${fixed(target(s).A, 1)}, B=${fixed(target(s).B, 1)}, C=${say(target(s).C)}, k=${fixed(target(s).k, 1)}` : 'hidden')],
    ] },
  ],
  tex: (s) => eq(s.A, s.B, C(s), s.k),
  onChange(s) { if (s.A === 0) s.A = 0.5; },
});
