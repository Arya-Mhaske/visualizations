import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { createRng } from '../../lib/rng.js';
import { fixed } from '../../lib/format.js';
import { H, Q, METALS, phiOf, photonEv } from './_mp.js';

// Lab data: stopping potential for lamps of different frequency. Readings carry a small seeded scatter (0.03 V).
const state = { metal: 'K', slope: 3, icpt: 1.5 };
const NUS = [5.5, 6.5, 7.5, 8.5, 9.5, 10.5, 11.5, 12.5, 13.5, 14.5, 15.5]; // 10^14 Hz
const kOf = (nu14, phi) => (H * nu14 * 1e14) / Q - phi;
const data = (metal) => {
  const rng = createRng(11);
  const phi = phiOf(metal);
  return NUS.map((nu) => ({ nu, v0: kOf(nu, phi) + (rng.next() - 0.5) * 0.06 })).filter((p) => p.v0 > 0.05);
};
const hFrom = (slopeEvPer14) => (slopeEvPer14 * Q) / 1e14; // J s
const bestFit = (pts) => {
  const n = pts.length;
  const sx = pts.reduce((a, p) => a + p.nu, 0);
  const sy = pts.reduce((a, p) => a + p.v0, 0);
  const sxx = pts.reduce((a, p) => a + p.nu * p.nu, 0);
  const sxy = pts.reduce((a, p) => a + p.nu * p.v0, 0);
  const slope = (n * sxy - sx * sy) / (n * sxx - sx * sx);
  return { slope, icpt: (sy - slope * sx) / n };
};

const tool = createTool({
  state,
  label: 'A graph of maximum kinetic energy in electron-volts against frequency in units of 10 to the 14 hertz. Dots are measured readings that lie close to a straight line. A coral line is yours to set with a slope slider and an intercept slider.',
  setup: (stage, c) => createPlot(stage, { x: [0, 16], y: [-3, 5], c, pad: 30 }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'ν (10¹⁴ Hz)', yLabel: 'K_max (eV)' });
    plot.fn((x) => state.slope * 0.1 * x - state.icpt, { color: c.a });
    for (const p of data(state.metal)) plot.point(p.nu, p.v0, { fill: c.b, r: 5 });
  },
  controls: () => [
    { title: 'Fit a line to the readings' },
    { key: 'metal', label: 'Metal (cathode)', options: METALS.slice(0, 4).map(([k]) => [k, k]) },
    { key: 'slope', label: 'Slope', min: 1, max: 8, step: 0.05, format: (v) => `${fixed(v * 0.1, 3)} eV per 10¹⁴ Hz` },
    { key: 'icpt', label: 'Intercept (−φ₀)', min: 0, max: 5.5, step: 0.05, format: (v) => `−${fixed(v, 2)} eV` },
    { row: [{ button: 'Best fit', onClick: () => {
      const f = bestFit(data(state.metal));
      state.slope = Math.round((f.slope * 10) / 0.05) * 0.05;
      state.icpt = Math.round((-f.icpt) / 0.05) * 0.05;
      tool.update();
    } }] },
    { readout: [
      ['h from slope', (s) => `${fixed(hFrom(s.slope * 0.1) * 1e34, 2)} ×10⁻³⁴ J s`],
      ['φ₀ from intercept', (s) => `${fixed(s.icpt, 2)} eV`],
      ['Threshold ν₀', (s) => `${fixed(s.icpt / (s.slope * 0.1), 2)} ×10¹⁴ Hz`],
      ['Accepted h', () => '6.63 ×10⁻³⁴ J s'],
    ] },
  ],
  tex: (s) => `K_{max}=h\\nu-\\phi_0:\\ h=${fixed(hFrom(s.slope * 0.1) * 1e34, 2)}\\times10^{-34}\\ \\text{J s}`,
});

tool.update();
