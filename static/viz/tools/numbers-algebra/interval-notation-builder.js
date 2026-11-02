import { createTool } from '../../lib/tool.js';
import { numberLine } from '../../lib/numline.js';
import { handles } from '../../lib/stage.js';
import { label } from '../../lib/draw.js';
import { interval } from './_number-systems-math.js';

const [LO, HI, PAD] = [-8, 8, 22];
const state = { a: -3, b: 4, closedL: true, closedR: false, infL: false, infR: false };
let tool;
const X = (v) => PAD + ((v - LO) / (HI - LO)) * (tool.stage.w - PAD * 2);
const V = (px) => Math.max(LO, Math.min(HI, Math.round(LO + ((px - PAD) / (tool.stage.w - PAD * 2)) * (HI - LO))));

tool = createTool({
  state,
  label: 'A number line with a shaded interval. Filled dots are included ends and hollow dots are excluded ends. The interval notation, inequality and set-builder form are written below.',
  draw(ctx, stage, c) {
    const y = stage.h * 0.4;
    const nl = numberLine(ctx, stage, c, { lo: LO, hi: HI, y, step: 1 });
    nl.axis();
    const t = interval(state);
    const empty = t.text === '∅';
    if (!empty) nl.span(state.infL ? -Infinity : state.a, state.infR ? Infinity : state.b, { color: c.a, openA: !state.closedL, openB: !state.closedR });
    label(ctx, t.text, stage.w / 2, stage.h * 0.68, c, { size: 22, bounds: stage });
    label(ctx, t.ineq, stage.w / 2, stage.h * 0.82, c, { size: 14, bounds: stage, patch: false });
  },
  controls: [
    { title: 'Build an interval' },
    { key: 'a', label: 'Left end a', min: LO, max: HI, step: 1 },
    { key: 'b', label: 'Right end b', min: LO, max: HI, step: 1 },
    { row: [{ key: 'closedL', label: 'Include a', toggle: true }, { key: 'closedR', label: 'Include b', toggle: true }] },
    { row: [{ key: 'infL', label: 'From −∞', toggle: true }, { key: 'infR', label: 'To ∞', toggle: true }] },
    { readout: [
      ['Interval', (s) => interval(s).text],
      ['Inequality', (s) => interval(s).ineq],
      ['Set-builder', (s) => interval(s).setb],
    ] },
  ],
  tex: (s) => `x\\in ${interval(s).text.replace(/−/g, '-').replace('-∞', '-\\infty').replace('∞', '\\infty').replace('∅', '\\varnothing').replace(/[{}]/g, (m) => '\\' + m)}`,
});
handles(tool.stage, ['a', 'b'].map((k) => ({
  at: () => [X(state[k]), tool.stage.h * 0.4],
  move: (px) => { state[k] = V(px); },
  nudge: (d) => { state[k] = Math.max(LO, Math.min(HI, state[k] + d)); },
})), { onChange: () => tool.update() });
