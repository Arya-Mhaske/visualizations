import { createTool } from '../../lib/tool.js';
import { label, line } from '../../lib/draw.js';
import { fixed, sig } from '../../lib/format.js';
import { lineNm, lightColor, HC, RYD } from './_mp.js';

// 1/λ = R (1/m² − 1/n²). m picks the series (Lyman 1, Balmer 2, Paschen 3, Brackett 4, Pfund 5).
const SERIES = [[1, 'Lyman'], [2, 'Balmer'], [3, 'Paschen'], [4, 'Brackett'], [5, 'Pfund']];
const state = { m: 2, k: 1 }; // k = how many rungs above m the electron starts (n = m + k)
const TICK = (span) => (span > 1500 ? 500 : span > 400 ? 100 : span > 120 ? 50 : 10);
const nOf = (s) => s.m + s.k;
const limit = (m) => (1e9 * m * m) / RYD;

const tool = createTool({
  state,
  label: 'A wavelength axis for one series of hydrogen. Vertical lines mark the emitted wavelengths for jumps from higher levels down to the chosen level. The lines crowd together towards the series limit at the short-wavelength end. The line for the chosen jump is thicker.',
  draw(ctx, stage, c) {
    const m = state.m;
    const lo = limit(m) * 0.96;
    const hi = lineNm(m, m + 1) * 1.06;
    const x0 = 20;
    const x1 = stage.w - 20;
    const X = (nm) => x0 + ((nm - lo) / (hi - lo)) * (x1 - x0);
    const y = stage.h * 0.66;
    line(ctx, x0, y, x1, y, { color: c.ink, width: 3 });
    for (let t = Math.ceil(lo / TICK(hi - lo)) * TICK(hi - lo); t <= hi; t += TICK(hi - lo)) {
      line(ctx, X(t), y, X(t), y + 7, { color: c.ink, width: 2 });
      label(ctx, `${t}`, X(t), y + 20, c, { size: 9, bounds: stage, patch: false });
    }
    label(ctx, 'λ (nm)', x1, y + 36, c, { size: 10, align: 'right', patch: false });
    for (let n = m + 1; n <= m + 10; n++) {
      const sel = n === nOf(state);
      line(ctx, X(lineNm(m, n)), y - 8, X(lineNm(m, n)), y - (sel ? 110 : 70), { color: lightColor(c, lineNm(m, n)), width: sel ? 6 : 3 });
    }
    line(ctx, X(limit(m)), y, X(limit(m)), y - 130, { color: c.ink, width: 2, dash: [5, 4] });
    label(ctx, 'limit', X(limit(m)) + 4, y - 122, c, { size: 10, align: 'left', bounds: stage, patch: false });
    const sel = lineNm(m, nOf(state));
    label(ctx, `${fixed(sel, 1)} nm`, X(sel), y - 126, c, { size: 11, bounds: stage });
  },
  controls: () => [
    { title: 'Choose a jump' },
    { key: 'm', label: 'Lands on level m', options: SERIES.map(([m, name]) => [m, `${m} ${name}`]) },
    { key: 'k', label: 'Starts k rungs above', min: 1, max: 6, step: 1 },
    { readout: [
      ['Jump', (s) => `n = ${nOf(s)} → ${s.m}`],
      ['Wavelength λ', (s) => `${fixed(lineNm(s.m, nOf(s)), 1)} nm`],
      ['Photon energy', (s) => `${fixed(HC / lineNm(s.m, nOf(s)), 3)} eV`],
      ['Region', (s) => { const l = lineNm(s.m, nOf(s)); return l < 380 ? 'ultraviolet' : l < 750 ? 'visible' : 'infrared'; }],
      ['Series limit', (s) => `${sig(limit(s.m), 4)} nm`],
    ] },
  ],
  tex: (s) => `\\dfrac{1}{\\lambda}=R\\left(\\dfrac{1}{${s.m}^2}-\\dfrac{1}{${nOf(s)}^2}\\right)\\Rightarrow\\lambda=${fixed(lineNm(s.m, nOf(s)), 1)}\\ \\text{nm}`,
});

tool.update();
