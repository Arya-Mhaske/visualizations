import { createTool } from '../../lib/tool.js';
import { label } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { squeeze } from './_exp-log-math.js';

const state = { k: 4 };
const TRUE = 2 ** Math.SQRT2;

// Draw text with its agreeing leading characters in green and the rest in ink.
function split(ctx, c, text, agree, x, y) {
  ctx.save();
  ctx.font = `700 12px ${c.fontMono}`;
  ctx.textBaseline = 'middle';
  ctx.fillStyle = c.c;
  ctx.fillText(text.slice(0, agree), x, y);
  const w = ctx.measureText(text.slice(0, agree)).width;
  ctx.fillStyle = c.ink;
  ctx.fillText(text.slice(agree), x + w, y);
  ctx.restore();
}

createTool({
  state,
  label: 'A table that squeezes the number 2 to the power root 2. Each row cuts root 2 off after more decimals, then shows 2 to that rational power and 2 to the next one up. The two columns agree on more and more digits, trapping a single value.',
  draw(ctx, stage, c) {
    const x1 = 12;
    const x2 = stage.w * 0.4;
    const x3 = stage.w * 0.7;
    label(ctx, 'x (cut-off √2)', x1, 20, c, { size: 11, align: 'left', patch: false });
    label(ctx, '2ˣ below', x2, 20, c, { size: 11, align: 'left', patch: false });
    label(ctx, '2ˣ above', x3, 20, c, { size: 11, align: 'left', patch: false });
    for (let j = 0; j <= state.k; j++) {
      const s = squeeze(j);
      const a = s.fLow.toFixed(7);
      const b = s.fHigh.toFixed(7);
      let agree = 0;
      while (agree < a.length && a[agree] === b[agree]) agree++;
      const y = 48 + j * 28;
      label(ctx, s.low.toFixed(j), x1, y, c, { size: 12, align: 'left', patch: false });
      split(ctx, c, a, agree, x2, y);
      split(ctx, c, b, agree, x3, y);
    }
    label(ctx, `The one value in the squeeze: ${TRUE.toFixed(7)}…`, stage.w / 2, stage.h - 16, c, { size: 11, bounds: stage });
  },
  controls: [
    { title: 'Use more decimals of √2' },
    { key: 'k', label: 'Decimals used', min: 0, max: 8, step: 1 },
    { readout: [
      ['x below √2', (s) => squeeze(s.k).low.toFixed(s.k)],
      ['Gap between the two', (s) => squeeze(s.k).fHigh - squeeze(s.k).fLow < 1e-4 ? (squeeze(s.k).fHigh - squeeze(s.k).fLow).toExponential(1) : fixed(squeeze(s.k).fHigh - squeeze(s.k).fLow, 4)],
    ] },
  ],
  tex: (s) => `2^{${squeeze(s.k).low.toFixed(s.k)}}=${fixed(squeeze(s.k).fLow, 6)}\\ <\\ 2^{\\sqrt2}\\ <\\ 2^{${squeeze(s.k).high.toFixed(s.k)}}=${fixed(squeeze(s.k).fHigh, 6)}`,
});
