import { createTool } from '../../lib/tool.js';
import { arrow, label, line } from '../../lib/draw.js';
import { fixed, sig } from '../../lib/format.js';

// Ampère's law: ∮B·dl = μ₀ I through any surface bounded by the loop. A flat disc catches the wire's current I.
// A bag stretched between the plates catches no wire, only the changing electric field: I_d = ε₀ dΦ_E/dt. For a capacitor
// charged by current I, E = Q/(ε₀A), so I_d = ε₀ A dE/dt = I. Same answer for both surfaces: that fixes the law.
const EPS0 = 8.854e-12;
const state = { surf: 'flat', I: 2, A: 100, withD: true };
const rate = (s) => (s.I * 1e-3) / (EPS0 * s.A * 1e-4); // dE/dt in V/m per s
const through = (s) => (s.surf === 'flat' ? s.I : 0);
const displacement = (s) => (s.surf === 'bag' ? EPS0 * s.A * 1e-4 * rate(s) * 1000 : 0); // mA
const total = (s) => through(s) + (s.withD ? displacement(s) : 0);

const tool = createTool({
  state,
  label: 'A parallel-plate capacitor being charged through a wire. A dashed loop circles the wire on the left. A thick coral surface is stretched across the loop. In the flat view it is a disc cut by the wire. In the bag view it bulges rightwards and passes between the plates, where there is no wire, only a growing electric field drawn as arrows.',
  draw(ctx, stage, c) {
    const cy = stage.h * 0.5;
    const pl = stage.w * 0.5;
    const pr = stage.w * 0.62;
    const ph = stage.h * 0.28;
    line(ctx, 10, cy, pl, cy, { color: c.ink, width: 4 });
    line(ctx, pr, cy, stage.w - 10, cy, { color: c.ink, width: 4 });
    line(ctx, pl, cy - ph, pl, cy + ph, { color: c.ink, width: 8 });
    line(ctx, pr, cy - ph, pr, cy + ph, { color: c.ink, width: 8 });
    for (let k = -2; k <= 2; k++) arrow(ctx, pl + 6, cy + k * ph * 0.4, pr - 6, cy + k * ph * 0.4, { color: c.a, width: 2, head: 6 });
    label(ctx, 'E grows', (pl + pr) / 2, cy - ph - 14, c, { size: 10, bounds: stage, patch: false });
    arrow(ctx, 14, cy - 14, 54, cy - 14, { color: c.c, width: 3, head: 7 });
    label(ctx, 'I', 34, cy - 28, c, { size: 11, patch: false });
    // the loop and its surfaces
    const lx = stage.w * 0.22;
    const ry = ph * 0.8;
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 3;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.ellipse(lx, cy, 12, ry, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.strokeStyle = c.a;
    ctx.lineWidth = 5;
    ctx.beginPath();
    if (state.surf === 'flat') {
      ctx.moveTo(lx, cy - ry);
      ctx.lineTo(lx, cy + ry);
    } else {
      ctx.moveTo(lx, cy - ry);
      ctx.bezierCurveTo(pr + (pr - pl) * 2.5, cy - ry * 1.2, pr + (pr - pl) * 2.5, cy + ry * 1.2, lx, cy + ry);
    }
    ctx.stroke();
    label(ctx, state.surf === 'flat' ? 'flat surface: the wire pierces it' : 'bag surface: no wire, only changing E', stage.w / 2, stage.h - 14, c, { size: 11, bounds: stage, patch: false });
  },
  controls: () => [
    { title: 'Charge the capacitor' },
    { key: 'surf', label: 'Surface stretched across the loop', options: [['flat', 'flat disc'], ['bag', 'bag between plates']] },
    { key: 'withD', label: 'Count Maxwell’s displacement current', toggle: true },
    { key: 'I', label: 'Charging current I', min: 0.5, max: 5, step: 0.5, format: (v) => `${fixed(v, 1)} mA` },
    { key: 'A', label: 'Plate area', min: 20, max: 200, step: 20, format: (v) => `${v} cm²` },
    { readout: [
      ['Current in the wire', (s) => `${fixed(through(s), 2)} mA`],
      ['dE/dt between plates', (s) => `${sig(rate(s), 3)} V/m per s`],
      ['ε₀ dΦ_E/dt through the surface', (s) => `${fixed(displacement(s), 2)} mA`],
      ['Total in Ampère’s law', (s) => ({ text: `${fixed(total(s), 2)} mA`, good: Math.abs(total(s) - s.I) < 1e-9 })],
    ] },
  ],
  tex: (s) => `\\oint\\vec B\\cdot d\\vec l=\\mu_0\\left(I_c+\\varepsilon_0\\dfrac{d\\Phi_E}{dt}\\right)=\\mu_0\\times${fixed(total(s), 2)}\\ \\text{mA}`,
});

tool.update();
