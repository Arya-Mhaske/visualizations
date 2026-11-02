import { createTool } from '../../lib/tool.js';
import { arrow, dot, label } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { photonEv, lightColor } from './_mp.js';

// One photon's energy hv is split: phi0 to get out, the rest is kinetic. Deeper electrons pay extra on the way.
const state = { nm: 300, phi: 2.3 };

const tool = createTool({
  state,
  label: 'A stacked bar for one photon\'s energy. The lower block, blue, is the work function the electron must pay to leave. The upper block, coral, is what is left as kinetic energy. On the right, four electrons at different depths each leave with less kinetic energy than the surface electron, because they also pay to climb out.',
  draw(ctx, stage, c) {
    const { w, h } = stage;
    const E = photonEv(state.nm);
    const phi = state.phi;
    const max = 5;
    const top = 28;
    const bottom = h - 24;
    const y = (e) => bottom - ((bottom - top) * e) / max;
    const x = w * 0.1;
    const bw = w * 0.2;
    const paid = Math.min(E, phi);
    ctx.lineWidth = 3;
    ctx.strokeStyle = c.ink;
    ctx.fillStyle = c.fillB;
    ctx.fillRect(x, y(paid), bw, bottom - y(paid));
    ctx.strokeRect(x, y(paid), bw, bottom - y(paid));
    if (E > phi) {
      ctx.fillStyle = c.fillA;
      ctx.fillRect(x, y(E), bw, y(phi) - y(E));
      ctx.strokeRect(x, y(E), bw, y(phi) - y(E));
      label(ctx, 'K_max', x + bw / 2, (y(E) + y(phi)) / 2, c, { size: 11 });
    }
    label(ctx, 'φ₀', x + bw / 2, (y(paid) + bottom) / 2, c, { size: 11 });
    label(ctx, `hν = ${fixed(E, 2)} eV`, x + bw / 2, y(Math.min(E, max)) - 14, c, { size: 11, bounds: stage, patch: false });
    // electrons from different depths
    const depths = [0, 0.4, 0.8, 1.2];
    const x0 = w * 0.42;
    label(ctx, 'electrons from deeper down', (x0 + w) / 2, 14, c, { size: 10, bounds: stage, patch: false });
    depths.forEach((d, i) => {
      const cx = x0 + 18 + ((w - x0 - 36) * (i + 0.5)) / depths.length;
      const kk = Math.max(0, E - phi - d);
      const L = 12 + 70 * Math.sqrt(kk / 2.5);
      const start = bottom - 20 - d * 30;
      dot(ctx, cx, start, 6, c.paper, c.ink);
      if (E - phi - d > 0) arrow(ctx, cx, start - 8, cx, Math.max(30, start - 8 - L), { color: c.a, width: 3, head: 8 });
      label(ctx, d === 0 ? 'surface' : `−${fixed(d, 1)} eV`, cx, bottom + 8, c, { size: 9, bounds: stage, patch: false });
      label(ctx, E - phi - d > 0 ? `${fixed(kk, 2)}` : 'stuck', cx, start + 18, c, { size: 10, bounds: stage, patch: false });
    });
    ctx.fillStyle = c.ink;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(x0, bottom);
    ctx.lineTo(w - 10, bottom);
    ctx.stroke();
    ctx.setLineDash([]);
  },
  controls: () => [
    { title: 'Spend one photon' },
    { key: 'nm', label: 'Wavelength', min: 200, max: 700, step: 10, format: (v) => `${v} nm` },
    { key: 'phi', label: 'Work function, φ₀', min: 1.5, max: 5, step: 0.05, format: (v) => `${fixed(v, 2)} eV` },
    { readout: [
      ['Photon energy, hν', (s) => `${fixed(photonEv(s.nm), 2)} eV`],
      ['Spent leaving, φ₀', (s) => `${fixed(Math.min(photonEv(s.nm), s.phi), 2)} eV`],
      ['K_max = hν − φ₀', (s) => `${fixed(Math.max(0, photonEv(s.nm) - s.phi), 2)} eV`],
    ] },
  ],
  tex: (s) => {
    const E = photonEv(s.nm);
    return `K_{max}=h\\nu-\\phi_0=${fixed(E, 2)}-${fixed(s.phi, 2)}=${fixed(Math.max(0, E - s.phi), 2)}\\ \\text{eV}`;
  },
});

tool.update();
