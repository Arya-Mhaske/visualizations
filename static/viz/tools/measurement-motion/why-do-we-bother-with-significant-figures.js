import { createTool } from '../../lib/tool.js';
import { label, line, dot } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { INSTRUMENTS, LENGTH_CM, LENGTH_UNITS, readingCounts, readingIn, sigFigs, sigMask } from './_units-measurement-math.js';

const state = { instrument: 3, unit: 'cm' };
const shiftOf = () => LENGTH_UNITS.find(([name]) => name === state.unit)[1];
const written = () => readingIn(state.instrument, shiftOf());
const TEX_UNIT = { 'µm': '\\mu\\text{m}' };
const texUnit = (u) => TEX_UNIT[u] || `\\text{${u}}`;

createTool({
  state,
  label: 'A ruler scale zoomed to the instrument\'s smallest division, and below it the reading written as digit boxes. Boxes that are reliable digits are green; boxes that only hold the place are blank.',
  draw(ctx, stage, c) {
    const d = state.instrument;
    const counts = readingCounts(d);
    const y = stage.h * 0.22;
    const x0 = 20;
    const x1 = stage.w - 20;
    const at = (k) => x0 + ((k + 5.5) / 11) * (x1 - x0);
    line(ctx, x0, y, x1, y, { color: c.ink, width: 3 });
    for (let k = -5; k <= 5; k++) {
      line(ctx, at(k), y - 9, at(k), y + 9, { color: c.ink, width: 2 });
      if (k % 2 === 0) label(ctx, fixed((counts + k) / 10 ** d, d), at(k), y + 24, c, { size: 10, bounds: stage });
    }
    dot(ctx, at((LENGTH_CM * 10 ** d) - counts), y, 7, c.a, c.ink);
    label(ctx, 'red dot: the true length', stage.w / 2, y - 34, c, { size: 11, bounds: stage });
    label(ctx, `nearest mark: ${fixed(10 ** -d, d)} cm`, stage.w / 2, y - 18, c, { size: 11, bounds: stage });

    const text = written();
    const mask = sigMask(text);
    const size = Math.min(40, (stage.w - 20) / text.length);
    const left = (stage.w - size * text.length) / 2;
    const top = stage.h * 0.5;
    [...text].forEach((ch, i) => {
      const lit = mask[i];
      ctx.fillStyle = lit === null ? c.paper : lit ? c.fillC : c.paper;
      ctx.fillRect(left + i * size, top, size, size * 1.2);
      ctx.strokeStyle = c.ink;
      ctx.lineWidth = lit ? c.line : 1.5;
      ctx.strokeRect(left + i * size, top, size, size * 1.2);
      label(ctx, ch, left + (i + 0.5) * size, top + size * 0.6, c, { size: Math.round(size * 0.55), patch: false, color: lit === false ? c.grid : c.ink });
    });
    label(ctx, `${text} ${state.unit}`, stage.w / 2, top + size * 1.2 + 26, c, { size: 14, bounds: stage });
    label(ctx, `${sigFigs(text)} significant figures`, stage.w / 2, top + size * 1.2 + 52, c, { size: 14, bounds: stage });
  },
  controls: [
    { title: 'Same length, different unit' },
    { key: 'instrument', label: 'Instrument', options: INSTRUMENTS.map((item) => [item.decimals, item.name]) },
    { key: 'unit', label: 'Write it in', options: LENGTH_UNITS.map(([name]) => [name, name]) },
    { readout: [
      ['Least count', (s) => `${fixed(10 ** -s.instrument, s.instrument)} cm`],
      ['In centimetres', (s) => `${readingIn(s.instrument, 0)} cm`],
      ['Written as', (s) => `${written()} ${s.unit}`],
      ['Significant figures', () => ({ text: String(sigFigs(written())), good: true })],
    ] },
  ],
  tex: (s) => `${readingIn(s.instrument, 0)}\\ \\text{cm} = ${written()}\\ ${texUnit(s.unit)}\\quad\\Rightarrow\\ ${sigFigs(written())}\\ \\text{significant figures}`,
});
