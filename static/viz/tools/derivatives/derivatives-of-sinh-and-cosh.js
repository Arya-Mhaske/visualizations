import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { deriv, tangent } from '../../lib/graph.js';
import { fixed } from '../../lib/format.js';

const HYP = {
  sinh: { f: Math.sinh, d: Math.cosh, dName: 'cosh x', twin: "(sin x)′ = cos x", tex: (x) => `\\dfrac{d}{dx}\\sinh x=\\dfrac{e^{x}+e^{-x}}{2}=\\cosh x=${fixed(Math.cosh(x), 3)}` },
  cosh: { f: Math.cosh, d: Math.sinh, dName: 'sinh x', twin: "(cos x)′ = −sin x", tex: (x) => `\\dfrac{d}{dx}\\cosh x=\\dfrac{e^{x}-e^{-x}}{2}=\\sinh x=${fixed(Math.sinh(x), 3)}` },
};
const state = { which: 'sinh', x: 1 };

createTool({
  state,
  label: 'The graph of sinh x or cosh x with its tangent, and the graph of the other function drawn dashed. The slope of sinh is cosh, and the slope of cosh is sinh, with no minus sign, unlike sine and cosine.',
  setup: (stage, c) => createPlot(stage, { x: [-3, 3], y: [-5, 8], c, pad: 20 }),
  draw(ctx, stage, c, plot) {
    const h = HYP[state.which];
    plot.axes();
    plot.fn(h.d, { color: c.b, width: 3, dash: [6, 5] });
    plot.fn(h.f, { color: c.a, width: 4 });
    tangent(plot, state.x, h.f(state.x), deriv(h.f, state.x), 0.6, { color: c.ink, width: 4 });
    plot.point(state.x, h.f(state.x), { fill: c.fillY });
    plot.point(state.x, h.d(state.x), { fill: c.fillB, r: 5 });
    plot.text(state.which === 'sinh' ? 'sinh x' : 'cosh x', 2.1, state.which === 'sinh' ? -3.3 : 5.8, { size: 11, color: c.a, patch: false });
    plot.text(h.dName, -2.2, state.which === 'sinh' ? 6.2 : -3.3, { size: 11, color: c.b, patch: false });
  },
  controls: [
    { title: 'Slope of a hyperbolic function' },
    { key: 'which', label: 'Function', options: [['sinh', 'sinh x'], ['cosh', 'cosh x']] },
    { key: 'x', label: 'x', min: -2.5, max: 2.5, step: 0.05, format: (n) => fixed(n, 2) },
    { readout: [
      ['Slope (measured)', (s) => fixed(deriv(HYP[s.which].f, s.x), 4)],
      ['Dashed curve here', (s) => ({ text: fixed(HYP[s.which].d(s.x), 4), good: true })],
      ['cosh² − sinh²', (s) => fixed(Math.cosh(s.x) ** 2 - Math.sinh(s.x) ** 2, 4)],
      ['The trig twin', (s) => HYP[s.which].twin],
    ] },
  ],
  tex: (s) => HYP[s.which].tex(s.x),
});
