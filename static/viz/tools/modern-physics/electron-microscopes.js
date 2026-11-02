import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { sig } from '../../lib/format.js';
import { electronNm } from './_mp.js';

// Two points a distance d apart. Each image is a sinc^2 blob whose first zero is at the smallest resolvable
// separation d_min = 0.61 λ / NA (Rayleigh). Light: 500 nm, NA 1.0. Electrons: NA 0.01 (lens aberrations limit it).
const state = { ld: 2, kv: 100 }; // ld = log10 of the separation in nm
const NA_LIGHT = 1;
const NA_E = 0.01;
const dMinLight = () => (0.61 * 500) / NA_LIGHT;
const dMinElectron = (kv) => (0.61 * electronNm(kv * 1000)) / NA_E;
const sinc2 = (x) => (Math.abs(x) < 1e-9 ? 1 : (Math.sin(x) / x) ** 2);
const blob = (x, d, dmin) => sinc2((Math.PI * (x - d / 2)) / dmin) + sinc2((Math.PI * (x + d / 2)) / dmin);

const tool = createTool({
  state,
  label: 'Two stacked graphs of image brightness along a line. The top is a light microscope, the bottom an electron microscope. Each shows two overlapping blobs from two points that sit the same distance apart. A blob is wide for light and narrow for electrons, so the two points merge into one lump under light but show as two peaks under electrons.',
  setup: (stage, c) => ({
    top: createPlot(stage, { x: [-1, 1], y: [0, 2.2], c, pad: 26, box: (g) => ({ x: 0, y: 0, w: g.w, h: g.h * 0.5 }) }),
    bottom: createPlot(stage, { x: [-1, 1], y: [0, 2.2], c, pad: 26, box: (g) => ({ x: 0, y: g.h * 0.5, w: g.w, h: g.h * 0.5 }) }),
  }),
  draw(ctx, stage, c, { top, bottom }) {
    const d = 10 ** state.ld;
    const dl = dMinLight();
    const de = dMinElectron(state.kv);
    // each plot shows ±1.5 of whichever is larger, the gap or its own smallest resolvable gap, so the shapes stay visible
    const half = (dmin) => 1.5 * Math.max(d, dmin);
    const one = (plot, dmin, name, colour) => {
      const hw = half(dmin);
      plot.setRange([-hw, hw], [0, 2.2]);
      plot.axes({ xLabel: 'x (nm)', yLabel: name });
      plot.fn((x) => blob(x, d, dmin), { color: colour });
      plot.point(-d / 2, 0, { fill: c.ink, r: 5 });
      plot.point(d / 2, 0, { fill: c.ink, r: 5 });
    };
    one(top, dl, 'light', c.b);
    one(bottom, de, 'electrons', c.a);
  },
  controls: () => [
    { title: 'Two tiny points, d apart' },
    { key: 'ld', label: 'Separation d', min: -1, max: 3, step: 0.05, format: (v) => `${sig(10 ** v, 2)} nm` },
    { key: 'kv', label: 'Accelerating voltage', min: 10, max: 300, step: 10, format: (v) => `${v} kV` },
    { readout: [
      ['Electron λ', (s) => `${sig(electronNm(s.kv * 1000) * 1000, 3)} pm`],
      ['Smallest gap, light', () => `${sig(dMinLight(), 3)} nm`],
      ['Smallest gap, electrons', (s) => `${sig(dMinElectron(s.kv), 3)} nm`],
      ['Light sees', (s) => ({ text: 10 ** s.ld >= dMinLight() ? 'two points' : 'one blob', good: 10 ** s.ld >= dMinLight() })],
      ['Electrons see', (s) => ({ text: 10 ** s.ld >= dMinElectron(s.kv) ? 'two points' : 'one blob', good: 10 ** s.ld >= dMinElectron(s.kv) })],
    ] },
  ],
  tex: (s) => `d_{min}\\approx\\dfrac{0.61\\lambda}{NA}:\\ ${sig(dMinLight(), 3)}\\ \\text{nm (light)},\\ ${sig(dMinElectron(s.kv), 3)}\\ \\text{nm (electrons)}`,
});

tool.update();
