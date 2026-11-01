import { createTool } from '../../lib/tool.js';
import { numberLine } from '../../lib/numline.js';
import { handles } from '../../lib/stage.js';
import { arrow, label, line } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { bandTest } from './_inequalities-math.js';

const state = { mode: 'near', a: 3, x: 1.5 };
const R = 9;
let nlFor = null;
const say = (n) => fixed(n, 1);

const tool = createTool({
  state,
  label: 'A number line with a movable point x and a movable distance a. For the "less than" case the allowed region is one band between minus a and a, so x must pass two tests at once: and. For the "greater than" case the allowed region is two rays, one beyond each end, so x only has to pass one of two tests: or.',
  draw(ctx, stage, c) {
    const nl = numberLine(ctx, stage, c, { lo: -R, hi: R, y: stage.h * 0.55, step: 1 });
    nlFor = nl;
    nl.axis();
    const near = state.mode === 'near';
    if (near) nl.span(-state.a, state.a, { color: c.c, openA: true, openB: true, width: 12 });
    else {
      nl.span(-Infinity, -state.a, { color: c.b, openB: true, width: 12 });
      nl.span(state.a, Infinity, { color: c.b, openA: true, width: 12 });
    }
    nl.text('−a', -state.a, 40, { color: c.ink });
    nl.text('a', state.a, 40, { color: c.ink });
    nl.text('0', 0, -22, { color: c.ink });
    line(ctx, nl.px(0), nl.y - 30, nl.px(state.x), nl.y - 30, { color: c.d, width: 4 });
    nl.dot(state.x, { fill: c.a, r: 10 });
    nl.text(`|x| = ${say(Math.abs(state.x))}`, state.x / 2, -44, { color: c.d, size: 11 });
    const t = bandTest(state.x, state.a);
    const ok = near ? t.near : t.far;
    label(ctx, ok ? 'x is allowed' : 'x is not allowed', stage.w / 2, 18, c, { size: 13, color: ok ? c.c : c.a, bounds: stage });
  },
  controls: [
    { title: 'Within, or beyond?' },
    { key: 'mode', label: 'Condition', options: [['near', '|x| < a'], ['far', '|x| > a']] },
    { key: 'a', label: 'Distance, a', min: 0.5, max: 6, step: 0.5 },
    { key: 'x', label: 'Point, x', min: -8, max: 8, step: 0.1, format: say },
    { text: 'Drag the point on the line, or use the slider.' },
    { readout: [
      ['Is x > −a?', (s) => (s.x > -s.a ? 'yes' : 'no')],
      ['Is x < a?', (s) => (s.x < s.a ? 'yes' : 'no')],
      ['Is x < −a?', (s) => (s.x < -s.a ? 'yes' : 'no')],
      ['Is x > a?', (s) => (s.x > s.a ? 'yes' : 'no')],
      ['Verdict', (s) => { const t = bandTest(s.x, s.a); const ok = s.mode === 'near' ? t.near : t.far; return { text: s.mode === 'near' ? (ok ? 'both yes: AND' : 'one fails') : (ok ? 'one yes: OR' : 'both fail'), good: ok }; }],
    ] },
  ],
  tex: (s) => (s.mode === 'near'
    ? `|x|<${say(s.a)}\\iff -${say(s.a)}<x\\ \\text{and}\\ x<${say(s.a)}`
    : `|x|>${say(s.a)}\\iff x<-${say(s.a)}\\ \\text{or}\\ x>${say(s.a)}`),
});

handles(tool.stage, [{
  at: () => [nlFor ? nlFor.px(state.x) : 0, tool.stage.h * 0.55],
  move(px) { state.x = Math.max(-8, Math.min(8, Math.round(nlFor.val(px) * 10) / 10)); },
  keyStep: 6,
  nudge(direction) { state.x = Math.max(-8, Math.min(8, Math.round((state.x + direction * 0.5) * 10) / 10)); },
}], { onChange: () => tool.update(), radius: 28 });
tool.update();
