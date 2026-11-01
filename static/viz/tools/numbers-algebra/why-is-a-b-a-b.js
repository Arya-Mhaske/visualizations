import { createTool } from '../../lib/tool.js';
import { numberLine } from '../../lib/numline.js';
import { label, line, poly } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { triangle } from './_inequalities-math.js';

const state = { a: 3, b: -2 };
const R = 10;
const say = (n) => fixed(n, 1);

createTool({
  state,
  label: 'A number line. The arrow for a starts at zero. The arrow for b starts where a ends. Where you finish is a plus b, and its distance from zero is the absolute value of a plus b. Underneath, a bar shows the absolute values of a and b laid end to end, which is the longest the journey could have been. The journey is shorter when the arrows point opposite ways.',
  draw(ctx, stage, c) {
    const nl = numberLine(ctx, stage, c, { lo: -R, hi: R, y: stage.h * 0.4, step: 2 });
    nl.axis();
    nl.arrow(0, state.a, { color: c.a, dy: -26 });
    nl.arrow(state.a, state.a + state.b, { color: c.b, dy: -46 });
    nl.span(0, state.a + state.b, { color: c.c, width: 6, dy: 0 });
    nl.text('a', state.a / 2, -34, { color: c.a, size: 12 });
    nl.text('b', state.a + state.b / 2, -54, { color: c.b, size: 12 });
    nl.text('a + b', state.a + state.b, 38, { color: c.c });
    const t = triangle(state.a, state.b);
    const k = (stage.w - 44) / (R * 2);
    const x0 = 22;
    const y = stage.h * 0.72;
    const bar = (len, y0, fill, name, from = 0) => {
      poly(ctx, [[x0 + from * k, y0], [x0 + (from + len) * k, y0], [x0 + (from + len) * k, y0 + 18], [x0 + from * k, y0 + 18]], { fill, stroke: c.ink, width: 2 });
      if (name) label(ctx, name, x0 + (from + len / 2) * k, y0 + 9, c, { size: 10, bounds: stage, patch: false });
    };
    bar(Math.abs(state.a), y, c.fillA, '|a|');
    bar(Math.abs(state.b), y, c.fillB, '|b|', Math.abs(state.a));
    bar(t.sum, y + 30, c.fillC, '|a + b|');
    label(ctx, t.equal ? 'equal: the arrows point the same way' : 'shorter: part of the journey cancelled', stage.w / 2, stage.h * 0.94, c, { size: 11, color: t.equal ? c.c : c.a, bounds: stage });
    line(ctx, x0 + t.parts * k, y - 6, x0 + t.parts * k, y + 52, { color: c.ink, width: 2, dash: [4, 4] });
  },
  controls: [
    { title: 'Two journeys' },
    { key: 'a', label: 'a', min: -6, max: 6, step: 0.5, format: say },
    { key: 'b', label: 'b', min: -6, max: 6, step: 0.5, format: say },
    { readout: [
      ['|a + b|', (s) => say(triangle(s.a, s.b).sum)],
      ['|a| + |b|', (s) => say(triangle(s.a, s.b).parts)],
      ['Gap', (s) => ({ text: say(triangle(s.a, s.b).parts - triangle(s.a, s.b).sum), good: triangle(s.a, s.b).equal })],
    ] },
  ],
  tex: (s) => `|${say(s.a)}+(${say(s.b)})|=${say(triangle(s.a, s.b).sum)}\\ \\le\\ ${say(Math.abs(s.a))}+${say(Math.abs(s.b))}=${say(triangle(s.a, s.b).parts)}`,
});
