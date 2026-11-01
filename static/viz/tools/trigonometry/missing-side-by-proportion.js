import { createTool } from '../../lib/tool.js';
import { label, line, poly } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';

// The small triangle has sides a = 5, b = 7, c = 9 cm. The big one is similar. One of its sides is known; find another.
const SMALL = { a: 5, b: 7, c: 9 };
const state = { known: 'a', value: 12, ask: 'c' };
const NAMES = ['a', 'b', 'c'];
const factor = (s = state) => s.value / SMALL[s.known];
const big = (s = state) => Object.fromEntries(NAMES.map((n) => [n, SMALL[n] * factor(s)]));
// Corners with c along the bottom: A at the origin, B at (c, 0), C found by the cosine rule.
function shape(t) {
  const cosA = (t.b * t.b + t.c * t.c - t.a * t.a) / (2 * t.b * t.c);
  const sinA = Math.sqrt(1 - cosA * cosA);
  return { A: [0, 0], B: [t.c, 0], C: [t.b * cosA, t.b * sinA] };
}

function drawTriangle(ctx, c, box, sides, shown, unknown, col, stage) {
  const { A, B, C } = shape(sides);
  const w = Math.max(B[0], C[0]) - Math.min(0, C[0]);
  const u = Math.min(box.w / w, (box.h * 0.8) / C[1]);
  const at = ([x, y]) => [box.x + (x - Math.min(0, C[0])) * u, box.y + box.h * 0.9 - y * u];
  const P = [A, B, C].map(at);
  poly(ctx, P, { fill: c.fillC, stroke: c.ink, width: 3 });
  const edge = { a: [1, 2], b: [2, 0], c: [0, 1] };
  for (const n of NAMES) {
    const [i, j] = edge[n];
    line(ctx, ...P[i], ...P[j], { color: col[n], width: 6 });
    const mid = [(P[i][0] + P[j][0]) / 2, (P[i][1] + P[j][1]) / 2];
    const off = n === 'c' ? [0, 16] : n === 'a' ? [16, 0] : [-16, -4];
    const text = unknown === n ? 'x' : fixed(shown[n], 1);
    label(ctx, text, mid[0] + off[0], mid[1] + off[1], c, { size: 13, color: col[n], bounds: stage });
  }
}

const tool = createTool({
  state,
  label: 'Two similar triangles. The small one has all its sides marked, 5, 7 and 9 cm. The larger one has one side given and one side marked x. Matching sides share a colour: coral a, blue b, green c.',
  draw(ctx, stage, c) {
    const col = { a: c.a, b: c.b, c: c.c };
    const half = stage.w * 0.4;
    drawTriangle(ctx, c, { x: 8, y: 0, w: half - 8, h: stage.h * 0.45 }, SMALL, SMALL, null, col, stage);
    drawTriangle(ctx, c, { x: 8, y: stage.h * 0.5, w: stage.w - 16, h: stage.h * 0.5 }, big(), { ...big(), [state.known]: state.value }, state.ask, col, stage);
    const shownKnown = state.ask === state.known;
    label(ctx, 'Small triangle', 8, 12, c, { size: 11, align: 'left', bounds: stage, patch: false });
    label(ctx, shownKnown ? 'Ask for a different side' : 'Big triangle', stage.w * 0.45, 12, c, { size: 11, align: 'left', bounds: stage, patch: false });
  },
  controls: () => [
    { title: 'Set the problem' },
    { key: 'known', label: 'Which side is given?', options: [['a', 'a'], ['b', 'b'], ['c', 'c']] },
    { key: 'value', label: 'Its length', min: 2, max: 30, step: 0.5, format: (n) => `${fixed(n, 1)} cm` },
    { key: 'ask', label: 'Which side is x?', options: [['a', 'a'], ['b', 'b'], ['c', 'c']] },
    { readout: [
      ['Scale factor', () => fixed(factor(), 3)],
      ['x', () => `${fixed(big()[state.ask] ?? 0, 2)} cm`],
    ] },
  ],
  tex: (s) => `\\dfrac{x}{${SMALL[s.ask]}}=\\dfrac{${fixed(s.value, 1)}}{${SMALL[s.known]}}\\ \\Rightarrow\\ x=${fixed(big(s)[s.ask], 2)}\\ \\text{cm}`,
});
tool.update();
