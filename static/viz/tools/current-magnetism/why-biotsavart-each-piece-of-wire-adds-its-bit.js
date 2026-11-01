import { createTool } from '../../lib/tool.js';
import { createBench } from '../../lib/rays.js';
import { handles } from '../../lib/stage.js';
import { arrow, dot, label, line } from '../../lib/draw.js';
import { fixed, sig } from '../../lib/format.js';
import { elementField, longWire, pageLoopPieces, sumField, wirePieces } from './_sources-of-magnetic-field-math.js';

// World units on the stage are centimetres; the maths is in metres and tesla. Page: x right, y up, z out of the page.
const state = { view: 'piece', I: 5, px: 3, py: 4, N: 12, k: 12 };
const R_LOOP = 5; // cm
const HALF_WIRE = 30; // cm
const DL = 1; // cm, the single piece
const m = (cm) => cm / 100;
const at = (s = state) => [m(s.px), m(s.py), 0];
const micro = (t) => `${sig(t * 1e6, 3)} µT`;
const signed = (t) => `${t >= 0 ? '⊙ out of page' : '⊗ into page'}`;

const onePiece = { p: [0, 0, 0], dl: [m(DL), 0, 0] };
const loopOf = (s = state, n = s.N) => pageLoopPieces(m(R_LOOP), n);
const wireOf = (s = state, n = s.N) => wirePieces(m(HALF_WIRE), n);
const pieces = (s = state) => (s.view === 'loop' ? loopOf(s) : wireOf(s));
const dBz = (s, piece) => elementField(s.I, piece, at(s))[2];
const added = (s = state) => (s.view === 'loop' ? Math.min(s.k, s.N) : s.N);
const total = (s = state) => pieces(s).slice(0, added(s)).reduce((sum, piece) => sum + dBz(s, piece), 0);
const exactLoop = (s = state) => sumField(s.I, loopOf(s, 720), at(s))[2];
const dist = (s = state) => Math.hypot(s.px, s.py);

function drawMap(ctx, bench, c) {
  const cells = 26;
  const edge = bench.view().right;
  const size = (2 * edge) / cells;
  const ref = elementField(1, onePiece, [0, m(2.5), 0])[2];
  for (let i = 0; i < cells; i++) {
    for (let j = 0; j < cells; j++) {
      const [x, y] = [-edge + (i + 0.5) * size, -edge + (j + 0.5) * size];
      const b = elementField(1, onePiece, [m(x), m(y), 0])[2];
      const [px, py] = bench.toPx(x - size / 2, y + size / 2);
      const w = bench.toPx(x + size / 2, 0)[0] - px;
      ctx.globalAlpha = Math.min(0.85, Math.sqrt(Math.abs(b) / Math.abs(ref)) * 0.9);
      ctx.fillStyle = b >= 0 ? c.a : c.b;
      ctx.fillRect(px, py, w + 0.5, w + 0.5);
    }
  }
  ctx.globalAlpha = 1;
}

function drawPiece(ctx, bench, c) {
  drawMap(ctx, bench, c);
  const [x0, y0] = bench.toPx(0, 0);
  const [x1, y1] = bench.toPx(state.px, state.py);
  line(ctx, x0, y0, x1, y1, { color: c.ink, width: 2, dash: [6, 4] });
  arrow(ctx, ...bench.toPx(-DL / 2, 0), ...bench.toPx(DL / 2, 0), { color: c.ink, width: 7, head: 14 });
  label(ctx, 'I dl', x0, y0 + 18, c, { size: 12, bounds: bench.stage });
  label(ctx, 'r', (x0 + x1) / 2 + 9, (y0 + y1) / 2 - 9, c, { size: 12 });
  const b = elementField(state.I, onePiece, at())[2];
  dot(ctx, x1, y1, 13, c.paper, c.ink);
  if (b >= 0) dot(ctx, x1, y1, 3.5, c.ink);
  else {
    line(ctx, x1 - 6, y1 - 6, x1 + 6, y1 + 6, { color: c.ink, width: 3 });
    line(ctx, x1 - 6, y1 + 6, x1 + 6, y1 - 6, { color: c.ink, width: 3 });
  }
  label(ctx, 'Coral: out of the page. Blue: into it. Darker is stronger.', 6, 12, c, { size: 11, align: 'left', bounds: bench.stage, patch: false });
}

