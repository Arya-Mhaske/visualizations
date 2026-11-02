import { createTool } from '../../lib/tool.js';
import { dot, label, poly } from '../../lib/draw.js';
import { specFill } from './_aa-view.js';

// A symmetry carries the labelled corners onto the corners again. A corner can go to any of n places (turns)
// and the ring can then be read either way round (flip): n × 2 = 2n arrangements, and no others.
const state = { n: 5, k: 1, flip: false };
export const arrangement = (n, k, flip) => {
  const out = [];
  for (let i = 0; i < n; i++) out[(((flip ? -i : i) + k) % n + n) % n] = i;
  return out;
};

function drawPolygon(ctx, c, cx, cy, R, arr, size, mark) {
  const n = arr.length;
  const corners = [...Array(n).keys()].map((j) => [cx + R * Math.cos(-Math.PI / 2 - (2 * Math.PI * j) / n), cy + R * Math.sin(-Math.PI / 2 - (2 * Math.PI * j) / n)]);
  poly(ctx, corners, { fill: mark ? c.fillY : c.paper, stroke: c.ink, width: size > 12 ? 3 : 2 });
  arr.forEach((lab, j) => {
    const [x, y] = corners[j];
    dot(ctx, x, y, size, specFill(c, lab), c.ink, size > 12 ? 2.5 : 1.5);
    if (size >= 9) label(ctx, String(lab + 1), x, y, c, { size: Math.round(size * 0.9), patch: false });
  });
}

createTool({
  state,
  label: 'A big polygon showing the chosen symmetry, with every one of the 2n symmetries in small polygons below: n turns in the top row and n flips in the bottom row. The corners are numbered so you can see where each one went.',
  draw(ctx, stage, c) {
    const n = state.n;
    const k = state.k % n;
    drawPolygon(ctx, c, stage.w / 2, stage.h * 0.27, Math.min(stage.h * 0.2, stage.w * 0.3), arrangement(n, k, state.flip), 13, false);
    label(ctx, `${state.flip ? 'flip, then ' : ''}turn by ${k} × ${(360 / n).toFixed(0)}° = ${((360 * k) / n).toFixed(0)}°`, stage.w / 2, 14, c, { size: 12, bounds: stage });
    const cell = (stage.w - 8) / n;
    const R = Math.min(cell * 0.34, stage.h * 0.09);
    [false, true].forEach((flip, row) => {
      for (let j = 0; j < n; j++) {
        drawPolygon(ctx, c, 4 + cell * (j + 0.5), stage.h * (row ? 0.88 : 0.67), R, arrangement(n, j, flip), Math.max(5, R * 0.33), flip === state.flip && j === k);
      }
    });
    label(ctx, `${n} turns`, stage.w - 40, stage.h * 0.67 - R - 10, c, { size: 10, bounds: stage });
    label(ctx, `${n} flips`, stage.w - 40, stage.h * 0.88 - R - 10, c, { size: 10, bounds: stage });
  },
  controls: [
    { title: 'Move the polygon' },
    { key: 'n', label: 'Sides, n', min: 3, max: 8, step: 1 },
    { key: 'k', label: 'Turn by k steps', min: 0, max: 7, step: 1, format: (v) => String(v % state.n) },
    { key: 'flip', label: 'Flip it over first', toggle: true },
    { readout: [
      ['Symmetries', (s) => `${s.n} turns + ${s.n} flips = ${2 * s.n}`],
      ['Ways to arrange the labels', (s) => String([...Array(s.n).keys()].reduce((p, i) => p * (i + 1), 1))],
      ['All 2n distinct?', (s) => { const set = new Set(); for (let j = 0; j < s.n; j++) for (const f of [false, true]) set.add(arrangement(s.n, j, f).join()); return { text: set.size === 2 * s.n ? 'yes' : 'no', good: set.size === 2 * s.n }; }],
    ] },
  ],
  tex: (s) => `|D_{${s.n}}|=2\\cdot ${s.n}=${2 * s.n}`,
});
