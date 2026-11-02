import { createTool } from '../../lib/tool.js';
import { dot, label, line } from '../../lib/draw.js';

// The 8 three-bit words are the corners of a cube; one bit flip is a step along an edge. Choose codewords (coral).
// Around each draw a ball of radius r. If balls overlap (yellow), a received word could belong to either: it cannot be fixed.
const state = { v0: true, v1: false, v2: false, v3: false, v4: false, v5: false, v6: false, v7: true, r: 1 };
const dist = (a, b) => { let x = a ^ b; let k = 0; while (x) { k += x & 1; x >>= 1; } return k; };
const words = (s) => [...Array(8).keys()].filter((k) => s[`v${k}`]);
const minDist = (ws) => { let m = Infinity; for (let i = 0; i < ws.length; i++) for (let j = i + 1; j < ws.length; j++) m = Math.min(m, dist(ws[i], ws[j])); return m; };
const bin = (k) => k.toString(2).padStart(3, '0');
const PRESETS = { rep: [0, 7], even: [0, 3, 5, 6], two: [0, 1], all: [0, 1, 2, 3, 4, 5, 6, 7] };

const tool = createTool({
  state,
  label: 'A cube whose corners are the eight three-bit words. Chosen codewords are coral. Corners within the chosen radius of exactly one codeword are blue, corners within reach of two or more are yellow, and corners within reach of none are white.',
  draw(ctx, stage, c) {
    const s = Math.min(stage.w, stage.h) * 0.36;
    const [ox, oy] = [stage.w / 2 - s * 0.6, stage.h / 2 + s * 0.75];
    const pos = (k) => { const [x, y, z] = [(k >> 2) & 1, (k >> 1) & 1, k & 1]; return [ox + x * s + z * s * 0.6, oy - y * s - z * s * 0.6]; };
    const ws = words(state);
    for (let a = 0; a < 8; a++) for (let b = a + 1; b < 8; b++) if (dist(a, b) === 1) line(ctx, ...pos(a), ...pos(b), { color: c.ink, width: 2 });
    for (let k = 0; k < 8; k++) {
      const near = ws.filter((w) => dist(w, k) <= state.r).length;
      const [x, y] = pos(k);
      const isWord = ws.includes(k);
      dot(ctx, x, y, 17, isWord ? c.a : near >= 2 ? c.fillY : near === 1 ? c.fillB : c.paper, c.ink);
      label(ctx, bin(k), x, y, c, { size: 10, patch: false });
    }
    const d = ws.length > 1 ? minDist(ws) : Infinity;
    label(ctx, ws.length > 1 ? `minimum distance d = ${d}` : 'choose at least two codewords', stage.w / 2, 16, c, { size: 13, bounds: stage });
  },
  controls: (t) => [
    { title: 'Choose codewords' },
    ...[0, 1, 2, 3, 4, 5, 6, 7].map((k) => ({ key: `v${k}`, label: bin(k), toggle: true })),
    { key: 'r', label: 'Ball radius, r', min: 0, max: 2, step: 1 },
    { text: 'Ready-made codes:' },
    { row: [
      { button: '000, 111', ghost: true, onClick() { for (let k = 0; k < 8; k++) state[`v${k}`] = PRESETS.rep.includes(k); t.update(); } },
      { button: 'even weight', ghost: true, onClick() { for (let k = 0; k < 8; k++) state[`v${k}`] = PRESETS.even.includes(k); t.update(); } },
      { button: 'every word', ghost: true, onClick() { for (let k = 0; k < 8; k++) state[`v${k}`] = true; t.update(); } },
    ] },
    { readout: [
      ['Minimum distance d', (s) => { const ws = words(s); return ws.length > 1 ? String(minDist(ws)) : 'n/a'; }],
      ['Errors detected', (s) => { const ws = words(s); return ws.length > 1 ? String(minDist(ws) - 1) : 'n/a'; }],
      ['Errors corrected', (s) => { const ws = words(s); return ws.length > 1 ? String(Math.floor((minDist(ws) - 1) / 2)) : 'n/a'; }],
      ['Balls overlap?', (s) => { const ws = words(s); const bad = ws.length > 1 && [...Array(8).keys()].some((k) => ws.filter((w) => dist(w, k) <= s.r).length >= 2); return { text: bad ? 'yes: ambiguous' : 'no', good: !bad }; }],
    ] },
  ],
  tex: (s) => { const ws = words(s); return ws.length > 1 ? `d=${minDist(ws)},\\quad t=\\left\\lfloor\\frac{d-1}{2}\\right\\rfloor=${Math.floor((minDist(ws) - 1) / 2)}` : 'd=\\text{(pick two words)}'; },
});
void tool;
