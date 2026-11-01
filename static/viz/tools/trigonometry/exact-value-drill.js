import { createTool } from '../../lib/tool.js';
import { handles } from '../../lib/stage.js';
import { dot, label, line, poly } from '../../lib/draw.js';
import { piFrac } from '../../lib/format.js';
import { SPECIAL, exact, normalise, pointAt, referenceAngle, texOf } from './_unit-circle-math.js';
import { drawFrame, frame } from './_unit-circle-view.js';
import { deg } from './_right-triangle-math.js';

const state = { i: 2, hide: false };
const theta = (s = state) => SPECIAL[s.i];
const SIX = ['sin', 'cos', 'tan', 'csc', 'sec', 'cot'];
const entry = (name, s = state) => exact(theta(s))[name];
const text = (name, s = state) => (entry(name, s) === null ? 'undefined' : entry(name, s)[0]);
const radians = (t) => (t === 0 ? '0' : piFrac((t * Math.PI) / 180));

const tool = createTool({
  state,
  label: 'The unit circle with a point at one of the special angles, a multiple of 30 or 45 degrees, and the small reference triangle under it as a hint. Below, a table gives all six trig values for that angle in exact form. A switch hides the answers so you can test yourself.',
  draw(ctx, stage, c) {
    const f = frame({ w: stage.w, h: stage.h * 0.66 }, 1.45);
    drawFrame(ctx, f, c, { ticks: false });
    const t = theta();
    const [x, y] = pointAt(t);
    const P = f.px([x, y]);
    const F = f.px([x, 0]);
    if (Math.abs(x) > 1e-9 && Math.abs(y) > 1e-9) poly(ctx, [[f.cx, f.cy], F, P], { fill: c.fillC, stroke: c.ink, width: 2 });
    line(ctx, f.cx, f.cy, ...P, { color: c.a, width: 4 });
    dot(ctx, ...P, 9, c.a, c.ink);
    label(ctx, `${t}° = ${radians(t)} rad`, stage.w / 2, 14, c, { size: 12, bounds: stage });
    label(ctx, `reference ${referenceAngle(t)}°`, F[0] + (x >= 0 ? -34 : 34), F[1] + (y >= 0 ? 14 : -14), c, { size: 10, bounds: stage, patch: false });
    // the table
    const top = stage.h * 0.72;
    const colW = stage.w / 3;
    SIX.forEach((name, n) => {
      const [col, row] = [n % 3, Math.floor(n / 3)];
      const shown = state.hide ? '?' : text(name);
      label(ctx, `${name} = ${shown}`, colW * (col + 0.5), top + row * 40, c, { size: 12, color: shown === 'undefined' ? c.a : c.ink, bounds: stage, patch: false });
    });
  },
  controls: [
    { title: 'Pick a special angle' },
    { key: 'i', label: 'Angle', min: 0, max: SPECIAL.length - 1, step: 1, format: (n) => `${SPECIAL[n]}°` },
    { key: 'hide', label: 'Hide the answers (test yourself)', toggle: true },
    { text: 'You can also drag the point round the circle.' },
    { readout: [
      ['Angle in radians', (s) => radians(theta(s))],
      ['Reference angle', (s) => `${referenceAngle(theta(s))}°`],
      ['sin, cos', (s) => (s.hide ? '? , ?' : `${text('sin', s)}, ${text('cos', s)}`)],
      ['tan', (s) => (s.hide ? '?' : text('tan', s))],
    ] },
  ],
  tex: (s) => (s.hide ? '\\sin\\theta=\\ ?,\\ \\cos\\theta=\\ ?' : `\\sin ${theta(s)}^\\circ=${texOf(text('sin', s))},\\ \\cos ${theta(s)}^\\circ=${texOf(text('cos', s))}`),
});

const nearest = (angle) => {
  let best = 0;
  SPECIAL.forEach((v, i) => { if (Math.abs(v - angle) < Math.abs(SPECIAL[best] - angle)) best = i; });
  return best;
};
handles(tool.stage, [{
  at: () => frame({ w: tool.stage.w, h: tool.stage.h * 0.66 }, 1.45).px(pointAt(theta())),
  move(px, py) {
    const f = frame({ w: tool.stage.w, h: tool.stage.h * 0.66 }, 1.45);
    state.i = nearest(normalise(deg(Math.atan2(f.cy - py, px - f.cx))));
  },
  nudge(direction) { state.i = Math.max(0, Math.min(SPECIAL.length - 1, state.i + direction)); },
}], { onChange: () => tool.update(), radius: 30 });
tool.update();
