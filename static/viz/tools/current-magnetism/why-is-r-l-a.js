import { createTool } from '../../lib/tool.js';
import { line, label, arrow } from '../../lib/draw.js';
import { sig } from '../../lib/format.js';
import { R_UNIT, strip, block } from './_resistance-temperature-math.js';

const state = { l: 4, A: 3 };

const tool = createTool({
  state,
  label: 'A block of material made of unit blocks. Its length l is the number of blocks in a row, in series. Its cross-section A is the number of rows side by side, in parallel. The first row is coloured coral.',
  draw(ctx, stage, c) {
    const s = Math.min((stage.w - 70) / 8, (stage.h - 110) / 6);
    const gridW = state.l * s;
    const gridH = state.A * s;
    const x0 = (stage.w - gridW) / 2;
    const y0 = (stage.h - gridH) / 2 + 6;
    for (let j = 0; j < state.A; j++) {
      for (let i = 0; i < state.l; i++) {
        ctx.fillStyle = j === 0 ? c.fillA : c.fillB;
        ctx.fillRect(x0 + i * s, y0 + j * s, s, s);
        ctx.strokeStyle = c.ink;
        ctx.lineWidth = 3;
        ctx.strokeRect(x0 + i * s, y0 + j * s, s, s);
      }
    }
    // the two ends of the block, where the cell is joined on
    line(ctx, x0 - 8, y0 - 4, x0 - 8, y0 + gridH + 4, { color: c.ink, width: 6 });
    line(ctx, x0 + gridW + 8, y0 - 4, x0 + gridW + 8, y0 + gridH + 4, { color: c.ink, width: 6 });
    arrow(ctx, x0 - 8 - Math.min(26, x0 - 12), y0 + gridH / 2, x0 - 12, y0 + gridH / 2, { color: c.a });
    label(ctx, `l = ${state.l} blocks in series`, stage.w / 2, y0 - 16, c, { color: c.ink });
    label(ctx, `A = ${state.A} in parallel`, stage.w / 2, y0 + gridH + 20, c, { color: c.ink });
  },
  controls: () => [
    { title: 'Shape the block' },
    { key: 'l', label: 'Length, l', min: 1, max: 8, step: 1, format: (n) => `${n} blocks` },
    { key: 'A', label: 'Cross-section, A', min: 1, max: 6, step: 1, format: (n) => `${n} blocks` },
    { readout: [
      ['One strip (series)', (s) => `${s.l} × ${R_UNIT} = ${strip(s.l)} Ω`],
      ['Strips side by side', (s) => `${s.A} in parallel`],
      ['Whole block, R', (s) => `${sig(block(s.l, s.A), 3)} Ω`],
    ] },
  ],
  tex: (s) => `R=\\dfrac{${s.l}\\times ${R_UNIT}}{${s.A}}=${sig(block(s.l, s.A), 3)}\\ \\Omega\\qquad R\\propto\\dfrac{l}{A}`,
});
tool.update();
