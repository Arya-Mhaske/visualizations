import { createTool } from '../../lib/tool.js';
import { createBench } from '../../lib/rays.js';
import { arrow, dot, label, line } from '../../lib/draw.js';
import { fixed, sig } from '../../lib/format.js';
import { MU0, loopPieces, sumField } from './_sources-of-magnetic-field-math.js';

// Centimetres on the stage, metres in the maths. The solenoid lies along x; the page shows its cross-section.
const state = { N: 30, L: 20, R: 3, I: 2 };
const m = (cm) => cm / 100;
const nPerM = (s = state) => s.N / m(s.L);
const ideal = (s = state) => MU0 * nPerM(s) * s.I;
const rings = (s = state) => Array.from({ length: s.N }, (_, k) => loopPieces(m(s.R), 28, m(-s.L / 2 + ((k + 0.5) * s.L) / s.N))).flat();
const probeAt = (s, pieces, x, y) => sumField(s.I, pieces, [m(x), m(y), 0]);
const milli = (t) => `${sig(t * 1e3, 3)} mT`;

// The grid of probes: five rows through and beside the coil, columns spread past both ends.
let memo = { key: '', list: [] };
function probes(s) {
  const key = `${s.N},${s.L},${s.R},${s.I}`;
  if (memo.key === key) return memo.list;
  const cols = 17;
  const rows = [-1.7, -0.5, 0, 0.5, 1.7];
  const pieces = rings(s);
  const out = [];
  for (let i = 0; i < cols; i++) {
    const x = -s.L / 2 - 4 + ((s.L + 8) * i) / (cols - 1);
    for (const f of rows) {
      const y = f * s.R;
      const b = probeAt(s, pieces, x, y);
      out.push({ x, y, f, bx: b[0], by: b[1], size: Math.hypot(b[0], b[1]) });
    }
  }
  memo = { key, list: out };
  return out;
}

function stats(s) {
  const list = probes(s);
  const core = list.filter((p) => Math.abs(p.x) <= s.L / 4 && Math.abs(p.f) <= 0.5).map((p) => p.size);
  const mean = core.reduce((a, b) => a + b, 0) / core.length;
  const centre = list.find((p) => p.f === 0 && Math.abs(p.x) < s.L / 16)?.size ?? mean;
  const outside = list.filter((p) => Math.abs(p.f) === 1.7 && Math.abs(p.x) <= s.L / 4).map((p) => p.size);
  const spread = (Math.max(...core) - Math.min(...core)) / mean;
  return { mean, centre, spread, outside: outside.reduce((a, b) => a + b, 0) / outside.length };
}

const tool = createTool({
  state,
  label: 'A solenoid seen in cross-section: a row of wire ends along the top, current out of the page, and a row along the bottom, current into the page. Small arrows on a grid show the magnetic field, long and parallel inside the coil and tiny outside it.',
  setup: (stage, c) => createBench(stage, { x: [-15, 15], cy: 0.5, c }),
  draw(ctx, stage, c, bench) {
    const reach = state.L / 2 + 5;
    bench.setRange([-reach, reach]);
    const [x0, y0] = bench.toPx(0, 0);
    const unit = bench.toPx(1, 0)[0] - x0;
    line(ctx, ...bench.toPx(-state.L / 2, 0), ...bench.toPx(state.L / 2, 0), { color: c.grid, width: 2, dash: [8, 4] });
    const gap = (state.L * unit) / state.N;
    const r = Math.max(2, Math.min(5, gap * 0.4));
    for (let k = 0; k < state.N; k++) {
      const x = -state.L / 2 + ((k + 0.5) * state.L) / state.N;
      const [top, bottom] = [bench.toPx(x, state.R), bench.toPx(x, -state.R)];
      dot(ctx, ...top, r, c.fillA, c.ink, 2);
      dot(ctx, ...bottom, r, c.fillB, c.ink, 2);
    }
    const ref = ideal();
    for (const p of probes(state)) {
      const [px, py] = bench.toPx(p.x, p.y);
      const len = Math.min(34, (p.size / ref) * 16);
      if (len < 2) { dot(ctx, px, py, 2, c.ink); continue; }
      const [ux, uy] = [p.bx / p.size, -p.by / p.size];
      arrow(ctx, px - ux * len / 2, py - uy * len / 2, px + ux * len / 2, py + uy * len / 2, { color: Math.abs(p.f) < 1 ? c.c : c.d, width: 2.5, head: 8 });
    }
    label(ctx, 'Coral ends: out of the page. Blue ends: into it.', 6, 12, c, { size: 11, align: 'left', bounds: stage, patch: false });
    label(ctx, 'Arrow length shows field strength.', 6, stage.h - 12, c, { size: 11, align: 'left', bounds: stage, patch: false });
  },
  controls: () => [
    { title: 'Stack the loops' },
    { key: 'N', label: 'Number of turns, N', min: 1, max: 40, format: (n) => `${n}` },
    { key: 'L', label: 'Length, L', min: 6, max: 30, step: 1, format: (n) => `${n} cm` },
    { key: 'R', label: 'Radius, R', min: 1, max: 4, step: 0.5, format: (n) => `${fixed(n, 1)} cm` },
    { key: 'I', label: 'Current, I', min: 0.5, max: 5, step: 0.5, format: (n) => `${fixed(n, 1)} A` },
    { readout: [
      ['Turns per metre, n', (s) => `${fixed(nPerM(s), 0)} /m`],
      ['Field at the centre', (s) => milli(stats(s).centre)],
      ['μ₀ n I', (s) => milli(ideal(s))],
      ['Inside varies by', (s) => ({ text: `${fixed(stats(s).spread * 100, 1)} %`, good: stats(s).spread < 0.05 })],
      ['Just outside', (s) => `${fixed((stats(s).outside / stats(s).mean) * 100, 1)} % of inside`],
    ] },
  ],
  tex: (s) => `B=\\mu_0 n I=(4\\pi\\times 10^{-7})(${fixed(nPerM(s), 0)})(${fixed(s.I, 1)})=${milli(ideal(s))}`,
});

tool.update();
