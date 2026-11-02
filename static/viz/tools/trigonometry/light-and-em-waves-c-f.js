import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { sci, sig, texSci } from '../../lib/format.js';
import { BANDS, C_LIGHT, bandAt, wavelength } from './_waves-math.js';

const state = { logf: 14.7 };
const LOGC = Math.log10(C_LIGHT);
const lengthText = (m) => (m >= 1 ? `${sig(m, 3)} m` : m >= 1e-3 ? `${sig(m * 1e3, 3)} mm` : m >= 1e-6 ? `${sig(m * 1e6, 3)} μm` : `${sig(m * 1e9, 3)} nm`);

createTool({
  state,
  label: 'A straight downward line on a graph of the logarithm of wavelength against the logarithm of frequency, with the regions of the electromagnetic spectrum labelled across the top. A coral point slides along the line: as frequency goes up by a factor of ten, wavelength goes down by a factor of ten.',
  setup: (stage, c) => createPlot(stage, { x: [3, 21], y: [-13, 6], c, pad: 26 }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'log f', yLabel: 'log λ', grid: true });
    BANDS.forEach(([name, a, b], i) => {
      plot.segment(a, -13, a, 6, { color: c.grid, width: 1, dash: [4, 4] });
      if (b - a > 1.5) plot.text(name, (a + b) / 2, 5.2 - (i % 2) * 1.1, { size: 10, patch: false });
    });
    plot.text('Vis.', 14.75, 5.2, { size: 10, patch: false });
    plot.fn((x) => LOGC - x, { color: c.b, width: 4 });
    for (let k = 0; k < 7; k++) {
      const x = 14.6 + (k * 0.3) / 6;
      plot.point(x, LOGC - x, { fill: c.spec[k], r: 3 });
    }
    plot.point(state.logf, LOGC - state.logf, { fill: c.a, r: 8 });
  },
  controls: [
    { title: 'Slide along the spectrum' },
    { key: 'logf', label: 'log₁₀ of f', min: 3, max: 21, step: 0.1, format: (n) => sig(n, 3) },
    { readout: [
      ['Frequency, f', (s) => `${sci(10 ** s.logf, 2)} Hz`],
      ['Wavelength, λ', (s) => lengthText(wavelength(10 ** s.logf))],
      ['Region', (s) => bandAt(s.logf)],
      ['f × λ', (s) => `${sci((10 ** s.logf) * wavelength(10 ** s.logf), 3)} m/s`],
    ] },
  ],
  tex: (s) => `\\lambda=\\dfrac{c}{f}=\\dfrac{3\\times10^{8}}{${texSci(10 ** s.logf, 2)}}=${texSci(wavelength(10 ** s.logf), 2)}\\ \\text{m}`,
});
