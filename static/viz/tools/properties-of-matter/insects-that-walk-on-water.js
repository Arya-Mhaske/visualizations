import { createTool } from '../../lib/tool.js';
import { line, arrow, dot, poly, label } from '../../lib/draw.js';
import { sig } from '../../lib/format.js';
import { S_WATER, S_FLOOR, maxSupport, weight } from './_surface-tension-math.js';

const state = { m: 20, l: 4, soap: false };
const LEGS = 6;
const S = (s) => (s.soap ? S_FLOOR : S_WATER);
const cap = (s) => maxSupport(S(s), LEGS, s.l / 1000);
const W = (s) => weight(s.m);
const ok = (s) => W(s) <= cap(s);

createTool({
  state,
  label: 'An insect standing on the surface of water, with small dents under its legs. Arrows show its weight and the upward pull of the surface. If the weight is too big, the insect sinks.',
  draw(ctx, stage, c) {
    const lvl = stage.h * 0.62;
    const use = Math.min(1, W(state) / cap(state));
    const sink = ok(state) ? 0 : 36;
    poly(ctx, [[0, lvl], [stage.w, lvl], [stage.w, stage.h], [0, stage.h]], { fill: c.fillB, stroke: c.ink });
    const y = lvl - 46 + sink;
    const cx = stage.w / 2;
    for (let i = -1; i <= 1; i++) {
      const lx = cx + i * 46;
      line(ctx, cx + i * 14, y, lx, lvl + 4 * use + sink * 0.5, { color: c.ink, width: 3 });
      poly(ctx, [[lx - 14, lvl], [lx, lvl + 6 + 8 * use], [lx + 14, lvl]], { stroke: c.ink, closed: false, width: 2 });
    }
    dot(ctx, cx, y, 18, c.d, c.ink);
    arrow(ctx, cx, y - 8, cx, y + 34, { color: c.a, width: 3 });
    arrow(ctx, cx + 70, lvl + 24, cx + 70, lvl - 20, { color: c.c, width: 3 });
    label(ctx, `weight ${sig(W(state) * 1e3, 2)} mN`, cx - 70, y - 28, c, { size: 11, bounds: stage, patch: false });
    label(ctx, `pull ≤ ${sig(cap(state) * 1e3, 2)} mN`, cx + 70, lvl + 40, c, { size: 11, bounds: stage, patch: false });
    label(ctx, ok(state) ? 'floats' : 'sinks', cx, 20, c, { size: 15, bounds: stage, patch: false });
  },
  controls: [
    { title: 'Insect and water' },
    { key: 'm', label: 'Mass (mg)', min: 5, max: 400, step: 5 },
    { key: 'l', label: 'Leg contact length (mm)', min: 1, max: 8, step: 1 },
    { key: 'soap', label: 'Add detergent', toggle: true },
    { readout: [
      ['Weight mg', (s) => `${sig(W(s) * 1e3, 3)} mN`],
      ['Surface can hold', (s) => `${sig(cap(s) * 1e3, 3)} mN`],
      ['Floats?', (s) => ({ text: ok(s) ? 'yes' : 'no', good: ok(s) })],
    ] },
  ],
  tex: (s) => `mg\\le 2SnL=2\\times${S(s)}\\times${LEGS}\\times${s.l / 1000}=${sig(cap(s), 3)}\\ \\mathrm{N}`,
});
