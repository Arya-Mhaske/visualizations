import { createTool } from '../../lib/tool.js';
import { label } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { niOf, NC, sciText } from './_mp.js';
import { drawBands } from './_bands-view.js';

// At 300 K. Dots: of 24 bonding electrons shown, how many cross (rounded from the exact fraction n_i / 2.5e19).
const state = { Eg: 1.1 };
const kind = (Eg) => (Eg <= 0.05 ? 'metal' : Eg <= 3 ? 'semiconductor' : 'insulator');
const crossed = (Eg) => Math.round(24 * Math.min(1, niOf(Eg, 300) / NC));

const tool = createTool({
  state,
  label: 'Two blocks, a valence band below and a conduction band above, with a gap between them whose height you set. Electrons that have crossed the gap are coral dots in the upper block, with open circles left in the lower block. A small gap lets many cross, a medium gap almost none, and a large gap none at all.',
  draw(ctx, stage, c) {
    const rect = { x: stage.w * 0.14, y: 12, w: stage.w * 0.72, h: stage.h - 40 };
    drawBands(ctx, c, rect, state.Eg, 8, crossed(state.Eg));
    label(ctx, `${kind(state.Eg)}`, stage.w / 2, stage.h - 10, c, { size: 12, bounds: stage, patch: false });
  },
  controls: () => [
    { title: 'Set the gap, at 300 K' },
    { key: 'Eg', label: 'Band gap Eg', min: 0, max: 8, step: 0.05, format: (v) => `${fixed(v, 2)} eV` },
    { readout: [
      ['Material type', (s) => kind(s.Eg)],
      ['Electrons in the upper band', (s) => (s.Eg <= 0.05 ? '≈ 10²² per cm³ (bands touch)' : `${sciText(niOf(s.Eg, 300))} per cm³`)],
      ['Out of every valence electron', (s) => (s.Eg <= 0.05 ? 'about 1 in 1' : `1 in ${sciText(5e22 / niOf(s.Eg, 300))}`)],
      ['Silicon for comparison', () => `Eg = 1.1 eV, ${sciText(niOf(1.1, 300))} per cm³`],
    ] },
  ],
  tex: (s) => `n_i\\propto e^{-E_g/2kT}:\\ E_g=${fixed(s.Eg, 2)}\\ \\text{eV},\\ 2kT=0.052\\ \\text{eV}`,
});

tool.update();
