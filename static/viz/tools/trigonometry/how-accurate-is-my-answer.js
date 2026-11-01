import { createTool } from '../../lib/tool.js';
import { label, poly } from '../../lib/draw.js';
import { fixed, sig } from '../../lib/format.js';
import { PRECISION, angleSpread, roundingSpread, sinD } from './_right-triangle-math.js';

const state = { prec: 'deg', A: 35, c: 50 };
const P = (s = state) => PRECISION.find((p) => p.id === s.prec);
const side = (s = state) => s.c * sinD(s.A);
const pct = (x) => (x < 0.0001 ? sig(x * 100, 2) : fixed(x * 100, x < 0.01 ? 3 : 2));

createTool({
  state,
  label: 'Four rows, one for each way of measuring an angle: to the nearest degree, 10 minutes, 1 minute or 10 seconds. Each row has two bars on a log scale: how much a side computed from that angle can be wrong, and how much a number with the matching count of significant figures can be wrong. The two bars are about the same length in every row.',
  draw(ctx, stage, c) {
    const left = stage.w * 0.27;
    const span = stage.w - left - 10;
    const rowH = stage.h / 5.6;
    const x = (frac) => left + span * (Math.log10(Math.max(frac, 1e-7)) + 7) / 7; // 1e-7 … 1 on a log axis
    label(ctx, 'worst error, as a share of the side (log scale)', 8, rowH * 0.45, c, { size: 10, align: 'left', bounds: stage, patch: false });
    PRECISION.forEach((p, i) => {
      const y = rowH * (i + 1.1);
      const picked = p.id === state.prec;
      poly(ctx, [[2, y - 6], [stage.w - 2, y - 6], [stage.w - 2, y + rowH - 6], [2, y + rowH - 6]], { fill: picked ? c.fillY : c.paper, stroke: c.ink, width: picked ? 3 : 1 });
      label(ctx, p.text, 8, y + 8, c, { size: 10, align: 'left', bounds: stage, patch: false });
      label(ctx, `${p.sf} figures`, 8, y + 24, c, { size: 10, align: 'left', bounds: stage, patch: false });
      const fromAngle = angleSpread(state.A, p.half);
      const fromDigits = roundingSpread(side(), p.sf);
      poly(ctx, [[left, y], [x(fromAngle), y], [x(fromAngle), y + 10], [left, y + 10]], { fill: c.fillA, stroke: c.ink, width: 2 });
      poly(ctx, [[left, y + 13], [x(fromDigits), y + 13], [x(fromDigits), y + 23], [left, y + 23]], { fill: c.fillB, stroke: c.ink, width: 2 });
    });
    label(ctx, 'coral: from the angle    blue: from the figures', stage.w / 2, stage.h - 10, c, { size: 10, bounds: stage, patch: false });
  },
  controls: [
    { title: 'How was the angle measured?' },
    { key: 'prec', label: 'Angle given to', options: PRECISION.map((p) => [p.id, p.text]) },
    { key: 'A', label: 'Angle, A', min: 10, max: 80, step: 5, format: (n) => `${n}°` },
    { key: 'c', label: 'Hypotenuse, c', min: 10, max: 100, step: 10 },
    { readout: [
      ['Side a = c sin A', (s) => fixed(side(s), 4)],
      ['Angle could be off by', (s) => `± ${pct(angleSpread(s.A, P(s).half))}%`],
      ['So quote a to', (s) => `${P(s).sf} figures: ${sig(side(s), P(s).sf)}`],
      ['Those figures are off by', (s) => `± ${pct(roundingSpread(side(s), P(s).sf))}%`],
    ] },
  ],
  tex: (s) => `a=${s.c}\\sin ${s.A}^\\circ\\approx ${sig(side(s), P(s).sf)}\\quad(${P(s).sf}\\text{ significant figures})`,
});
