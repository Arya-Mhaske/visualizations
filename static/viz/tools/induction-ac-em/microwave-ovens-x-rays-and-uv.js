import { createTool } from '../../lib/tool.js';
import { label, line } from '../../lib/draw.js';
import { sig } from '../../lib/format.js';
import { photonEv } from '../modern-physics/_mp.js';

// Each use matches a band by what the photon energy can do. Photon energies are compared with: a molecule rotating (~10⁻⁴ eV),
// thermal motion at room temperature (0.025 eV), a chemical bond (a few eV) and removing an electron (about 10 eV and above).
const APPS = {
  oven: { name: 'microwave oven (2.45 GHz)', lam: 3e8 / 2.45e9, why: 'Photon too weak to break bonds, but it makes water molecules rotate and jostle, which is heat.' },
  radio: { name: 'FM radio (100 MHz)', lam: 3, why: 'Photons far too weak to affect molecules. The wave is used as a signal, not as energy.' },
  ir: { name: 'remote control (940 nm)', lam: 940e-9, why: 'Photon energy of about 1 eV. Not enough to break bonds, enough to trigger a sensor.' },
  uv: { name: 'germicidal UV (254 nm)', lam: 254e-9, why: 'About 4.9 eV, just enough to break chemical bonds in germ DNA.' },
  xray: { name: 'medical X-ray (0.1 nm)', lam: 1e-10, why: 'About 12 keV. Enough to knock electrons out of atoms (ionise), and to pass through soft tissue.' },
  gamma: { name: 'cancer therapy gamma (1.25 MeV)', lam: 1e-3 * 1e-9 * 1, why: 'Around a million eV, ionising deeply, so it can destroy cancer cells.' },
};
const THRESH = [[1e-4, 'a molecule rotates'], [0.025, 'thermal motion at room temperature'], [4, 'a chemical bond breaks'], [13.6, 'an atom is ionised']];
const state = { app: 'oven' };
const E = (s) => photonEv(APPS[s.app].lam * 1e9);

const tool = createTool({
  state,
  label: 'A vertical scale of energy in powers of ten of electron-volts. Four horizontal lines mark what a photon can do: make a molecule rotate, match thermal motion, break a chemical bond, ionise an atom. A coral marker shows the photon energy for the chosen application, so you can see which jobs it can do.',
  draw(ctx, stage, c) {
    const lo = -6;
    const hi = 7;
    const top = 20;
    const bot = stage.h - 20;
    const Y = (e) => bot - ((Math.log10(e) - lo) / (hi - lo)) * (bot - top);
    line(ctx, 60, top, 60, bot, { color: c.ink, width: 3 });
    for (let k = lo; k <= hi; k += 2) {
      line(ctx, 54, Y(10 ** k), 66, Y(10 ** k), { color: c.ink, width: 2 });
      label(ctx, `10${k < 0 ? '⁻' : ''}${String(Math.abs(k)).replace(/\d/g, (d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[d])}`, 50, Y(10 ** k), c, { size: 9, align: 'right', patch: false });
    }
    label(ctx, 'photon energy (eV)', 62, 8, c, { size: 9, align: 'left', patch: false });
    THRESH.forEach(([e, text]) => {
      line(ctx, 66, Y(e), stage.w - 10, Y(e), { color: E(state) >= e ? c.c : c.grid, width: 2, dash: [5, 4] });
      label(ctx, text, stage.w - 12, Y(e) - 10, c, { size: 10, align: 'right', bounds: stage, patch: false });
    });
    const ey = Y(E(state));
    ctx.fillStyle = c.a;
    ctx.fillRect(70, ey - 5, 40, 10);
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 3;
    ctx.strokeRect(70, ey - 5, 40, 10);
    label(ctx, `${sig(E(state), 3)} eV`, 116, ey, c, { size: 11, align: 'left', bounds: stage });
  },
  controls: () => [
    { title: 'Match the application' },
    { key: 'app', label: 'Application', options: Object.entries(APPS).map(([k, v]) => [k, v.name]) },
    { readout: [
      ['Wavelength', (s) => `${sig(APPS[s.app].lam, 3)} m`],
      ['Frequency', (s) => `${sig(3e8 / APPS[s.app].lam, 3)} Hz`],
      ['Photon energy', (s) => `${sig(E(s), 3)} eV`],
      ['Can break a bond?', (s) => ({ text: E(s) >= 4 ? 'yes' : 'no', good: E(s) >= 4 })],
      ['Can ionise an atom?', (s) => ({ text: E(s) >= 13.6 ? 'yes' : 'no', good: E(s) >= 13.6 })],
    ] },
  ],
  tex: (s) => `E=\\dfrac{hc}{\\lambda}=\\dfrac{1243\\ \\text{eV nm}}{${sig(APPS[s.app].lam * 1e9, 3)}\\ \\text{nm}}=${sig(E(s), 3)}\\ \\text{eV}`,
});

tool.update();
