import { createTool } from '../../lib/tool.js';
import { handles } from '../../lib/stage.js';
import { arrow, dot, label, line } from '../../lib/draw.js';
import { createBench } from '../../lib/rays.js';
import { drawCharge, drawLine, fieldAt, fieldLines, traceLine } from '../../lib/field.js';
import { fixed, sig } from '../../lib/format.js';
import { K_NC, loopWork, nullPoint } from './_electric-field-math.js';

const state = { view: 'cross', q2: -2, px: 0.6, py: 1.6, cx: 0, cy: 0.6, R: 2.4, pretend: false };
const charges = (s = state) => [{ x: -2, y: 0, q: 3 }, { x: 2, y: 0, q: s.q2 }];
const parts = (s = state) => charges(s).map((one) => fieldAt([one], [s.px, s.py], K_NC));
const total = (s = state) => fieldAt(charges(s), [s.px, s.py], K_NC);
const size = ([x, y]) => Math.hypot(x, y);
const bearing = ([x, y]) => `${fixed((Math.atan2(y, x) * 180) / Math.PI, 0)}°`;
const noField = (s = state) => size(total(s)) < 0.02;
const work = (s = state) => loopWork(charges(s), [s.cx, s.cy], s.R);

let cache = { key: null, lines: [] };
function background() {
  if (cache.key !== state.q2) cache = { key: state.q2, lines: fieldLines(charges(), { perUnit: 4 }).lines };
  return cache.lines;
}

function drawCharges(ctx, bench, c) {
  for (const one of charges()) if (one.q !== 0) drawCharge(ctx, ...bench.toPx(one.x, one.y), 11, one.q, c);
}

function drawCandidate(ctx, stage, bench, c, E, color) {
  const length = size(E);
  if (length < 1e-6) return;
  const [ux, uy] = [E[0] / length, E[1] / length];
  const from = [state.px - ux * 12, state.py - uy * 12];
  const to = [state.px + ux * 12, state.py + uy * 12];
  line(ctx, ...bench.toPx(...from), ...bench.toPx(...to), { color, width: 2, dash: [6, 6] });
}

function vector(ctx, bench, c, E, color, scale) {
  const [x, y] = bench.toPx(state.px, state.py);
  arrow(ctx, x, y, x + E[0] * scale, y - E[1] * scale, { color, width: 4 });
}

function drawCross(ctx, stage, bench, c) {
  for (const entry of background()) drawLine(ctx, bench.toPx, entry, { color: c.grid, width: 1 });
  const [e1, e2] = parts();
  const net = total();
  drawCandidate(ctx, stage, bench, c, e1, c.a);
  drawCandidate(ctx, stage, bench, c, e2, c.b);
  if (!noField()) {
    const start = [state.px, state.py];
    for (const sign of [1, -1]) {
      drawLine(ctx, bench.toPx, { points: traceLine(charges(), start, { sign, bounds: 8 }).points, flip: sign < 0 }, { color: c.c, width: 3 });
    }
  }
  drawCharges(ctx, bench, c);
  const scale = 64 / Math.max(size(e1), size(e2), size(net), 0.001);
  vector(ctx, bench, c, e1, c.a, scale);
  vector(ctx, bench, c, e2, c.b, scale);
  vector(ctx, bench, c, net, c.c, scale);
  dot(ctx, ...bench.toPx(state.px, state.py), 11, c.paper, c.ink);
  label(ctx, noField() ? 'No field here, so no direction' : 'Green: the one real direction', stage.w / 2, stage.h - 12, c, { size: 12, bounds: stage, color: c.c });
  label(ctx, 'Drag the white point', 6, 12, c, { size: 11, align: 'left', bounds: stage });
}

function drawLoop(ctx, stage, bench, c) {
  for (const entry of background()) drawLine(ctx, bench.toPx, entry, { color: c.grid, width: 1 });
  const { pieces } = work();
  const n = pieces.length;
  const point = (a) => [state.cx + state.R * Math.cos(a), state.cy + state.R * Math.sin(a)];
  for (let i = 0; i < n; i += 6) {
    const [a0, a1] = [(i * 2 * Math.PI) / n, ((i + 6) * 2 * Math.PI) / n];
    const helps = state.pretend || pieces[i + 3] > 0;
    line(ctx, ...bench.toPx(...point(a0)), ...bench.toPx(...point(a1)), { color: helps ? c.c : c.a, width: 5 });
  }
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2 + 0.4;
    const [x, y] = bench.toPx(...point(a));
    arrow(ctx, x, y, x - Math.sin(a) * 18, y - Math.cos(a) * 18, { color: c.ink, width: 3 });
  }
  drawCharges(ctx, bench, c);
  dot(ctx, ...bench.toPx(state.cx, state.cy), 9, c.paper, c.ink);
  label(ctx, state.pretend ? 'Pretend: the field helps all the way' : 'Green: field helps. Coral: it opposes', stage.w / 2, stage.h - 12, c, { size: 12, bounds: stage });
  label(ctx, 'Drag the white point', 6, 12, c, { size: 11, align: 'left', bounds: stage });
}

