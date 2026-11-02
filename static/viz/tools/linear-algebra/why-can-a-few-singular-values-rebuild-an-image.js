import { createTool } from '../../lib/tool.js';
import { fixed } from '../../lib/format.js';
import { jacobiSVD } from './_la-math.js';

// A made-up 32 × 32 picture (not a photo): a gradient, a disc, a diagonal stripe and a square. Its singular values are computed once.
const N = 32;
const picture = Array.from({ length: N }, (_, i) => Array.from({ length: N }, (_, j) => {
  let v = 0.25 + 0.35 * (j / N);
  if ((i - 11) ** 2 + (j - 12) ** 2 < 49) v = 0.95;
  if (Math.abs(i - j - 6) < 2) v = 0.1;
  if (i > 20 && i < 29 && j > 19 && j < 28) v = 0.8;
  return v;
}));
const svd = jacobiSVD(picture);
const total = svd.s.reduce((a, v) => a + v * v, 0);
const rebuild = (k) => picture.map((_, i) => picture[0].map((__, j) => svd.s.slice(0, k).reduce((acc, s, r) => acc + s * svd.U[i][r] * svd.V[j][r], 0)));
const state = { k: 4 };
const missed = (k) => Math.sqrt(svd.s.slice(k).reduce((a, v) => a + v * v, 0) / total);

function paint(ctx, M, x0, y0, size) {
  const cell = size / N;
  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
    const g = Math.round(255 * Math.max(0, Math.min(1, M[i][j])));
    ctx.fillStyle = `rgb(${g},${g},${g})`;
    ctx.fillRect(x0 + j * cell, y0 + i * cell, cell + 0.6, cell + 0.6);
  }
}

createTool({
  state,
  label: 'A small made-up grey picture rebuilt from only its first k singular values and vectors. At k equal to 1 only a blurry blend of rows is left. As k grows the disc, stripe and square sharpen, and by a handful of terms the picture is nearly exact. The bars below show the singular values, which fall off very fast.',
  draw(ctx, stage, c) {
    const size = Math.min(stage.w * 0.62, stage.h * 0.6);
    paint(ctx, rebuild(state.k), 8, 8, size);
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 3;
    ctx.strokeRect(8, 8, size, size);
    paint(ctx, picture, size + 20, 8, stage.w - size - 28 > 20 ? Math.min(stage.w - size - 28, size * 0.45) : 0);
    ctx.font = `700 11px ${c.fontMono}`;
    ctx.fillStyle = c.ink;
    ctx.textBaseline = 'top';
    ctx.fillText(`rank ${state.k}`, 12, size + 14);
    ctx.fillText('original', size + 20, 14 + Math.min(stage.w - size - 28, size * 0.45));
    const barsTop = size + 34;
    const barsH = stage.h - barsTop - 8;
    const w = (stage.w - 16) / N;
    svd.s.forEach((s, r) => {
      const h = Math.max(1, (Math.log10(1 + s * 10) / Math.log10(1 + svd.s[0] * 10)) * barsH);
      ctx.fillStyle = r < state.k ? c.a : c.grid;
      ctx.fillRect(8 + r * w, barsTop + barsH - h, w - 2, h);
    });
    ctx.fillStyle = c.ink;
    ctx.fillText('singular values (log scale)', 8, barsTop - 14);
  },
  controls: [
    { title: 'Keep the biggest terms' },
    { key: 'k', label: 'Terms kept, k', min: 1, max: 32, step: 1, format: (n) => `${n}` },
    { readout: [
      ['Numbers stored', (s) => `${s.k * (2 * N + 1)} of ${N * N}`],
      ['Left out (share of the picture)', (s) => `${fixed(missed(s.k) * 100, 2)}%`],
      ['Largest, kth singular value', (s) => `${fixed(svd.s[0], 2)}, ${fixed(svd.s[s.k - 1], 3)}`],
    ] },
  ],
  tex: (s) => `A\\approx\\sum_{i=1}^{${s.k}}\\sigma_i\\,\\mathbf u_i\\mathbf v_i^{\\mathsf T}`,
});
