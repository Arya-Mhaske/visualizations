import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { gcd } from '../../lib/format.js';

// The line is stored as slope m = n / 2 and intercept b; every form is worked out from those two numbers
const state = { n: 3, b: -2, x1: 2, x2: -2 };
const R = 8;
const m = (s = state) => s.n / 2;
const y = (s, x) => m(s) * x + s.b;
const fmt = (v) => (Number.isInteger(v) ? `${v}` : `${v}`);
const sg = (v) => (v < 0 ? `-${Math.abs(v)}` : `+${v}`);
function general(s) {
  // n x − 2 y + 2 b = 0, divided by the common factor
  let [A, B, C] = [s.n, -2, 2 * s.b];
  const g = gcd(gcd(Math.abs(A), Math.abs(B)), Math.abs(C)) || 1;
  [A, B, C] = [A / g, B / g, C / g];
  if (A < 0 || (A === 0 && B < 0)) [A, B, C] = [-A, -B, -C];
  return [A, B, C];
}
const term = (k, v) => (k === 0 ? '' : `${k === 1 ? '' : k === -1 ? '-' : k}${v}`);
const generalTex = (s) => { const [A, B, C] = general(s); return `${term(A, 'x')}${B < 0 ? '-' : '+'}${Math.abs(B) === 1 ? '' : Math.abs(B)}y${C === 0 ? '' : sg(C)}=0`; };
const mTex = (s) => (Number.isInteger(m(s)) ? `${m(s)}` : `\\tfrac{${s.n}}{2}`);

createTool({
  state,
  label: 'A line drawn from its slope and intercept, with two marked points. Beside it, the same line written in four forms: slope-intercept, point-slope, two-point and general. Changing any control changes all four forms together, because they all describe the same line.',
  setup: (stage, c) => createPlot(stage, { x: [-R, R], y: [-R, R], c, pad: 16 }),
  draw(ctx, stage, c, plot) {
    plot.axes();
    plot.fn((x) => y(state, x), { color: c.a, width: 4 });
    plot.point(0, state.b, { fill: c.c, r: 7 });
    plot.point(state.x1, y(state, state.x1), { fill: c.fillY, r: 8 });
    plot.point(state.x2, y(state, state.x2), { fill: c.fillB, r: 8 });
  },
  controls: [
    { title: 'Edit the line' },
    { key: 'n', label: 'Slope, in halves (n ÷ 2)', min: -8, max: 8, step: 1, format: (v) => `${v}/2 = ${v / 2}` },
    { key: 'b', label: 'y-intercept, b', min: -6, max: 6, step: 1 },
    { key: 'x1', label: 'Point 1 at x =', min: -6, max: 6, step: 1 },
    { key: 'x2', label: 'Point 2 at x =', min: -6, max: 6, step: 1 },
  ],
  onChange(s) { if (s.x1 === s.x2) s.x2 = s.x1 === 6 ? 5 : s.x1 + 1; },
  tex: (s) => {
    const [y1, y2] = [y(s, s.x1), y(s, s.x2)];
    return `\\begin{aligned}\\text{slope–intercept: } & y=${mTex(s)}x${s.b ? sg(s.b) : ''}\\\\ \\text{point–slope: } & y${y1 < 0 ? '+' + Math.abs(y1) : y1 === 0 ? '' : '-' + y1}=${mTex(s)}(x${s.x1 < 0 ? '+' + Math.abs(s.x1) : s.x1 === 0 ? '' : '-' + s.x1})\\\\ \\text{two-point: } & \\dfrac{y-${fmt(y1)}}{x-${s.x1}}=\\dfrac{${fmt(y2)}-${fmt(y1)}}{${s.x2}-${s.x1}}\\\\ \\text{general: } & ${generalTex(s)}\\end{aligned}`.replace(/--/g, '+').replace(/-\s*-/g, '+');
  },
});