const tool = createTool({
  state,
  label: 'Two charges with their field lines. In the first view, drag a point: each charge alone would send a line a different way, but the sum gives one direction. In the second view, a closed loop is coloured by where the field helps and where it opposes a charge going round.',
  setup: (stage, c) => createBench(stage, { x: [-6, 6], c }),
  draw(ctx, stage, c, bench) {
    if (state.view === 'cross') drawCross(ctx, stage, bench, c);
    else drawLoop(ctx, stage, bench, c);
  },
  controls: () => [
    { title: 'Try to break the rule' },
    { key: 'view', label: 'Try to draw', options: [['cross', 'A crossing'], ['loop', 'A closed loop']] },
    { key: 'q2', label: 'Right charge', min: -3, max: 3, format: (n) => `${n > 0 ? '+' : ''}${fixed(n, 0)} nC` },
    { key: 'R', label: 'Loop radius', min: 1, max: 3.5, step: 0.1, format: (n) => `${fixed(n, 1)} m` },
    { key: 'pretend', label: 'Pretend the loop is a field line', toggle: true },
    { readout: [
      ['Left charge alone points', () => bearing(parts()[0])],
      ['Right charge alone points', () => (state.q2 === 0 ? 'No charge' : bearing(parts()[1]))],
      ['Together they point', () => (noField() ? 'Nowhere' : bearing(total()))],
      ['Field here', () => `${sig(size(total()), 3)} N/C`],
    ] },
    { readout: [
      ['Field helps by', (s) => `${sig(s.pretend ? work(s).help + work(s).oppose : work(s).help, 3)} V`],
      ['Field opposes by', (s) => `${s.pretend ? 0 : sig(work(s).oppose, 3)} V`],
      ['Gain per lap, per coulomb', (s) => {
        const gain = s.pretend ? work(s).help + work(s).oppose : Math.abs(work(s).net) < 0.005 ? 0 : work(s).net;
        return { text: `${s.pretend ? sig(gain, 3) : fixed(gain, 2)} J`, good: !s.pretend };
      }],
    ] },
  ],
  tex(s) {
    if (s.view === 'cross') return `\\vec E=\\vec E_1+\\vec E_2,\\quad |\\vec E|=${sig(size(total(s)), 3)}\\ \\text{N/C}`;
    const value = s.pretend ? sig(work(s).help + work(s).oppose, 3) : '0';
    return `\\oint \\vec E\\cdot d\\vec l=${value}\\ \\text{V}${s.pretend ? '\\ \\text{(impossible)}' : ''}`;
  },
  onChange: () => show(),
});

const items = [...document.querySelector('#panel').firstElementChild.children];
function show() {
  const cross = state.view === 'cross';
  items[3].hidden = cross;
  items[4].hidden = cross;
  items[5].hidden = !cross;
  items[6].hidden = cross;
}

const near = (x, y) => charges().some((one) => one.q !== 0 && Math.hypot(x - one.x, y - one.y) < 0.4);
handles(tool.stage, [{
  at() { return tool.extra.toPx(...(state.view === 'cross' ? [state.px, state.py] : [state.cx, state.cy])); },
  move(px, py) {
    const [x, y] = tool.extra.toWorld(px, py);
    const [wx, wy] = [Math.max(-5.5, Math.min(5.5, x)), Math.max(-5.5, Math.min(5.5, y))];
    if (state.view === 'loop') {
      [state.cx, state.cy] = [wx, wy];
      return;
    }
    if (near(wx, wy)) return;
    // A pixel is too coarse to land on a neutral point by hand, so it holds the point when you come close.
    const zero = nullPoint(3, state.q2);
    [state.px, state.py] = zero && Math.hypot(wx - zero[0], wy - zero[1]) < 0.25 ? zero : [wx, wy];
  },
}], { onChange: () => tool.update(), radius: 28, keyStep: 6 });
show();
tool.update();
