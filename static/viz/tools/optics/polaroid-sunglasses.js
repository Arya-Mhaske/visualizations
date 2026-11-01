import { createTool } from '../../lib/tool.js';
import { label } from '../../lib/draw.js';
import { fixed, sig } from '../../lib/format.js';
import { fresnel, brewster, throughGlasses } from './_diffraction-math.js';

// Glare off a flat road or lake (n = 1.33 for water). The lenses' pass axis is tilted by phi from vertical.
const state = { i: 53, phi: 0, n: 1.33 };
const glare = (s) => { const f = fresnel(1, s.n, s.i); return (f.Rs + f.Rp) / 2; };
const kept = (s) => { const f = fresnel(1, s.n, s.i); return throughGlasses(f.Rs, f.Rp, s.phi); };

const tool = createTool({
  state,
  label: 'Two pairs of bars. The first pair shows the glare from a water surface without and with polaroid sunglasses. The second shows ordinary unpolarised light, which loses half whatever the angle. Tilt the glasses sideways and the glare comes back.',
  draw(ctx, stage, c) {
    const rows = [
      ['Glare, no glasses', 1, c.a],
      ['Glare, with glasses', kept(state) / glare(state), c.d],
      ['Ordinary light, no glasses', 1, c.b],
      ['Ordinary light, with glasses', 0.5, c.c],
    ];
    const maxV = 1;
    const rowH = (stage.h - 30) / rows.length;
    rows.forEach(([name, v, color], k) => {
      const y = 15 + k * rowH;
      const w = Math.max(3, (v / maxV) * (stage.w - 40));
      ctx.fillStyle = color;
      ctx.fillRect(20, y + 20, w, rowH - 34);
      ctx.strokeStyle = c.ink;
      ctx.lineWidth = 3;
      ctx.strokeRect(20, y + 20, w, rowH - 34);
      label(ctx, `${name}: ${sig(v * 100, 3)} %`, stage.w / 2, y + 8, c, { color: c.ink, size: 11, bounds: stage });
    });
  },
  controls: () => [
    { title: 'Glare off water' },
    { key: 'i', label: 'Angle of the glare, i', min: 20, max: 80, step: 1, format: (n) => `${n}° from vertical` },
    { key: 'phi', label: 'Tilt of the glasses', min: 0, max: 90, step: 1, format: (n) => `${n}°` },
    { readout: [
      ['Brewster angle for water', (s) => `${fixed(brewster(1, s.n), 1)}°`],
      ['Glare removed', (s) => `${fixed((1 - kept(s) / glare(s)) * 100, 1)} %`],
      ['Ordinary light removed', () => '50 %'],
    ] },
  ],
  tex: (s) => `\\text{glare after glasses}=\\dfrac{R_s\\sin^2\\phi+R_p\\cos^2\\phi}{R_s+R_p}\\ \\text{of the reflected light}`,
});
tool.update();
