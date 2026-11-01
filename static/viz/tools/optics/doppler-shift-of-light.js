import { createTool } from '../../lib/tool.js';
import { dot, label, line } from '../../lib/draw.js';
import { fixed, sig } from '../../lib/format.js';
import { GALAXIES, H_ALPHA, dopplerLambda, fronts, relativisticZ } from './_huygens-wavefronts-math.js';

const state = { beta: 0.2 };
const T = 1; // time between wavefronts, in the drawing's own units
const NOW = 6.5;
const C = 1;

const tool = createTool({
  state,
  label: 'Circular wavefronts from a source that has been moving to the left. The circles are bunched together on the left, where the source is heading, and spread out on the right, towards a distant observer. Coral dots mark where each front crosses the line of motion on the right, and the gap between them is the observed wavelength.',
  draw(ctx, stage, c) {
    const k = (stage.w - 20) / (2 * NOW);
    const ox = stage.w / 2;
    const oy = stage.h / 2;
    line(ctx, 0, oy, stage.w, oy, { color: c.grid, width: 2 });
    const fs = fronts(NOW, T, state.beta, 7).map((f) => ({ x: f.x / 3e8, r: f.r / 3e8 }));
    fs.forEach((f, idx) => {
      ctx.strokeStyle = c.b;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(ox + f.x * k, oy, f.r * k, 0, Math.PI * 2);
      ctx.stroke();
      dot(ctx, ox + (f.x + f.r * C) * k, oy, 5, c.a, c.ink, 2);
      if (idx > 0 || f.r > 0) dot(ctx, ox + (f.x - f.r * C) * k, oy, 4, c.c, c.ink, 2);
    });
    const src = -state.beta * C * NOW;
    dot(ctx, ox + src * k, oy, 8, c.fillY, c.ink);
    label(ctx, 'source →', ox + src * k, oy - 18, c, { size: 10, bounds: stage, patch: false });
    label(ctx, '← moves away from observer', stage.w * 0.5, stage.h - 10, c, { size: 10, bounds: stage, patch: false });
    label(ctx, 'observer', stage.w - 40, 14, c, { size: 10, bounds: stage, patch: false });
  },
  controls: () => [
    { title: 'Move the source' },
    { key: 'beta', label: 'Speed of recession, v ÷ c', min: 0, max: 0.3, step: 0.01, format: (n) => fixed(n, 2) },
    { row: GALAXIES.map((g, i) => ({ button: g.name, ghost: i > 0, onClick() { state.beta = g.beta; tool.update(); } })) },
    { readout: [
      ['Emitted H-α', () => `${H_ALPHA} nm`],
      ['Observed H-α', (s) => `${sig(dopplerLambda(H_ALPHA, s.beta), 4)} nm`],
      ['Δλ ÷ λ = v ÷ c', (s) => fixed(s.beta, 2)],
      ['Speed', (s) => `${sig(s.beta * 3e5, 3)} km s⁻¹`],
      ['Exact formula, z', (s) => fixed(relativisticZ(s.beta), 3)],
    ] },
  ],
  tex: (s) => `\dfrac{\Delta\lambda}{\lambda}=\dfrac{v}{c}=${fixed(s.beta, 2)}\ \Rightarrow\ \lambda'=${sig(H_ALPHA, 4)}\times${fixed(1 + s.beta, 2)}=${sig(dopplerLambda(H_ALPHA, s.beta), 4)}\ \text{nm}`,
});

tool.update();
