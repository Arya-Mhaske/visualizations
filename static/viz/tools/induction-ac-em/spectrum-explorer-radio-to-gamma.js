import { createTool } from '../../lib/tool.js';
import { sig } from '../../lib/format.js';
import { drawRuler } from '../modern-physics/_matter-waves-view.js';
import { photonEv } from '../modern-physics/_mp.js';

// Band edges in metres (NCERT Table 8.1 style). Photon energy E = hc/λ.
export const BANDS = [
  ['gamma rays', 0, 1e-12, 'cancer treatment, sterilising food'],
  ['X-rays', 1e-12, 1e-9, 'medical imaging, finding cracks'],
  ['ultraviolet', 1e-9, 4e-7, 'killing germs, security marks, vitamin D'],
  ['visible light', 4e-7, 7e-7, 'sight, photosynthesis, photography'],
  ['infrared', 7e-7, 1e-3, 'heat lamps, remote controls, night vision'],
  ['microwaves', 1e-3, 0.1, 'radar, ovens, mobile and satellite links'],
  ['radio waves', 0.1, Infinity, 'radio, television, mobile phones'],
];
const state = { le: -7 }; // log₁₀ of wavelength in metres
const lam = (s) => 10 ** s.le;
const band = (s) => BANDS.find(([, lo, hi]) => lam(s) >= lo && lam(s) < hi);

const tool = createTool({
  state,
  label: 'A ruler of wavelengths in powers of ten of a metre, from a hundred thousand metres on the left to a fraction of a femtometre on the right. A coral marker sits at the wavelength you choose. A caption names the band and what it is used for, and readouts give the frequency and photon energy.',
  draw(ctx, stage, c) {
    drawRuler(ctx, c, stage, { lo: -14, hi: 5, step: 3, y: 0.5, caption: 'λ (m)', marks: [{ e: state.le, text: band(state)[0], fill: c.a, up: true }] });
  },
  controls: () => [
    { title: 'Slide along the spectrum' },
    { key: 'le', label: 'Wavelength, log₁₀ λ', min: -14, max: 5, step: 0.05, format: (v) => `${sig(10 ** v, 3)} m` },
    { readout: [
      ['Band', (s) => band(s)[0]],
      ['Frequency f = c/λ', (s) => `${sig(3e8 / lam(s), 3)} Hz`],
      ['Photon energy', (s) => `${sig(photonEv(lam(s) * 1e9), 3)} eV`],
      ['Used for', (s) => band(s)[3]],
    ] },
  ],
  tex: (s) => `f=\\dfrac{c}{\\lambda}=\\dfrac{3\\times10^8}{${sig(lam(s), 3)}}=${sig(3e8 / lam(s), 3)}\\ \\text{Hz}`,
});

tool.update();
