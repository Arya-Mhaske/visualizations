import { createTool } from '../../lib/tool.js';
import { dot, label, line } from '../../lib/draw.js';
import { fixed, sig } from '../../lib/format.js';
import { evaluate, pointAt, usedAngle } from './_unit-circle-math.js';
import { drawFrame, frame } from './_unit-circle-view.js';

const state = { mode: 'rad', meant: 'deg', fn: 'sin', n: 30 };
const shown = (s) => evaluate(s.fn, s.n, s.mode);
const wanted = (s) => evaluate(s.fn, s.n, s.meant);
const same = (s) => Math.abs(shown(s) - wanted(s)) < 1e-9 * Math.max(1, Math.abs(wanted(s)));
const UNIT = { deg: '°', rad: ' rad' };

createTool({
  state,
  label: 'A calculator display and the unit circle. The green point is where the angle you meant lands. The coral point is where the calculator puts it, using the mode it is really in. If the mode does not match the unit you meant, the two points are far apart and the answers differ.',
  draw(ctx, stage, c) {
    const f = frame(stage, 1.5);
    drawFrame(ctx, f, c, { ticks: false });
    const want = f.px(pointAt(usedAngle(state.n, state.meant)));
    const got = f.px(pointAt(usedAngle(state.n, state.mode)));
    line(ctx, f.cx, f.cy, ...want, { color: c.c, width: 4 });
    line(ctx, f.cx, f.cy, ...got, { color: c.a, width: 3, dash: same(state) ? [] : [7, 5] });
    dot(ctx, ...want, 10, c.c, c.ink);
    dot(ctx, ...got, 7, c.a, c.ink);
    label(ctx, `${state.fn}(${state.n}) shows ${sig(shown(state), 4)}`, stage.w / 2, 16, c, { size: 13, color: same(state) ? c.ink : c.a, bounds: stage });
    label(ctx, `green: you meant ${state.n}${UNIT[state.meant]}    coral: the calculator`, stage.w / 2, stage.h - 12, c, { size: 10, bounds: stage, patch: false });
  },
  controls: [
    { title: 'The calculator and what you meant' },
    { key: 'mode', label: 'Calculator is in', options: [['deg', 'DEG'], ['rad', 'RAD']] },
    { key: 'meant', label: 'You meant the angle in', options: [['deg', 'Degrees'], ['rad', 'Radians']] },
    { key: 'fn', label: 'Press', options: [['sin', 'sin'], ['cos', 'cos'], ['tan', 'tan']] },
    { key: 'n', label: 'Number typed in', min: 0, max: 360, step: 1 },
    { readout: [
      ['The calculator shows', (s) => sig(shown(s), 4)],
      ['What you wanted', (s) => sig(wanted(s), 4)],
      ['It used the angle', (s) => `${fixed(usedAngle(s.n, s.mode), 1)}° round the circle`],
      ['Verdict', (s) => ({ text: same(s) ? 'right mode' : 'WRONG MODE', good: same(s) })],
    ] },
  ],
  tex: (s) => `\\${s.fn}(${s.n}\\text{ ${s.mode === 'deg' ? 'degrees' : 'radians'}})=${sig(shown(s), 4)}`,
});
