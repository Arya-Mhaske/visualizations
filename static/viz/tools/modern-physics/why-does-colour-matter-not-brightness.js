import { createTool } from '../../lib/tool.js';
import { arrow, dot, label } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { photonEv, kmax, lightColor, phiOf, thresholdNm } from './_mp.js';
import { bar } from './_mp-view.js';

// Sodium plate, phi = 2.75 eV. Red and bright against UV and dim.
const PHI = phiOf('Na');
const state = { nm: 680, n: 8 };

const tool = createTool({
  state,
  label: 'A sodium plate along the bottom of the stage. Photons arrive as arrows from the upper left, one per unit of brightness, coloured by wavelength. If one photon carries enough energy an electron leaves up and to the right from where it landed, with a longer arrow for more kinetic energy. On the right, a bar shows one photon\'s energy against the work function line.',
  draw(ctx, stage, c) {
    const { w, h } = stage;
    const side = w * 0.66;
    const top = h * 0.72;
    const E = photonEv(state.nm);
    const K = kmax(E, PHI);
    ctx.fillStyle = c.fillB;
    ctx.fillRect(8, top, side - 8, h * 0.16);
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 3;
    ctx.strokeRect(8, top, side - 8, h * 0.16);
    label(ctx, 'sodium plate', side / 2, top + h * 0.08, c, { size: 11, patch: false });
    const col = lightColor(c, state.nm);
    for (let i = 0; i < state.n; i++) {
      const x = 28 + ((i + 0.5) / state.n) * (side - 90);
      arrow(ctx, x - 34, top - 60, x, top - 2, { color: col, width: 3, head: 8 });
      if (K > 0) {
        const L = Math.min(top - 14, 22 + 60 * Math.sqrt(K / 1.5));
        const ex = x + L * 0.5;
        const ey = top - 4 - L * 0.9;
        arrow(ctx, x + 2, top - 4, ex, ey, { color: c.a, width: 2, head: 7 });
        dot(ctx, ex, ey, 5, c.a, c.ink, 2);
      }
    }
    // one photon's energy against the escape cost
    const rect = { x: w * 0.74, y: h * 0.12, w: w * 0.2, h: h * 0.74 };
    const max = 5;
    bar(ctx, c, { ...rect, h: rect.h }, Math.min(E, max), max, col);
    const yPhi = rect.y + rect.h - (rect.h * PHI) / max;
    ctx.strokeStyle = c.ink;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(rect.x - 10, yPhi);
    ctx.lineTo(rect.x + rect.w + 10, yPhi);
    ctx.stroke();
    ctx.setLineDash([]);
    label(ctx, 'φ₀', rect.x - 14, yPhi, c, { size: 11, bounds: stage });
    label(ctx, 'one photon, hν', rect.x + rect.w / 2, rect.y - 12, c, { size: 10, bounds: stage, patch: false });
    if (K > 0) label(ctx, 'K', rect.x + rect.w / 2, (yPhi + rect.y + rect.h - (rect.h * Math.min(E, max)) / max) / 2, c, { size: 11 });
  },
  controls: () => [
    { title: 'Shine light on sodium' },
    { key: 'nm', label: 'Colour (wavelength)', min: 250, max: 750, step: 10, format: (v) => `${v} nm` },
    { key: 'n', label: 'Brightness (photons)', min: 1, max: 12, step: 1 },
    { readout: [
      ['One photon, hν', (s) => `${fixed(photonEv(s.nm), 2)} eV`],
      ['Escape cost, φ₀', () => `${fixed(PHI, 2)} eV`],
      ['Electrons freed', (s) => (photonEv(s.nm) >= PHI ? s.n : 0)],
      ['K_max', (s) => `${fixed(kmax(photonEv(s.nm), PHI), 2)} eV`],
      ['Total light energy', (s) => `${fixed(s.n * photonEv(s.nm), 1)} eV`],
      ['Threshold colour', () => `${Math.round(thresholdNm(PHI))} nm`],
    ] },
  ],
  tex: (s) => {
    const E = photonEv(s.nm);
    return `h\\nu=${fixed(E, 2)}\\ \\text{eV}\\ ${E >= PHI ? '\\geq' : '<'}\\ \\phi_0=${fixed(PHI, 2)}\\ \\text{eV}`;
  },
});

tool.update();
