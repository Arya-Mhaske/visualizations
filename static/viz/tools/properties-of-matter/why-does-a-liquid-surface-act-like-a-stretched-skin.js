import { createTool } from '../../lib/tool.js';
import { line, dot, label } from '../../lib/draw.js';

const [COLS, ROWS, CUT] = [10, 6, 3];
const state = { L: 4, show: true };

createTool({
  state,
  label: 'A grid of molecules joined by bonds. The liquid is cut along a row and the bonds crossing the cut are broken. Molecules on the open surfaces have lost a neighbour and are coloured coral.',
  draw(ctx, stage, c) {
    const step = Math.min((stage.w - 40) / (COLS - 1), (stage.h - 60) / (ROWS - 1));
    const [x0, y0] = [(stage.w - step * (COLS - 1)) / 2, 22];
    const open = (col, row) => col < state.L && (row === CUT || row === CUT + 1);
    const pos = (col, row) => [x0 + col * step, y0 + row * step + (col < state.L && row > CUT ? 14 : 0)];
    for (let r = 0; r < ROWS; r++) {
      for (let k = 0; k < COLS; k++) {
        const [x, y] = pos(k, r);
        if (k + 1 < COLS) line(ctx, x, y, ...pos(k + 1, r), { color: c.ink, width: 2 });
        if (r + 1 < ROWS) {
          const broken = r === CUT && k < state.L;
          if (!broken) line(ctx, x, y, ...pos(k, r + 1), { color: c.ink, width: 2 });
          else if (state.show) line(ctx, x, y, ...pos(k, r + 1), { color: c.a, width: 2, dash: [3, 4] });
        }
      }
    }
    for (let r = 0; r < ROWS; r++) {
      for (let k = 0; k < COLS; k++) {
        const surface = r === 0 || r === ROWS - 1 || open(k, r);
        dot(ctx, ...pos(k, r), 6, surface ? c.a : c.fillB, c.ink, 2);
      }
    }
    label(ctx, 'surface molecule: 3 neighbours · bulk molecule: 4', stage.w / 2, stage.h - 10, c, { size: 11, bounds: stage, patch: false });
  },
  controls: [
    { title: 'Cut the liquid' },
    { key: 'L', label: 'Length of the cut L (molecules)', min: 1, max: 10, step: 1 },
    { key: 'show', label: 'Show the broken bonds', toggle: true },
    { readout: [
      ['Bonds broken', (s) => String(s.L)],
      ['New surface molecules', (s) => String(2 * s.L)],
      ['Energy gained', (s) => `${s.L} ε`],
      ['Energy per length', (s) => 'ε / a (same)'],
    ] },
  ],
  tex: (s) => `E=${s.L}\\varepsilon\\ \\Rightarrow\\ S=\\dfrac{E}{L\\,a}=\\dfrac{\\varepsilon}{a}`,
});