function drawBars(ctx, bench, c, list, place) {
  const values = list.map((piece) => dBz(state, piece));
  const top = Math.max(...values.map(Math.abs)) || 1;
  list.forEach((piece, i) => {
    const on = i < added();
    const v = values[i];
    const [x, y, ux, uy] = place(piece);
    const long = (Math.abs(v) / top) * 26;
    if (on) line(ctx, x, y, x + ux * (4 + long), y + uy * (4 + long), { color: v >= 0 ? c.a : c.b, width: 5 });
  });
}

function drawLoop(ctx, bench, c) {
  const list = loopOf();
  list.forEach((piece, i) => {
    const on = i < added();
    const a = bench.toPx((piece.p[0] - piece.dl[0] / 2) * 100, (piece.p[1] - piece.dl[1] / 2) * 100);
    const b = bench.toPx((piece.p[0] + piece.dl[0] / 2) * 100, (piece.p[1] + piece.dl[1] / 2) * 100);
    arrow(ctx, ...a, ...b, { color: on ? c.ink : c.grid, width: 4, head: 8 });
  });
  drawBars(ctx, bench, c, list, (piece) => {
    const [x, y] = bench.toPx(piece.p[0] * 100, piece.p[1] * 100);
    return [x, y, Math.cos(piece.phi), -Math.sin(piece.phi)];
  });
  marker(ctx, bench, c);
}

function drawWire(ctx, bench, c) {
  const list = wireOf().filter((piece) => Math.abs(piece.p[0] * 100) < bench.view().right + 1);
  const keep = list.map((piece) => piece);
  keep.forEach((piece) => {
    const [x, y] = bench.toPx(piece.p[0] * 100, 0);
    const half = bench.toPx(piece.dl[0] * 50, 0)[0] - bench.toPx(0, 0)[0];
    arrow(ctx, x - half * 0.9, y, x + half * 0.9, y, { color: c.ink, width: 4, head: 8 });
  });
  drawBars(ctx, bench, c, keep, (piece) => {
    const [x, y] = bench.toPx(piece.p[0] * 100, 0);
    return [x, y, 0, state.py >= 0 ? -1 : 1];
  });
  marker(ctx, bench, c);
}

function marker(ctx, bench, c) {
  const [x, y] = bench.toPx(state.px, state.py);
  const b = total();
  dot(ctx, x, y, 13, c.paper, c.ink);
  if (b >= 0) dot(ctx, x, y, 3.5, c.ink);
  else {
    line(ctx, x - 6, y - 6, x + 6, y + 6, { color: c.ink, width: 3 });
    line(ctx, x - 6, y + 6, x + 6, y - 6, { color: c.ink, width: 3 });
  }
  label(ctx, 'P', x + 20, y - 12, c, { size: 13, bounds: bench.stage });
}

const START = { piece: [3, 4], loop: [1.5, 1], wire: [0, 4] };
const last = { view: state.view, N: state.N };

