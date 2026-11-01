import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { dot, label } from '../../lib/draw.js';
import { fixed, sig } from '../../lib/format.js';
import { BODIES, orbit } from './_conics-math.js';
import { curve, trace } from './_conics-view.js';

const state = { a: 1, e: 0.0167, nu: 60 };
let tool;
const rAt = (s = state) => (s.a * (1 - s.e * s.e)) / (1 + s.e * Math.cos((s.nu * Math.PI) / 180));

tool = createTool({
  state,
  label: 'An orbit drawn with the Sun at one focus. The slider changes the eccentricity from nearly circular, like Earth, to a long thin ellipse, like Halley\'s comet. A marker on the orbit shows the planet at a chosen angle from the Sun, with its distance. Perihelion and aphelion are the nearest and farthest points.',
  setup: (stage, c) => createPlot(stage, { x: [-1, 1], y: [-1, 1], c, pad: 14 }),
  draw(ctx, stage, c, plot) {
    const o = orbit(state.a, state.e);
    // fit the orbit: scale to the larger of the two half-extents
    const half = state.a * 1.1;
    const ratio = stage.w / stage.h;
    plot.setRange([-half * ratio - o.c, half * ratio - o.c].map((v) => v), [-half, half]);
    plot.axes({ xLabel: '', yLabel: '', grid: false });
    curve(plot, trace((t) => [o.c * 0 + state.a * Math.cos(t) - o.c, o.b * Math.sin(t)], 0, Math.PI * 2, 300), { color: c.a, width: 4 });
    const nu = (state.nu * Math.PI) / 180;
    const r = rAt();
    plot.segment(0, 0, r * Math.cos(nu), r * Math.sin(nu), { color: c.grid, width: 2, dash: [4, 4] });
    plot.point(0, 0, { fill: c.fillY, r: 11 });
    plot.point(r * Math.cos(nu), r * Math.sin(nu), { fill: c.b, r: 8 });
    plot.text('Sun', 0, -half * 0.12, { size: 11, patch: false });
    plot.point(o.peri, 0, { fill: c.c, r: 5 });
    plot.point(-o.apo, 0, { fill: c.c, r: 5 });
  },
  controls: [
    { title: 'Choose an orbit' },
    { row: BODIES.slice(0, 2).map(([name, a, e]) => ({ button: name, ghost: true, onClick: () => { Object.assign(state, { a, e }); tool.update(); } })) },
    { row: BODIES.slice(2).map(([name, a, e]) => ({ button: name, ghost: true, onClick: () => { Object.assign(state, { a, e }); tool.update(); } })) },
    { key: 'e', label: 'Eccentricity, e', min: 0, max: 0.98, step: 0.005, format: (n) => n.toFixed(3) },
    { key: 'nu', label: 'Angle from perihelion, θ', min: 0, max: 360, step: 1, format: (n) => `${n}°` },
    { readout: [
      ['Semi-major axis, a', (s) => `${sig(s.a, 3)} AU`],
      ['Nearest (perihelion)', (s) => `${sig(orbit(s.a, s.e).peri, 3)} AU`],
      ['Farthest (aphelion)', (s) => `${sig(orbit(s.a, s.e).apo, 3)} AU`],
      ['Distance now', (s) => `${sig(rAt(s), 3)} AU`],
    ] },
  ],
  tex: (s) => `r=\\dfrac{a(1-e^2)}{1+e\\cos\\theta}=${sig(rAt(s), 3)}\\ \\text{AU},\\quad r_{\\min}=a(1-e)=${sig(orbit(s.a, s.e).peri, 3)},\\ r_{\\max}=a(1+e)=${sig(orbit(s.a, s.e).apo, 3)}`,
});
