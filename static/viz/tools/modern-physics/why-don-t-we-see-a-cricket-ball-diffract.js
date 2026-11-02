import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { sig } from '../../lib/format.js';
import { deBroglie } from './_mp.js';

// Single gap of width a. The central spread is about λ/a radians; the pattern is sinc^2(π a sinθ / λ).
const OBJ = {
  e: ['electron at 1.0×10⁶ m/s', 9.11e-31, 1e6],
  n: ['neutron at 2 km/s', 1.675e-27, 2e3],
  b: ['cricket ball at 30 m/s', 0.16, 30],
};
const state = { obj: 'e', la: -9 }; // la = log10 of the gap in metres
const lam = (s) => deBroglie(OBJ[s.obj][1], OBJ[s.obj][2]);
const ratio = (s) => lam(s) / 10 ** s.la;
const sinc2 = (x) => (Math.abs(x) < 1e-9 ? 1 : (Math.sin(x) / x) ** 2);
const spread = (r) => (r >= 1 ? 90 : (Math.asin(r) * 180) / Math.PI);
const verdict = (r) => (r >= 0.3 ? 'a wide fan' : r >= 0.01 ? 'a visible pattern' : r >= 1e-5 ? 'a hairline spread' : 'a straight beam');

const tool = createTool({
  state,
  label: 'A graph of the intensity of particles on a screen against the angle they leave a gap, from minus 90 to plus 90 degrees. When the wavelength is close to the gap width, a wide central peak with side peaks appears. When the wavelength is far smaller than the gap, the graph shows only a spike at zero degrees.',
  setup: (stage, c) => createPlot(stage, { x: [-90, 90], y: [0, 1.15], c, pad: 28 }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'θ (°)', yLabel: 'intensity' });
    const r = Math.max(ratio(state), 0.02); // narrower than this would be thinner than the pen
    const f = (deg) => {
      const s = Math.sin((deg * Math.PI) / 180);
      return sinc2((Math.PI * s) / Math.max(r, 1e-12));
    };
    plot.shade(f, null, -90, 90, c.fillA);
    plot.fn(f, { color: c.a });
    plot.text(ratio(state) < 0.02 ? 'drawn wider than true: it is a hairline' : `λ/a = ${sig(r, 2)}`, 0, 1.08, { size: 11 });
  },
  controls: () => [
    { title: 'Send waves through a gap' },
    { key: 'obj', label: 'Object', options: Object.entries(OBJ).map(([k, v]) => [k, v[0]]) },
    { key: 'la', label: 'Gap width a', min: -12, max: 0, step: 0.1, format: (v) => `${sig(10 ** v, 2)} m` },
    { readout: [
      ['Wavelength λ', (s) => `${sig(lam(s), 3)} m`],
      ['λ ÷ a', (s) => sig(ratio(s), 2)],
      ['First dark angle', (s) => (ratio(s) >= 1 ? 'none: fills the screen' : `${sig(spread(ratio(s)), 2)}°`)],
      ['What you see', (s) => verdict(ratio(s))],
    ] },
  ],
  tex: (s) => `\\sin\\theta_1=\\dfrac{\\lambda}{a}=${sig(ratio(s), 2)}`,
});

tool.update();