const tool = createTool({
  state,
  label: 'A page in which current pieces make magnetic field. In One piece, a short bit of wire lies along the x axis and a map shades how strong its field is around it, strongest at the sides and zero along the wire. In Loop, a ring of pieces adds up at a test point. In Straight wire, a long row of pieces adds up. Drag the point P.',
  setup: (stage, c) => ({ ...createBench(stage, { x: [-10, 10], cy: 0.5, c }), stage }),
  draw(ctx, stage, c, bench) {
    if (state.view === 'piece') drawPiece(ctx, bench, c);
    else if (state.view === 'loop') drawLoop(ctx, bench, c);
    else drawWire(ctx, bench, c);
  },
  controls: () => [
    { title: 'Add up the pieces' },
    { key: 'view', label: 'What is adding?', options: [['piece', 'One piece'], ['loop', 'A loop'], ['wire', 'A straight wire']] },
    { key: 'I', label: 'Current, I', min: 1, max: 10, format: (n) => `${n} A` },
    { key: 'N', label: 'Number of pieces', min: 4, max: 48, step: 2, format: (n) => `${n}` },
    { key: 'k', label: 'Pieces added so far', min: 0, max: 48, format: (n) => `${Math.min(n, state.N)}` },
    { text: 'Drag the point P. Arrow keys move it too.' },
    { readout: [
      ['Distance, r', (s) => `${fixed(dist(s), 1)} cm`],
      ['Field at P', (s) => (s.view === 'piece' ? `${micro(Math.abs(elementField(s.I, onePiece, at(s))[2]))}` : `${micro(Math.abs(total(s)))}`)],
      ['Direction', (s) => signed(s.view === 'piece' ? elementField(s.I, onePiece, at(s))[2] : total(s))],
      ['Compare', (s) => (s.view === 'piece'
        ? `${fixed((1e-7 * s.I * m(DL)) * 1e8, 2)} ×10⁻⁸ T m²`
        : s.view === 'loop' ? `${micro(Math.abs(exactLoop(s)))}`
          : `${micro(longWire(s.I, m(Math.abs(s.py))))}`)],
    ] },
  ],
  tex: (s) => {
    if (s.view === 'piece') {
      const sinT = Math.abs(s.py) / dist(s);
      return `\\dfrac{\\mu_0}{4\\pi}\\dfrac{I\\,dl\\,\\sin\\theta}{r^2}=10^{-7}\\dfrac{${s.I}\\times 0.01\\times ${fixed(sinT, 2)}}{(${fixed(m(dist(s)), 3)})^2}=${micro(Math.abs(elementField(s.I, onePiece, at(s))[2]))}`;
    }
    if (s.view === 'loop') return `B=\\sum dB=${micro(Math.abs(total(s)))}\\quad\\left(\\text{exact}\\ ${micro(Math.abs(exactLoop(s)))}\\right)`;
    return `B=\\sum dB=${micro(Math.abs(total(s)))}\\quad\\dfrac{\\mu_0 I}{2\\pi r}=${micro(longWire(s.I, m(Math.abs(s.py))))}`;
  },
  onChange() {
    if (state.view !== last.view) [state.px, state.py] = START[state.view];
    if (state.N !== last.N || state.view !== last.view) state.k = state.N;
    Object.assign(last, { view: state.view, N: state.N });
    state.k = Math.min(state.k, state.N);
    showFields();
  },
});

const bench = tool.extra;
const limit = 9;
function put(px, py) {
  state.px = Math.max(-limit, Math.min(limit, px));
  state.py = Math.max(-limit, Math.min(limit, py));
  if (state.view === 'wire') state.py = Math.abs(state.py) < 1.5 ? (state.py < 0 ? -1.5 : 1.5) : state.py;
  if (state.view === 'piece' && dist() < 1.5) {
    const s = Math.hypot(state.px, state.py) || 1;
    state.px *= 1.5 / s;
    state.py *= 1.5 / s;
  }
}
handles(tool.stage, [{
  at: () => bench.toPx(state.px, state.py),
  move: (x, y) => { const [wx, wy] = bench.toWorld(x, y); put(wx, wy); },
  keyStep: 12,
}], { onChange: () => tool.update(), radius: 28 });

const fields = [...document.querySelectorAll('#panel .nb-field')];
function showFields() {
  fields[2].hidden = state.view === 'piece';
  fields[3].hidden = state.view !== 'loop';
}
showFields();
tool.update();
