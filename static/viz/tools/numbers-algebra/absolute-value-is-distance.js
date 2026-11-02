import { createTool } from '../../lib/tool.js';
import { numberLine } from '../../lib/numline.js';
import { handles } from '../../lib/stage.js';
import { label, line } from '../../lib/draw.js';

const [LO, HI, PAD] = [-10, 10, 22];
const state = { a: -4, b: 3 };
const f = (v) => String(v).replace('-', '−');
let tool;
const X = (v) => PAD + ((v - LO) / (HI - LO)) * (tool.stage.w - PAD * 2);
const V = (px) => Math.max(LO, Math.min(HI, Math.round(LO + ((px - PAD) / (tool.stage.w - PAD * 2)) * (HI - LO))));

tool = createTool({
  state,
  label: 'A number line from minus ten to ten with two draggable points a and b. A bracket between them shows the distance, which is the same in both directions.',
  draw(ctx, stage, c) {
    const y = stage.h * 0.55;
    const nl = numberLine(ctx, stage, c, { lo: LO, hi: HI, y, step: 1 });
    nl.axis();
    const [a, b] = [state.a, state.b];
    line(ctx, nl.px(a), y - 26, nl.px(b), y - 26, { color: c.c, width: 5 });
    line(ctx, nl.px(a), y - 34, nl.px(a), y - 18, { color: c.c, width: 3 });
    line(ctx, nl.px(b), y - 34, nl.px(b), y - 18, { color: c.c, width: 3 });
    label(ctx, `|a − b| = ${Math.abs(a - b)}`, (nl.px(a) + nl.px(b)) / 2, y - 48, c, { size: 14, bounds: stage });
    nl.mark(a, { fill: c.a, r: 9 });
    nl.mark(b, { fill: c.b, r: 9 });
    label(ctx, 'a', nl.px(a), y + 40, c, { size: 14, bounds: stage, patch: false });
    label(ctx, 'b', nl.px(b), y + 40, c, { size: 14, bounds: stage, patch: false });
    label(ctx, 'drag the points, or use the sliders', stage.w / 2, stage.h - 12, c, { size: 11, bounds: stage, patch: false });
  },
  controls: [
    { title: 'Two points' },
    { key: 'a', label: 'a', min: LO, max: HI, step: 1 },
    { key: 'b', label: 'b', min: LO, max: HI, step: 1 },
    { readout: [
      ['a − b', (s) => f(s.a - s.b)],
      ['|a − b|', (s) => String(Math.abs(s.a - s.b))],
      ['|b − a|', (s) => String(Math.abs(s.b - s.a))],
    ] },
  ],
  tex: (s) => `|a-b|=|${s.a}-(${s.b})|=${Math.abs(s.a - s.b)}`,
});
handles(tool.stage, ['a', 'b'].map((k) => ({
  at: () => [X(state[k]), tool.stage.h * 0.55],
  move: (px) => { state[k] = V(px); },
  nudge: (d) => { state[k] = Math.max(LO, Math.min(HI, state[k] + d)); },
})), { onChange: () => tool.update() });
