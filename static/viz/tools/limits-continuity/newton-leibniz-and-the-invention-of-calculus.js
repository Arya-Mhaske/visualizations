import { createTool } from '../../lib/tool.js';
import { dot, label, line } from '../../lib/draw.js';

// Dates are the commonly given ones; "c." marks approximate years. Each event belongs to a lane.
const EVENTS = [
  { y: 1665, who: 'N', text: 'Newton works out his "method of fluxions" in the plague years (c. 1665–66).' },
  { y: 1675, who: 'L', text: 'Leibniz works out his calculus and first writes the integral sign ∫ (c. 1675).' },
  { y: 1684, who: 'L', text: 'Leibniz publishes the first paper on the differential calculus, with the notation dy/dx.' },
  { y: 1686, who: 'L', text: 'Leibniz publishes the first paper on integrals, with the ∫ notation.' },
  { y: 1687, who: 'N', text: 'Newton\'s Principia is published. It uses the ideas, but argues in geometry.' },
  { y: 1704, who: 'N', text: 'Newton publishes a full account of his fluxions in an appendix to his Opticks.' },
  { y: 1712, who: 'B', text: 'The Royal Society\'s committee reports on the dispute over who came first (c. 1711–12).' },
  { y: 1716, who: 'L', text: 'Leibniz dies.' },
  { y: 1727, who: 'N', text: 'Newton dies.' },
];
const state = { year: 1690 };
const lane = { N: 0, L: 1, B: 0.5 };
const known = (s = state) => EVENTS.filter((e) => e.y <= s.year);
const latest = (s = state) => known(s).at(-1);

createTool({
  state,
  label: 'A timeline from 1660 to 1730 with two lanes, Newton above and Leibniz below. Move the year slider to reveal events as they happened. Beneath, a short note compares the two notations: Newton\'s dot for a rate of change in time, and Leibniz\'s d over d notation and integral sign, which are the ones most often used in mathematics today.',
  draw(ctx, stage, c) {
    const [x0, x1] = [26, stage.w - 26];
    const at = (y) => x0 + ((y - 1660) / 70) * (x1 - x0);
    const mid = stage.h * 0.38;
    line(ctx, x0, mid, x1, mid, { color: c.ink, width: 3 });
    for (let y = 1660; y <= 1730; y += 10) {
      line(ctx, at(y), mid - 6, at(y), mid + 6, { color: c.ink, width: 2 });
      label(ctx, `${y}`, at(y), mid + 22, c, { size: 10, bounds: stage, patch: false });
    }
    label(ctx, 'Newton', 8, mid - 40, c, { size: 11, align: 'left', color: c.a, bounds: stage, patch: false });
    label(ctx, 'Leibniz', 8, mid + 52, c, { size: 11, align: 'left', color: c.b, bounds: stage, patch: false });
    line(ctx, at(state.year), mid - 60, at(state.year), mid + 60, { color: c.d, width: 3 });
    EVENTS.forEach((e) => {
      const shown = e.y <= state.year;
      const dy = e.who === 'B' ? 0 : e.who === 'N' ? -30 : 38;
      dot(ctx, at(e.y), mid + dy, shown ? 7 : 4, shown ? (e.who === 'N' ? c.a : e.who === 'L' ? c.b : c.fillY) : c.paper, c.ink);
    });
    const e = latest();
    label(ctx, e ? `${e.y}` : 'before 1665', stage.w / 2, stage.h * 0.66, c, { size: 14, bounds: stage });
    label(ctx, 'Newton: ṡ  (a dot for a rate in time)', stage.w / 2, stage.h * 0.82, c, { size: 11, color: c.a, bounds: stage, patch: false });
    label(ctx, 'Leibniz: ds/dt  and  ∫ s dt', stage.w / 2, stage.h * 0.9, c, { size: 11, color: c.b, bounds: stage, patch: false });
  },
  controls: [
    { title: 'Move through time' },
    { key: 'year', label: 'Year', min: 1660, max: 1730, step: 1 },
    { readout: [
      ['Latest event', (s) => (latest(s) ? latest(s).text : 'nothing yet')],
      ['Events so far', (s) => `${known(s).length} of ${EVENTS.length}`],
    ] },
  ],
  tex: (s) => `\\text{Newton: }\\dot s\\qquad \\text{Leibniz: }\\dfrac{ds}{dt},\\ \\int s\\,dt`,
});
