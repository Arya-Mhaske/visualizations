import { createTool } from '../../lib/tool.js';
import { dot, label, arrow } from '../../lib/draw.js';
import { sig } from '../../lib/format.js';
import { C } from './_mp.js';
import { drawRuler } from './_matter-waves-view.js';

// 4 ¹H → ⁴He. Atomic masses: 4 × 1.007825 − 4.002603 = 0.028697 u (26.73 MeV, counting the positron annihilation).
// Sun: L = 3.8e26 W, M = 2.0e30 kg.
const L = 3.8e26;
const Q_MEV = 26.73;
const Q_J = Q_MEV * 1.602e-13;
const M_H_KG = 1.6735e-27;
const M_HE_KG = 6.6465e-27;
const SUN = 2.0e30;
const YEAR = 3.156e7;
const state = { lt: 17.16 };
const t = (s) => 10 ** s.lt;
const rate = () => L / Q_J; // reactions per second
const hBurnt = (s) => rate() * 4 * M_H_KG * t(s);
const heMade = (s) => rate() * M_HE_KG * t(s);
const lost = (s) => (L / (C * C)) * t(s);
const FRAC = (4 * 1.007825 - 4.002603) / (4 * 1.007825);

const tool = createTool({
  state,
  label: 'Top: four small hydrogen dots merge into one helium dot, and a thin coral arrow shows the 0.7 per cent of the mass that leaves as light. Bottom: a time ruler in powers of ten of seconds with a marker for how long the Sun has been burning.',
  draw(ctx, stage, c) {
    const y = stage.h * 0.2;
    for (let i = 0; i < 4; i++) dot(ctx, stage.w * 0.1 + (i % 2) * 24, y - 12 + Math.floor(i / 2) * 24, 9, c.fillB, c.ink);
    arrow(ctx, stage.w * 0.28, y, stage.w * 0.46, y, { color: c.ink, width: 3 });
    dot(ctx, stage.w * 0.58, y, 17, c.fillC, c.ink);
    label(ctx, 'He', stage.w * 0.58, y, c, { size: 11, patch: false });
    arrow(ctx, stage.w * 0.66, y, stage.w * 0.9, y - 22, { color: c.a, width: 2, head: 7 });
    label(ctx, 'light', stage.w * 0.86, y + 10, c, { size: 10, bounds: stage, patch: false });
    label(ctx, '4 H', stage.w * 0.1 + 12, y + 38, c, { size: 10, patch: false });
    label(ctx, `${sig(FRAC * 100, 2)}% of the mass lost`, stage.w * 0.5, y + 40, c, { size: 11, bounds: stage, patch: false });
    drawRuler(ctx, c, stage, {
      lo: 0, hi: 18, step: 3, y: 0.68, caption: 'time (s)',
      marks: [
        { e: Math.log10(86400), text: '1 day', fill: c.c, up: true },
        { e: Math.log10(YEAR), text: '1 year', fill: c.c, up: true, high: true },
        { e: Math.log10(4.6e9 * YEAR), text: 'Sun’s age', fill: c.c, up: true },
        { e: state.lt, text: `now ${sig(t(state), 2)} s`, fill: c.a, up: false },
      ],
    });
  },
  controls: () => [
    { title: 'Let the Sun burn' },
    { key: 'lt', label: 'Time, log₁₀ seconds', min: 0, max: 18, step: 0.01, format: (v) => (10 ** v >= YEAR ? `${sig((10 ** v) / YEAR, 3)} years` : `${sig(10 ** v, 3)} s`) },
    { readout: [
      ['Reactions each second', () => sig(rate(), 3)],
      ['Hydrogen fused', (s) => `${sig(hBurnt(s), 3)} kg`],
      ['Helium made', (s) => `${sig(heMade(s), 3)} kg`],
      ['Mass turned to light', (s) => `${sig(lost(s), 3)} kg`],
      ['Share of Sun’s mass fused', (s) => `${sig((hBurnt(s) / SUN) * 100, 2)}%`],
    ] },
  ],
  tex: (s) => `\\Delta m=\\dfrac{L\\,t}{c^2}=${sig(lost(s), 3)}\\ \\text{kg}\\quad(L=3.8\\times10^{26}\\ \\text{W})`,
});

tool.update();
