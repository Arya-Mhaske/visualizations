import { createTool } from '../../lib/tool.js';
import { arrow, label } from '../../lib/draw.js';

const state = { cuts: 1 };
const TOTAL = 8; // tiny dipoles along the bar

const tool = createTool({
  state,
  label: 'A bar magnet cut into pieces. Each piece has its own north pole in coral and south pole in blue at its ends, and a row of small arrows showing the tiny magnets inside it all pointing to the right.',
  draw(ctx, stage, c) {
    const pieces = state.cuts + 1;
    const gap = 14;
    const x0 = 24;
    const total = stage.w - 48 - gap * (pieces - 1);
    const w = total / pieces;
    const h = Math.min(90, stage.h * 0.3);
    const y = stage.h / 2 - h / 2;
    for (let i = 0; i < pieces; i++) {
      const x = x0 + i * (w + gap);
      ctx.lineWidth = 3;
      ctx.strokeStyle = c.ink;
      ctx.fillStyle = c.fillB;
      ctx.fillRect(x, y, w / 2, h);
      ctx.fillStyle = c.fillA;
      ctx.fillRect(x + w / 2, y, w / 2, h);
      ctx.strokeRect(x, y, w, h);
      if (w > 34) {
        label(ctx, 'S', x + w * 0.2, y + h / 2, c, { color: c.ink, size: 13, patch: false });
        label(ctx, 'N', x + w * 0.8, y + h / 2, c, { color: c.ink, size: 13, patch: false });
      }
      // the tiny magnets: one arrow per eighth of the bar that falls in this piece
      const first = Math.round((i / pieces) * TOTAL);
      const last = Math.round(((i + 1) / pieces) * TOTAL);
      const n = Math.max(1, last - first);
      for (let k = 0; k < n; k++) {
        const ax = x + (w * (k + 0.5)) / n;
        arrow(ctx, ax - Math.min(14, w / n / 2 - 2), y + h + 22, ax + Math.min(14, w / n / 2 - 2), y + h + 22, { color: c.ink, width: 3, head: 8 });
      }
    }
    label(ctx, 'tiny atomic magnets, each pointing S → N', stage.w / 2, y + h + 50, c, { color: c.ink, size: 11 });
    label(ctx, `${pieces} piece${pieces > 1 ? 's' : ''}, ${pieces} north pole${pieces > 1 ? 's' : ''} and ${pieces} south pole${pieces > 1 ? 's' : ''}`, stage.w / 2, y - 24, c, { color: c.ink, size: 13 });
  },
  controls: () => [
    { title: 'Keep cutting' },
    { key: 'cuts', label: 'Number of cuts', min: 0, max: 5, step: 1 },
    { readout: [
      ['Pieces', (s) => `${s.cuts + 1}`],
      ['Poles on each piece', () => '1 north + 1 south'],
      ['North poles alone?', () => ({ text: 'never: always paired', good: false })],
    ] },
  ],
  tex: () => '\\text{every piece: } N\\ \\text{and}\\ S',
});
tool.update();
