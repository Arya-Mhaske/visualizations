import { createTool } from '../../lib/tool.js';
import { createClock, transport } from '../../lib/sim.js';
import { handles } from '../../lib/stage.js';
import { arc, arrow, label, TAU } from '../../lib/draw.js';
import { createBench } from '../../lib/rays.js';
import { drawCharge, fieldAt } from '../../lib/field.js';
import { fixed, sig } from '../../lib/format.js';
import { K_NC, SCREEN_C, delayNs, sourceAt } from './_electric-field-math.js';

const OPENING = -1.2; // s; the opening picture shows news that left 1.2 s ago
const TEST = { x: 3, y: 0 };
const state = { q: 4, neutral: true, x: -3, y: 0 };
const clock = createClock(document.querySelector('#stage'), { onFrame: () => tool.update() });
let history = [];

const now = () => clock.state.t;
const strength = () => (state.neutral ? 0 : state.q);
const place = () => ({ t: now(), x: state.x, y: state.y, q: strength() });
const latest = () => history[history.length - 1];
const fieldFrom = (s, p) => (s.q === 0 ? [0, 0] : fieldAt([s], p, K_NC));
const size = ([x, y]) => Math.hypot(x, y);
const distance = (s) => Math.hypot(TEST.x - s.x, TEST.y - s.y);
const felt = () => fieldFrom(sourceAt(history, [TEST.x, TEST.y], now()), [TEST.x, TEST.y]);
const instant = () => fieldFrom(latest(), [TEST.x, TEST.y]);
const reached = () => now() >= latest().t + distance(latest()) / SCREEN_C;

function restart() {
  history = [{ t: -100, x: state.x, y: state.y, q: state.q }, { t: OPENING, x: state.x, y: state.y, q: strength() }];
}
restart(); // before the first draw

let lastQ = state.q;
function changed() {
  if (state.q !== lastQ) state.neutral = false; // a new charge only matters once it is uncovered
  lastQ = state.q;
  const next = place();
  const same = ['x', 'y', 'q'].every((key) => next[key] === latest()[key]);
  if (same) return; // no change, so no news to send
  history.push(next);
  while (history.length > 2 && now() - history[1].t > 7) history.shift();
  if (history.length > 600) history.splice(1, 1);
  clock.play();
}

function drawArrows(ctx, bench, c) {
  for (let i = -4; i <= 4; i++) {
    for (let j = -4; j <= 4; j++) {
      const p = [i * 1.15, j * 1.15];
      if (Math.hypot(p[0] - state.x, p[1] - state.y) < 0.5) continue;
      const source = sourceAt(history, p, now());
      const E = fieldFrom(source, p);
      const strong = size(E);
      if (strong < 1e-6) continue;
      const length = Math.min(0.85, 0.6 * Math.sqrt(strong));
      const [x, y] = bench.toPx(...p);
      const [ex, ey] = bench.toPx(p[0] + (E[0] / strong) * length, p[1] + (E[1] / strong) * length);
      arrow(ctx, x, y, ex, ey, { color: source === latest() ? c.c : c.d, width: 2, head: 7 });
    }
  }
}

const tool = createTool({
  state,
  label: 'A source charge and a small test charge with arrows showing the field. When the source changes, the news spreads out as a growing ring. Outside the ring the arrows still show the old field, so the test charge keeps feeling a force from a charge that has changed.',
  setup: (stage, c) => createBench(stage, { x: [-5.5, 5.5], c }),
  draw(ctx, stage, c, bench) {
    drawArrows(ctx, bench, c);
    const last = latest();
    const radius = (now() - last.t) * SCREEN_C;
    if (radius < 16) {
      arc(ctx, ...bench.toPx(last.x, last.y), radius * (stage.w / 11), 0, TAU, { color: c.ink, width: 2, dash: [8, 6] });
    }
    const [px, py] = bench.toPx(state.x, state.y);
    drawCharge(ctx, px, py, 14, 1, c);
    if (state.neutral) drawCharge(ctx, px + 14, py + 14, 14, -1, c);
    const [tx, ty] = bench.toPx(TEST.x, TEST.y);
    drawCharge(ctx, tx, ty, 8, 1, c);
    const F = felt();
    const strong = size(F);
    if (strong > 1e-6) {
      const push = Math.min(70, 26 + 30 * Math.sqrt(strong));
      arrow(ctx, tx, ty, tx + (F[0] / strong) * push, ty - (F[1] / strong) * push, { color: c.a, width: 4 });
    }
    label(ctx, 'Test charge', tx, ty + 20, c, { size: 11, bounds: stage });
    label(ctx, 'Drag the source', 6, 12, c, { size: 11, align: 'left', bounds: stage });
    label(ctx, 'Purple: old news  Green: up to date', 6, stage.h - 12, c, { size: 11, align: 'left', bounds: stage });
  },
  controls: () => [
    { title: 'Change the source' },
    { key: 'q', label: 'Source charge', min: 1, max: 8, format: (n) => `${n} nC` },
    { key: 'neutral', label: 'Bring a −q onto it, so its net charge is 0', toggle: true },
    transport(clock, { onChange: () => { restart(); tool.update(); } }),
    { readout: [
      ['Force on 1 nC now', () => `${sig(size(felt()), 3)} nN`],
      ['If force were instant', () => `${sig(size(instant()), 3)} nN`],
      ['Test charge has heard', () => ({ text: reached() ? 'Yes' : 'Not yet', good: reached() })],
      ['Real delay', () => `${fixed(delayNs(distance(latest())), 1)} ns`],
      ['Screen time since the change', () => `${fixed(now() - latest().t, 1)} s`],
    ] },
  ],
  tex: () => `E=\\frac{kq}{r^2},\\quad \\text{delay}=\\frac{r}{c}=\\frac{${fixed(distance(latest()), 1)}\\ \\text{m}}{3\\times 10^{8}\\ \\text{m/s}}=${fixed(delayNs(distance(latest())), 1)}\\ \\text{ns}`,
  onChange: changed,
});

const clamp = (v) => Math.max(-5, Math.min(1.5, v));
handles(tool.stage, [{
  at: () => tool.extra.toPx(state.x, state.y),
  move(px, py) {
    const [x, y] = tool.extra.toWorld(px, py);
    state.x = clamp(x);
    state.y = Math.max(-5, Math.min(5, y));
    changed();
  },
}], { onChange: () => tool.update(), radius: 28, keyStep: 8 });

tool.update();
