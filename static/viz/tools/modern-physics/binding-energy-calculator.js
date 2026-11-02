import { createTool } from '../../lib/tool.js';
import { label } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { NUCLIDES, nuclide, partsMass, massDefect, bindingMeV, U_MEV, M_H, M_N } from './_nucleus.js';

const state = { key: 'He4' };
const perNucleon = (n) => bindingMeV(n) / n.A;

const tool = createTool({
  state,
  label: 'A bar chart of binding energy per nucleon for nine nuclei, one bar each. The chosen nucleus has a coral bar and the rest are blue. Iron has the longest bar.',
  draw(ctx, stage, c) {
    const rowH = (stage.h - 20) / NUCLIDES.length;
    const x0 = stage.w * 0.4;
    const wMax = stage.w - x0 - 40;
    NUCLIDES.forEach((n, i) => {
      const y = 10 + i * rowH;
      const v = perNucleon(n);
      ctx.fillStyle = n.key === state.key ? c.a : c.fillB;
      ctx.strokeStyle = c.ink;
      ctx.lineWidth = 3;
      ctx.fillRect(x0, y + 3, (wMax * v) / 9, rowH - 6);
      ctx.strokeRect(x0, y + 3, (wMax * v) / 9, rowH - 6);
      label(ctx, n.name, x0 - 8, y + rowH / 2, c, { size: 10, align: 'right', patch: false });
      label(ctx, fixed(v, 2), x0 + (wMax * v) / 9 + 6, y + rowH / 2, c, { size: 10, align: 'left', patch: false });
    });
  },
  controls: () => [
    { title: 'Weigh the parts and the nucleus' },
    { key: 'key', label: 'Nucleus', options: NUCLIDES.map((n) => [n.key, n.name.split(' ')[1]]) },
    { readout: [
      ['Z protons (as H atoms)', (s) => `${nuclide(s.key).Z} × ${M_H}`],
      ['N neutrons', (s) => `${nuclide(s.key).A - nuclide(s.key).Z} × ${M_N}`],
      ['Mass of the parts', (s) => `${fixed(partsMass(nuclide(s.key)), 5)} u`],
      ['Mass of the atom', (s) => `${fixed(nuclide(s.key).M, 5)} u`],
      ['Δm', (s) => `${fixed(massDefect(nuclide(s.key)), 5)} u`],
      ['Binding energy', (s) => `${fixed(bindingMeV(nuclide(s.key)), 1)} MeV`],
      ['Per nucleon', (s) => `${fixed(perNucleon(nuclide(s.key)), 2)} MeV`],
    ] },
  ],
  tex: (s) => { const n = nuclide(s.key); return `B=\\Delta m\\,c^2=${fixed(massDefect(n), 5)}\\ \\text{u}\\times${U_MEV}\\ \\dfrac{\\text{MeV}}{\\text{u}}=${fixed(bindingMeV(n), 1)}\\ \\text{MeV}`; },
});

tool.update();
