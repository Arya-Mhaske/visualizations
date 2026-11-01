import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed, sig } from '../../lib/format.js';
import { twoStars, airy, rayleigh, midDip, ARCSEC } from './_diffraction-math.js';

// Two equally bright stars seen through a circular opening. Angles are in arcseconds.
const state = { D: 10, nm: 550, sep: 1.4 };
const lambda = (s) => s.nm * 1e-9;
const D = (s) => s.D * 1e-2;
const limit = (s) => rayleigh(lambda(s), D(s)) / ARCSEC; // arcsec
const dip = (s) => midDip(s.sep * ARCSEC, D(s), lambda(s));
const verdict = (s) => (dip(s) < 0.99 ? (s.sep >= limit(s) - 1e-9 ? { text: 'resolved: two stars', good: true } : { text: 'just a dip: barely two', good: false }) : { text: 'one blob', good: false });

const tool = createTool({
  state,
  label: 'The brightness across the image of two stars. Each star makes a bright blob with faint rings. The dashed curves are the blobs of the separate stars and the solid line is the sum. When the stars are close, the blobs merge into one.',
  setup: (stage, c) => createPlot(stage, { x: [-5, 5], y: [0, 2.2], c, pad: 30 }),
  draw(ctx, stage, c, plot) {
    const span = Math.max(limit(state) * 2.6, state.sep * 1.4, 1);
    plot.setRange([-span, span], [0, 2.2]);
    plot.axes({ xLabel: 'angle (arcsec)', yLabel: 'brightness' });
    const k = (Math.PI * D(state)) / lambda(state);
    plot.fn((t) => airy(k * (t - state.sep / 2) * ARCSEC), { color: c.b, dash: [6, 5], domain: [-span, span] });
    plot.fn((t) => airy(k * (t + state.sep / 2) * ARCSEC), { color: c.d, dash: [6, 5], domain: [-span, span] });
    plot.fn((t) => twoStars(t * ARCSEC, state.sep * ARCSEC, D(state), lambda(state)), { color: c.a, domain: [-span, span] });
  },
  controls: () => [
    { title: 'Two stars, one telescope' },
    { key: 'D', label: 'Opening, D', min: 2, max: 100, step: 1, format: (n) => `${n} cm` },
    { key: 'nm', label: 'Wavelength, λ', min: 400, max: 700, step: 10, format: (n) => `${n} nm` },
    { key: 'sep', label: 'Angle between the stars', min: 0.1, max: 10, step: 0.1, format: (n) => `${fixed(n, 1)} arcsec` },
    { readout: [
      ['Limit, 1.22 λ/D', (s) => `${sig(limit(s), 3)} arcsec`],
      ['Dip between the peaks', (s) => `${sig((1 - dip(s)) * 100, 3)} %`],
      ['What you see', verdict],
    ] },
  ],
  tex: (s) => `\\theta_R=1.22\\,\\dfrac{\\lambda}{D}=1.22\\times\\dfrac{${s.nm}\\times 10^{-9}}{${fixed(s.D / 100, 2)}}=${sig(limit(s), 3)}''`,
});
tool.update();
