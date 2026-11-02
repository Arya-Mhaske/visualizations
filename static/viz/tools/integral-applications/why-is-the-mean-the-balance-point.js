import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { simpson, phi, num } from './_ia.js';

// The mean μ = ∫ x f(x) dx is the balance point of the density: ∫ (x − p) f(x) dx = 0 only at p = μ.
const DIST = {
  sym: { name: 'Symmetric bell', f: (x) => phi(x - 5), x: [0, 10] },
  exp: { name: 'Skewed right (exponential, mean 2)', f: (x) => (x >= 0 ? 0.5 * Math.exp(-x / 2) : 0), x: [0, 12] },
  two: { name: 'Two humps', f: (x) => 0.7 * phi((x - 3) / 0.7) / 0.7 + 0.3 * phi((x - 8) / 0.7) / 0.7, x: [0, 12] },
  tri: { name: 'Triangle on [0, 6]', f: (x) => (x < 0 || x > 6 ? 0 : x < 2 ? x / 6 : (6 - x) / 12), x: [0, 6] },
};
const state = { kind: 'sym', pin: 3 };
const K = () => DIST[state.kind];
const total = () => simpson(K().f, K().x[0], K().x[1], 2000);
const mean = () => simpson((x) => x * K().f(x), K().x[0], K().x[1], 2000) / total();
const torque = () => simpson((x) => (x - state.pin) * K().f(x), K().x[0], K().x[1], 2000);

createTool({
  state,
  label: 'A probability density curve on a seesaw with a movable pin. A tilting beam shows which way it falls, and it balances only when the pin is at the mean.',
  setup: (stage, c) => createPlot(stage, { x: [0, 10], y: [0, 1], c, box: (s) => ({ x: 0, y: s.h * 0.25, w: s.w, h: s.h * 0.75 }) }),
  draw(ctx, stage, c, plot) {
    const k = K();
    const top = Math.max(...Array.from({ length: 100 }, (_, i) => k.f(k.x[0] + ((k.x[1] - k.x[0]) * i) / 99)));
    plot.setRange(k.x, [0, top * 1.2]);
    plot.axes({ xLabel: 'x', yLabel: 'density f' });
    plot.shade(k.f, null, k.x[0], k.x[1], c.fillB);
    plot.fn(k.f, { color: c.ink, width: 3, domain: k.x });
    plot.segment(mean(), 0, mean(), top * 1.2, { color: c.c, width: 2, dash: [6, 4] });
    plot.segment(state.pin, 0, state.pin, top * 1.2, { color: c.a, width: 3 });
    const [px] = plot.toPx(state.pin, 0);
    const tilt = Math.max(-0.3, Math.min(0.3, torque() * 0.12));
    const y = stage.h * 0.1;
    ctx.save(); ctx.translate(px, y); ctx.rotate(tilt);
    ctx.fillStyle = c.fillA; ctx.fillRect(-stage.w * 0.4, -5, stage.w * 0.8, 10); ctx.strokeStyle = c.ink; ctx.lineWidth = 3; ctx.strokeRect(-stage.w * 0.4, -5, stage.w * 0.8, 10);
    ctx.restore();
    ctx.fillStyle = c.ink; ctx.beginPath(); ctx.moveTo(px, y + 5); ctx.lineTo(px - 12, y + 26); ctx.lineTo(px + 12, y + 26); ctx.closePath(); ctx.fill();
  },
  controls: [
    { title: 'Place the pin' },
    { key: 'kind', label: 'Distribution', options: Object.entries(DIST).map(([k, v]) => [k, v.name]) },
    { key: 'pin', label: 'Pin at', min: 0, max: 12, step: 0.1, format: (v) => v.toFixed(1) },
    { readout: [
      ['Total area under f', () => num(total(), 4)],
      ['Net turning ∫(x − p) f dx', () => num(torque(), 4)],
      ['Falls', () => (Math.abs(torque()) < 0.02 ? { text: 'balanced', good: true } : torque() > 0 ? 'to the right' : 'to the left')],
      ['Mean μ = ∫x f dx', () => num(mean(), 5)],
    ] },
  ],
  tex: () => '\\mu=\\int_{-\\infty}^{\\infty}x\\,f(x)\\,dx',
});
