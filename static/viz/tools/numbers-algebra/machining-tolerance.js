import { createTool } from '../../lib/tool.js';
import { numberLine } from '../../lib/numline.js';
import { dot, label } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { PARTS, within } from './_inequalities-math.js';

const state = { nominal: 5, tol: 0.02 };
const R = 0.06;
const say = (n) => fixed(n, 3);

createTool({
  state,
  label: 'A magnified number line around the target length. The green band is every length the drawing allows, from the target minus the tolerance to the target plus the tolerance. Ten measured parts sit on the line as dots: green if they are inside the band, coral if they fall outside and are rejected.',
  draw(ctx, stage, c) {
    const nl = numberLine(ctx, stage, c, { lo: state.nominal - R, hi: state.nominal + R, y: stage.h * 0.62, step: 0.02 });
    nl.axis();
    nl.span(state.nominal - state.tol, state.nominal + state.tol, { color: c.c, width: 14 });
    nl.text(`${say(state.nominal - state.tol)}`, state.nominal - state.tol, 40, { size: 10 });
    nl.text(`${say(state.nominal + state.tol)}`, state.nominal + state.tol, 40, { size: 10 });
    nl.text(`target ${say(state.nominal)}`, state.nominal, -64, { size: 11, color: c.ink });
    PARTS.forEach((x, i) => {
      if (x < state.nominal - R || x > state.nominal + R) return;
      const ok = within(x, state.nominal, state.tol);
      dot(ctx, nl.px(x), nl.y - 22 - (i % 3) * 16, 7, ok ? c.c : c.a, c.ink);
    });
    const good = PARTS.filter((x) => within(x, state.nominal, state.tol)).length;
    label(ctx, `${good} of ${PARTS.length} parts accepted`, stage.w / 2, 18, c, { size: 13, color: c.ink, bounds: stage });
  },
  controls: [
    { title: 'Set the tolerance' },
    { key: 'nominal', label: 'Target length', min: 4.95, max: 5.05, step: 0.005, format: (n) => `${fixed(n, 3)} cm` },
    { key: 'tol', label: 'Tolerance, ±', min: 0.005, max: 0.04, step: 0.005, format: (n) => `${fixed(n, 3)} cm` },
    { readout: [
      ['Written as', (s) => `${fixed(s.nominal, 2)} ± ${fixed(s.tol, 3)} cm`],
      ['Accepted', (s) => `${PARTS.filter((x) => within(x, s.nominal, s.tol)).length} of ${PARTS.length}`],
      ['Rejected', (s) => ({ text: PARTS.filter((x) => !within(x, s.nominal, s.tol)).map((x) => fixed(x, 3)).join(', ') || 'none', good: PARTS.every((x) => within(x, s.nominal, s.tol)) })],
    ] },
  ],
  tex: (s) => `|x-${fixed(s.nominal, 3)}|\\le ${fixed(s.tol, 3)}\\iff ${fixed(s.nominal - s.tol, 3)}\\le x\\le ${fixed(s.nominal + s.tol, 3)}`,
});
