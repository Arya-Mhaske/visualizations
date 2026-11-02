import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { simpson, num } from './_ia.js';

// Poiseuille: v(r) = (ΔP / 4ηL)(R² − r²). Flow Q = ∫₀ᴿ 2πr v(r) dr = πΔP R⁴ / (8ηL). Double R: flow ×16. Made-up round numbers for a short artery.
const ETA = 0.004; // Pa·s, roughly blood
const L = 0.1; // m
const state = { R: 1.5, dP: 500 }; // mm, Pa
const v = (r) => (state.dP / (4 * ETA * L)) * ((state.R * 1e-3) ** 2 - (r * 1e-3) ** 2); // m/s, r in mm
const Q = () => simpson((r) => 2 * Math.PI * (r * 1e-3) * v(r) * 1e-3, 0, state.R, 400); // m³/s
const closed = () => (Math.PI * state.dP * (state.R * 1e-3) ** 4) / (8 * ETA * L);

createTool({
  state,
  label: 'Top: the speed of blood across the vessel, fastest in the middle and zero at the wall. Bottom: the flow carried by each thin ring, whose area is the total flow.',
  setup: (stage, c) => createPlot(stage, { x: [0, 3], y: [0, 1], c, box: (s) => ({ x: 0, y: 0, w: s.w, h: s.h * 0.5 }) }),
  draw(ctx, stage, c, plot) {
    const top = v(0);
    plot.setRange([-3.2, 3.2], [0, top * 1.15]);
    plot.axes({ xLabel: 'distance from the centre (mm)', yLabel: 'speed (m/s)' });
    plot.shade((r) => v(r), null, -state.R, state.R, c.fillB);
    plot.fn(v, { color: c.ink, width: 3, domain: [-state.R, state.R] });
    // ring flow below
    const H0 = stage.h * 0.5; const x0 = 24; const w = stage.w - 48; const ymax = Math.max(...Array.from({ length: 50 }, (_, i) => 2 * Math.PI * (state.R * i / 49) * v((state.R * i) / 49)));
    ctx.fillStyle = c.fillA; ctx.strokeStyle = c.ink; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(x0, stage.h - 24);
    for (let i = 0; i <= 80; i++) { const r = (state.R * i) / 80; ctx.lineTo(x0 + (r / 3.2) * w, stage.h - 24 - (2 * Math.PI * r * v(r) / ymax) * (stage.h - H0 - 50)); }
    ctx.lineTo(x0 + (state.R / 3.2) * w, stage.h - 24); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = c.ink; ctx.font = `12px ${c.fontMono}`;
    ctx.fillText('flow per ring: 2πr·v(r) (ring radius 0 → R)', x0, H0 + 20);
  },
  controls: [
    { title: 'Widen the vessel' },
    { key: 'R', label: 'Vessel radius R', min: 0.5, max: 3, step: 0.1, format: (x) => `${x.toFixed(1)} mm` },
    { key: 'dP', label: 'Pressure drop ΔP', min: 100, max: 1000, step: 50, format: (x) => `${x} Pa` },
    { readout: [
      ['Centre speed', () => `${num(v(0), 4)} m/s`],
      ['Flow Q (ring sum)', () => `${num(Q() * 1e6, 5)} mL/s`],
      ['Flow π ΔP R⁴ / 8ηL', () => `${num(closed() * 1e6, 5)} mL/s`],
      ['Flow if R doubled', () => `${num(closed() * 16 * 1e6, 5)} mL/s (×16)`],
    ] },
  ],
  tex: () => 'Q=\\int_0^{R}2\\pi r\\,v(r)\\,dr=\\frac{\\pi\\,\\Delta P\\,R^4}{8\\eta L}',
});
