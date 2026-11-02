import { createTool } from '../../lib/tool.js';
import { label } from '../../lib/draw.js';
import { fixed, sig } from '../../lib/format.js';

// c = 1/√(μ₀ε₀) in vacuum; in a medium v = 1/√(με) = c/√(μ_r ε_r), and n = c/v.
const MU0 = 4 * Math.PI * 1e-7;
const EPS0 = 8.854e-12;
const state = { fe: 0, fm: 0, er: 1.77, mr: 1 }; // fe, fm: log₂ scale factors on ε₀, μ₀ ("what if")
const eps = (s) => EPS0 * 2 ** s.fe;
const mu = (s) => MU0 * 2 ** s.fm;
const speed = (s) => 1 / Math.sqrt(mu(s) * eps(s));
const inMedium = (s) => 1 / Math.sqrt(mu(s) * eps(s) * s.er * s.mr);

const tool = createTool({
  state,
  label: 'A horizontal bar for the speed of light in vacuum, 3 times 10 to the 8 metres per second, and a second bar for the speed in the chosen medium. The speeds come straight from the electric constant and the magnetic constant. Making the constants larger slows the wave.',
  draw(ctx, stage, c) {
    const x0 = 24;
    const W = stage.w - 48;
    const max = 3.6e8;
    const rows = [['vacuum (your constants)', speed(state), c.fillA], ['in the medium', inMedium(state), c.fillB]];
    rows.forEach(([name, v, fill], i) => {
      const y = stage.h * (0.2 + i * 0.3);
      ctx.fillStyle = fill;
      ctx.fillRect(x0, y, (W * v) / max, 36);
      ctx.strokeStyle = c.ink;
      ctx.lineWidth = 3;
      ctx.strokeRect(x0, y, (W * v) / max, 36);
      label(ctx, `${name}: ${sig(v / 1e8, 3)} ×10⁸ m/s`, x0 + 6, y - 14, c, { size: 11, align: 'left', bounds: stage, patch: false });
    });
    const xr = x0 + (W * 2.998e8) / max;
    ctx.strokeStyle = c.ink;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(xr, stage.h * 0.1);
    ctx.lineTo(xr, stage.h * 0.9);
    ctx.stroke();
    ctx.setLineDash([]);
    label(ctx, 'c = 2.998 ×10⁸', xr, stage.h * 0.94, c, { size: 10, bounds: stage, patch: false });
  },
  controls: () => [
    { title: 'Change the constants' },
    { key: 'fe', label: 'ε₀ scaled by', min: -2, max: 2, step: 0.25, format: (v) => `×${sig(2 ** v, 3)}` },
    { key: 'fm', label: 'μ₀ scaled by', min: -2, max: 2, step: 0.25, format: (v) => `×${sig(2 ** v, 3)}` },
    { key: 'er', label: 'Medium ε_r', min: 1, max: 10, step: 0.01, format: (v) => fixed(v, 2) },
    { key: 'mr', label: 'Medium μ_r', min: 1, max: 4, step: 0.1, format: (v) => fixed(v, 1) },
    { readout: [
      ['μ₀', (s) => `${sig(mu(s), 4)} T m/A`],
      ['ε₀', (s) => `${sig(eps(s), 4)} F/m`],
      ['Speed 1/√(μ₀ε₀)', (s) => `${sig(speed(s), 4)} m/s`],
      ['Refractive index n', (s) => fixed(speed(s) / inMedium(s), 3)],
    ] },
  ],
  tex: (s) => `c=\\dfrac{1}{\\sqrt{\\mu_0\\varepsilon_0}}=\\dfrac{1}{\\sqrt{${sig(mu(s), 4)}\\times${sig(eps(s), 4)}}}=${sig(speed(s), 4)}\\ \\text{m/s}`,
});

tool.update();
