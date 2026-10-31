import { createTool } from '../../lib/tool.js';
import { label } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { box } from './_units-measurement-math.js';

const state = { length: 16.2, width: 10.1, dl: 0.1, dw: 0.1, zoom: 6 };

createTool({
  state,
  label: 'A rectangle for the length and width, with thin strips along its top and right sides for the errors. The strips together are the error in the area.',
  draw(ctx, stage, c) {
    const out = box(state.length, state.width, state.dl, state.dw);
    const pad = 22;
    const scale = Math.min((stage.w - 2 * pad - 20) / (state.length + state.dl * state.zoom), (stage.h - 2 * pad - 50) / (state.width + state.dw * state.zoom));
    const w = state.length * scale;
    const h = state.width * scale;
    const left = pad + 20;
    const bottom = stage.h - pad - 34;
    const sw = state.dl * scale * state.zoom; // strip along the length: δL wide
    const sh = state.dw * scale * state.zoom;
    const rect = (x, y, rw, rh, fill, line = 1.5) => {
      ctx.fillStyle = fill;
      ctx.fillRect(x, y, rw, rh);
      ctx.strokeStyle = c.ink;
      ctx.lineWidth = line;
      ctx.strokeRect(x, y, rw, rh);
    };
    rect(left, bottom - h, w, h, c.fillY, c.line);
    rect(left + w, bottom - h, sw, h, c.fillA); // L δW … the strip beyond the right edge: δL × W
    rect(left, bottom - h - sh, w, sh, c.fillB); // the strip above: L × δW
    rect(left + w, bottom - h - sh, sw, sh, c.fillC); // the corner: δL × δW
    label(ctx, `L = ${state.length} ± ${state.dl} cm`, left + w / 2, bottom + 16, c, { bounds: stage, size: 12 });
    label(ctx, `W = ${state.width} ± ${state.dw} cm`, left + 4, bottom - h / 2, c, { align: 'left', bounds: stage, size: 12 });
    label(ctx, `A = ${fixed(out.area, 2)} cm²`, left + w / 2, bottom - h / 2 + 24, c, { bounds: stage, size: 13 });
    label(ctx, `errors drawn ×${state.zoom}`, stage.w - 4, 12, c, { align: 'right', bounds: stage, size: 10 });
  },
  controls: [
    { title: 'Measure a rectangle' },
    { key: 'length', label: 'Length L', min: 5, max: 20, step: 0.1, format: (v) => `${fixed(v, 1)} cm` },
    { key: 'width', label: 'Width W', min: 4, max: 14, step: 0.1, format: (v) => `${fixed(v, 1)} cm` },
    { key: 'dl', label: 'Error in L', min: 0.05, max: 0.5, step: 0.05, format: (v) => `± ${fixed(v, 2)} cm` },
    { key: 'dw', label: 'Error in W', min: 0.05, max: 0.5, step: 0.05, format: (v) => `± ${fixed(v, 2)} cm` },
    { key: 'zoom', label: 'Draw the errors bigger by', min: 1, max: 10, step: 1, format: (v) => `×${v}` },
    { readout: [
      ['δL ÷ L', (s) => `${fixed((s.dl / s.length) * 100, 2)}%`],
      ['δW ÷ W', (s) => `${fixed((s.dw / s.width) * 100, 2)}%`],
      ['Sum of the two', (s) => `${fixed(box(s.length, s.width, s.dl, s.dw).simple * 100, 2)}%`],
      ['Area', (s) => `${fixed(box(s.length, s.width, s.dl, s.dw).area, 2)} cm²`],
      ['Error in area', (s) => `± ${fixed(box(s.length, s.width, s.dl, s.dw).error, 2)} cm²`],
      ['δA ÷ A', (s) => `${fixed(box(s.length, s.width, s.dl, s.dw).relative * 100, 2)}%`],
    ] },
  ],
  tex: (s) => {
    const out = box(s.length, s.width, s.dl, s.dw);
    return `\\frac{\\delta A}{A} \\approx \\frac{\\delta L}{L} + \\frac{\\delta W}{W} = ${fixed((s.dl / s.length) * 100, 2)}\\% + ${fixed((s.dw / s.width) * 100, 2)}\\% = ${fixed(out.simple * 100, 2)}\\%`;
  },
});
