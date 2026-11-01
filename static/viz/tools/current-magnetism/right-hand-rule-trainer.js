import { createDrill } from '../../lib/drill.js';
import { arrow, dot, label, line } from '../../lib/draw.js';
import { cross } from './_magnetic-force-on-charges-math.js';

// Directions on the page: x right, y up, z out of the page.
const DIRS = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
const NAMES = ['Right', 'Left', 'Up', 'Down', 'Out of the page', 'Into the page'];
const WORD = ['to the right', 'to the left', 'up the page', 'down the page', 'out of the page', 'into the page'];
const index = (v) => DIRS.findIndex((d) => d[0] === v[0] && d[1] === v[1] && d[2] === v[2]);

// the symbol for an out-of-page (⊙) or into-page (⊗) vector at a point
function through(ctx, x, y, out, color, c) {
  ctx.beginPath();
  ctx.arc(x, y, 11, 0, Math.PI * 2);
  ctx.fillStyle = c.paper;
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.stroke();
  if (out) dot(ctx, x, y, 3.5, color, color, 1);
  else {
    line(ctx, x - 6, y - 6, x + 6, y + 6, { color, width: 3 });
    line(ctx, x - 6, y + 6, x + 6, y - 6, { color, width: 3 });
  }
}

function vectorAt(ctx, x, y, d, len, color, c) {
  if (d[2] !== 0) through(ctx, x, y, d[2] > 0, color, c);
  else arrow(ctx, x, y, x + d[0] * len, y - d[1] * len, { color, width: 4 });
}

createDrill({
  stage: document.querySelector('#stage'),
  panel: document.querySelector('#panel'),
  seed: 5,
  generate(rng) {
    const vi = rng.int(0, 5);
    const axis = Math.floor(vi / 2);
    const choices = [0, 1, 2, 3, 4, 5].filter((i) => Math.floor(i / 2) !== axis);
    const bi = rng.pick(choices);
    const q = rng.pick([1, -1]);
    const v = DIRS[vi];
    const B = DIRS[bi];
    const raw = cross(v, B);
    const F = raw.map((x) => q * x + 0);
    const answer = index(F);
    return {
      prompt: `A ${q > 0 ? 'positive' : 'negative'} charge moves ${WORD[vi]} in a field pointing ${WORD[bi]}. Which way is the force on it?`,
      options: NAMES,
      answer,
      hint: 'Point your fingers along v, curl them towards B. Your thumb gives v × B. Flip it for a negative charge.',
      explain: `v × B points ${WORD[index(raw.map((x) => x + 0))]}. ${q > 0 ? 'The charge is positive, so F points the same way.' : 'The charge is negative, so F is the opposite way.'} F is ${WORD[answer]}.`,
      alt: 'The charge at the centre with its velocity in coral, and the magnetic field in blue.',
      figure(ctx, stage, c) {
        const cx = stage.w / 2;
        const cy = stage.h / 2;
        const len = Math.min(stage.w, stage.h) * 0.28;
        // the field, drawn as a few copies
        const spots = [[0.18, 0.2], [0.82, 0.2], [0.18, 0.8], [0.82, 0.8]];
        for (const [fx, fy] of spots) vectorAt(ctx, stage.w * fx, stage.h * fy, B, len * 0.6, c.b, c);
        label(ctx, 'B', stage.w * 0.18, stage.h * 0.2 - 22, c, { color: c.b, size: 12 });
        vectorAt(ctx, cx, cy, v, len, c.a, c);
        dot(ctx, cx, cy, 12, c.fillY, c.ink);
        label(ctx, q > 0 ? '+' : '−', cx, cy, c, { color: c.ink, size: 14, patch: false });
        label(ctx, 'v', cx + v[0] * len * 0.55 + (v[2] ? 24 : 0), cy - v[1] * len * 0.55 - 14, c, { color: c.a, size: 12 });
      },
    };
  },
});
