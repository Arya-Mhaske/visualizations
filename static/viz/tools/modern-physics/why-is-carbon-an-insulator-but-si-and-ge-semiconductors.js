import { createTool } from '../../lib/tool.js';
import { dot, label } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { niOf, sciText } from './_mp.js';
import { drawBands } from './_bands-view.js';

// NCERT: bonding electrons of C, Si, Ge are in the 2nd, 3rd and 4th orbit. The further out, the more loosely held
// and the smaller the gap: 5.4, 1.1 and 0.7 eV.
const ELEMENTS = [['C', 'carbon', 2, 5.4], ['Si', 'silicon', 3, 1.1], ['Ge', 'germanium', 4, 0.7]];
const state = { T: 300 };

const tool = createTool({
  state,
  label: 'Three columns for carbon, silicon and germanium. Each has an atom drawn as a nucleus with the outer bonding orbit as a circle, the larger the circle the weaker the grip, and below it a band diagram whose gap shrinks from carbon to germanium. Text under each column gives the number of carriers per cubic centimetre at the chosen temperature.',
  draw(ctx, stage, c) {
    const colW = stage.w / 3;
    ELEMENTS.forEach(([sym, , n, Eg], i) => {
      const cx = colW * (i + 0.5);
      const R = Math.min(colW * 0.42, stage.h * 0.16);
      const cy = stage.h * 0.2;
      const r = R * (n / 4);
      ctx.strokeStyle = c.ink;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
      dot(ctx, cx, cy, 6, c.fillY, c.ink, 2);
      dot(ctx, cx + r, cy, 5, c.a, c.ink, 2);
      label(ctx, `${sym}  n = ${n}`, cx, cy + R + 14, c, { size: 11, bounds: stage, patch: false });
      const ni = niOf(Eg, state.T);
      drawBands(ctx, c, { x: cx - colW * 0.36, y: stage.h * 0.4, w: colW * 0.7, h: stage.h * 0.44 }, Eg, 6, Math.round(Math.min(1, ni / 2.5e19) * 16), { names: false, size: 10 });
      label(ctx, `${Eg} eV`, cx, stage.h * 0.4 + 6, c, { size: 10, patch: false });
      label(ctx, sciText(ni), cx, stage.h * 0.92, c, { size: 10, bounds: stage, patch: false });
    });
    label(ctx, 'carriers per cm³', stage.w / 2, stage.h * 0.98 - 2, c, { size: 9, patch: false });
  },
  controls: () => [
    { title: 'Warm all three' },
    { key: 'T', label: 'Temperature', min: 200, max: 1500, step: 10, format: (v) => `${v} K` },
    { readout: ELEMENTS.map(([sym, name, n, Eg]) => [`${name}, Eg ${Eg} eV`, (s) => `${sciText(niOf(Eg, s.T))} per cm³`]).concat([
      ['Germanium ÷ silicon', (s) => `${sciText(niOf(0.7, s.T) / niOf(1.1, s.T))}`],
    ]) },
  ],
  tex: (s) => `n_i\\propto e^{-E_g/2kT}:\\ kT=${fixed(8.617e-5 * s.T, 3)}\\ \\text{eV}`,
});

tool.update();
