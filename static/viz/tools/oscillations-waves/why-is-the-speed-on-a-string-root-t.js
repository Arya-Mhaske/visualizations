import { createTool } from '../../lib/tool.js';
import { createClock, transport } from '../../lib/sim.js';
import { arrow, dot, label, line } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { stringSpeed, pulseY } from './_travelling-waves-math.js';

const L = 2; // metres of string shown
const SLOW = 20; // the animation runs this many times slower than real life
const REF = { T: 20, mu: 0.02 };
const MAX = { T: 80, mu: 0.08 };
const state = { T: 80, mu: 0.02 };
const clock = createClock(document.querySelector('#stage'), { onFrame: () => tool.update() });
const slowest = (s) => Math.min(stringSpeed(s.T, s.mu), stringSpeed(REF.T, REF.mu));
const tau = (s) => (clock.state.t / SLOW) % ((L + 0.4) / slowest(s)); // real time in seconds since the pulse set off

function lane(ctx, stage, c, y, p, color, name) {
  const left = stage.w * 0.06;
  const span = stage.w * 0.88;
  const amp = stage.h * 0.06;
  const v = stringSpeed(p.T, p.mu);
  const now = tau(state);
  ctx.beginPath();
  for (let i = 0; i <= 120; i++) {
    const x = (i / 120) * L;
    const px = left + (x / L) * span;
    const py = y - amp * pulseY(x, now, v, 0.2, 0.1);
    if (i) ctx.lineTo(px, py);
    else ctx.moveTo(px, py);
  }
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.stroke();
  line(ctx, left, y - amp * 1.4, left, y + amp * 0.6, { color: c.ink, width: 4 });
  line(ctx, left + span, y - amp * 1.4, left + span, y + amp * 0.6, { color: c.ink, width: 4 });
  label(ctx, `${name}: ${fixed(v, 1)} m/s`, left + span / 2, y + amp * 1.3, c, { size: 11, bounds: stage });
}

const tool = createTool({
  state,
  label: 'Two strings, each carrying a pulse. A blue reference string has tension 20 newtons and mass 0.02 kilograms per metre. Your coral string can be tightened or made heavier. Below, a close-up of the top of a pulse shows the tension pulls on a small bead of string.',
  draw(ctx, stage, c) {
    lane(ctx, stage, c, stage.h * 0.14, REF, c.b, 'reference');
    lane(ctx, stage, c, stage.h * 0.34, state, c.a, 'yours');

    // close-up of the crest: net force from tension, inertia from the bead's mass
    const cx = stage.w / 2;
    const base = stage.h * 0.82;
    const hw = stage.w * 0.4;
    const H = stage.h * 0.1;
    ctx.beginPath();
    for (let i = -20; i <= 20; i++) {
      const dx = (i / 20) * hw;
      const py = base - H * (1 - (dx / hw) ** 2);
      if (i > -20) ctx.lineTo(cx + dx, py);
      else ctx.moveTo(cx + dx, py);
    }
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 3;
    ctx.stroke();
    const top = base - H;
    const r = 6 + 12 * Math.sqrt(state.mu / MAX.mu);
    const pull = (stage.w * 0.2 * state.T) / MAX.T;
    arrow(ctx, cx - r, top + 2, cx - r - pull, top + 2 + pull * 0.25, { color: c.b, width: 3 });
    arrow(ctx, cx + r, top + 2, cx + r + pull, top + 2 + pull * 0.25, { color: c.b, width: 3 });
    arrow(ctx, cx, top + r, cx, top + r + pull * 0.5, { color: c.a, width: 4 });
    dot(ctx, cx, top, r, c.fillB, c.ink, 3);
    label(ctx, 'tension T', cx - hw * 0.6, top + 20, c, { size: 10, bounds: stage });
    label(ctx, 'net push ∝ T', cx + hw * 0.45, top + r + pull * 0.35 + 8, c, { size: 10, bounds: stage });
    label(ctx, 'bead mass ∝ μ', cx, top - r - 12, c, { size: 10, bounds: stage });
    label(ctx, 'acceleration ∝ T / μ', cx, stage.h * 0.55, c, { size: 12, bounds: stage });
  },
  controls: [
    { title: 'Tighten it, load it' },
    { key: 'T', label: 'Tension, T', min: 5, max: MAX.T, step: 5, format: (n) => `${n} N` },
    { key: 'mu', label: 'Mass per metre, μ', min: 0.005, max: MAX.mu, step: 0.005, format: (n) => `${fixed(n, 3)} kg/m` },
    transport(clock),
    { readout: [
      ['Your speed', (s) => `${fixed(stringSpeed(s.T, s.mu), 2)} m/s`],
      ['Reference speed', () => `${fixed(stringSpeed(REF.T, REF.mu), 2)} m/s`],
      ['Tension against reference', (s) => `× ${fixed(s.T / REF.T, 2)}`],
      ['μ against reference', (s) => `× ${fixed(s.mu / REF.mu, 2)}`],
      ['Speed against reference', (s) => `× ${fixed(stringSpeed(s.T, s.mu) / stringSpeed(REF.T, REF.mu), 2)}`],
      ['Real time to cross 2 m', (s) => `${fixed((L / stringSpeed(s.T, s.mu)) * 1000, 0)} ms`],
    ] },
  ],
  tex: (s) => `v = \\sqrt{\\dfrac{T}{\\mu}} = \\sqrt{\\dfrac{${s.T}}{${fixed(s.mu, 3)}}} = ${fixed(stringSpeed(s.T, s.mu), 2)}\\ \\text{m/s}`,
});

clock.step(1);
