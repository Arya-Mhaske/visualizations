import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { simpson, num } from './_ia.js';

// A thin plate with density ρ(x) along its length rests on a pin at p. Net turning effect = ∫ (x − p) ρ(x) dx. It balances where this is 0: p = ∫xρ / ∫ρ.
const SHAPES = {
  flat: { name: 'Uniform plate', rho: () => 1 },
  ramp: { name: 'Heavier on the right', rho: (x) => 0.3 + x / 5 },
  two: { name: 'Two heavy ends', rho: (x) => 0.3 + 2 * Math.exp(-((x - 0.5) ** 2) / 0.1) + 2 * Math.exp(-((x - 9.5) ** 2) / 0.1) },
  hump: { name: 'Heavy middle-left lump', rho: (x) => 0.2 + 2.5 * Math.exp(-((x - 3) ** 2) / 0.8) },
};
const state = { shape: 'ramp', pin: 5 };
const K = () => SHAPES[state.shape];
const mass = () => simpson(K().rho, 0, 10, 600);
const centre = () => simpson((x) => x * K().rho(x), 0, 10, 600) / mass();
const torque = () => simpson((x) => (x - state.pin) * K().rho(x), 0, 10, 600);

createTool({
  state,
  label: 'The density of a plate along its length, as a shaded curve. A triangular pin supports it at a chosen point. A tilting beam above shows which way it falls; it balances only at the centre of mass.',
  setup: (stage, c) => createPlot(stage, { x: [0, 10], y: [0, 3], c, box: (s) => ({ x: 0, y: s.h * 0.3, w: s.w, h: s.h * 0.7 }) }),
  draw(ctx, stage, c, plot) {
    const top = Math.max(...Array.from({ length: 80 }, (_, i) => K().rho(i / 8)));
    plot.setRange([0, 10], [0, top * 1.2]);
    plot.axes({ xLabel: 'position x (m)', yLabel: 'density ρ' });
    plot.shade(K().rho, null, 0, 10, c.fillB);
    plot.fn(K().rho, { color: c.ink, width: 3 });
    plot.segment(centre(), 0, centre(), top * 1.2, { color: c.c, width: 2, dash: [6, 4] });
    plot.segment(state.pin, 0, state.pin, top * 1.2, { color: c.a, width: 3 });
    // tilting beam
    const [px] = plot.toPx(state.pin, 0);
    const tilt = Math.max(-0.35, Math.min(0.35, torque() * 0.05));
    const y = stage.h * 0.15; const L = stage.w * 0.9 / 2;
    ctx.save(); ctx.translate(px, y); ctx.rotate(tilt);
    ctx.fillStyle = c.fillA; ctx.fillRect(-L * 0.9, -6, L * 1.8, 12); ctx.strokeStyle = c.ink; ctx.lineWidth = 3; ctx.strokeRect(-L * 0.9, -6, L * 1.8, 12);
    ctx.restore();
    ctx.fillStyle = c.ink; ctx.beginPath(); ctx.moveTo(px, y + 6); ctx.lineTo(px - 14, y + 30); ctx.lineTo(px + 14, y + 30); ctx.closePath(); ctx.fill();
  },
  controls: [
    { title: 'Find the balance' },
    { key: 'shape', label: 'Plate', options: Object.entries(SHAPES).map(([k, v]) => [k, v.name]) },
    { key: 'pin', label: 'Pin at', min: 0, max: 10, step: 0.1, format: (v) => `${v.toFixed(1)} m` },
    { readout: [
      ['Net turning ∫(x − p)ρ dx', () => num(torque(), 4)],
      ['Falls', () => (Math.abs(torque()) < 0.03 ? { text: 'balanced', good: true } : torque() > 0 ? 'to the right' : 'to the left')],
      ['Centre of mass ∫xρ / ∫ρ', () => `${num(centre(), 5)} m`],
    ] },
  ],
  tex: () => '\\bar x=\\frac{\\int x\\,\\rho(x)\\,dx}{\\int \\rho(x)\\,dx}',
});
