import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { poly } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { salt, saltRates } from './_separable-math.js';

// dS/dt = (inflow of salt) − (outflow of salt) = r·c_in − r·S/V. Equal flows in and out keep the volume V fixed.
const state = { V: 100, r: 5, cin: 0.2, S0: 0, tau: 1.5 };
const tau = (s) => s.V / s.r;
const at = (s, t) => salt(s.V, s.r, s.cin, s.S0, t);
const time = (s) => s.tau * tau(s);

createTool({
  state,
  label: 'A well-stirred tank of fixed volume with salt water flowing in and the mixture flowing out at the same rate. A graph shows the amount of salt in the tank rising or falling towards the value where inflow equals outflow, shown as a dashed line. The time slider is measured in time constants, volume over flow rate.',
  setup: (stage, c) => createPlot(stage, { x: [0, 10], y: [0, 40], c, pad: 22, box: (st) => ({ x: st.w * 0.34, y: 0, w: st.w * 0.66, h: st.h }) }),
  draw(ctx, stage, c, plot) {
    const final = state.V * state.cin;
    const top = Math.max(final, state.S0, 1) * 1.15;
    plot.setRange([0, 5 * tau(state)], [0, top]);
    plot.axes({ xLabel: 't (min)', yLabel: 'salt (kg)' });
    plot.segment(0, final, 5 * tau(state), final, { color: c.grid, width: 3, dash: [6, 5] });
    plot.fn((t) => at(state, t), { color: c.a, width: 4 });
    plot.point(time(state), at(state, time(state)), { fill: c.fillY, r: 8 });
    const conc = at(state, time(state)) / state.V;
    const [x0, x1] = [stage.w * 0.05, stage.w * 0.27];
    const [y0, y1] = [stage.h * 0.2, stage.h * 0.8];
    poly(ctx, [[x0, y0], [x1, y0], [x1, y1], [x0, y1]], { fill: c.paper, stroke: c.ink, width: 4 });
    ctx.save();
    ctx.globalAlpha = Math.min(1, 0.12 + (conc / 0.4) * 0.88);
    poly(ctx, [[x0 + 2, y0 + 2], [x1 - 2, y0 + 2], [x1 - 2, y1 - 2], [x0 + 2, y1 - 2]], { fill: c.fillB });
    ctx.restore();
  },
  controls: [
    { title: 'Mix the salt water' },
    { key: 'tau', label: 'Time (in time constants)', min: 0, max: 5, step: 0.1, format: (n) => `${fixed(n, 1)} τ` },
    { key: 'S0', label: 'Salt at the start', min: 0, max: 40, step: 5, format: (n) => `${n} kg` },
    { key: 'cin', label: 'Salt in the inflow', min: 0, max: 0.4, step: 0.05, format: (n) => `${fixed(n, 2)} kg/L` },
    { key: 'r', label: 'Flow in = flow out', min: 2, max: 10, step: 1, format: (n) => `${n} L/min` },
    { key: 'V', label: 'Tank volume', min: 50, max: 200, step: 10, format: (n) => `${n} L` },
    { readout: [
      ['Time now', (s) => `${fixed(time(s), 1)} min`],
      ['Salt in the tank', (s) => `${fixed(at(s, time(s)), 2)} kg`],
      ['Concentration', (s) => `${fixed(at(s, time(s)) / s.V, 3)} kg/L`],
      ['Salt in − salt out', (s) => `${fixed(saltRates(s.V, s.r, s.cin, at(s, time(s))).inflow - saltRates(s.V, s.r, s.cin, at(s, time(s))).outflow, 3)} kg/min`],
      ['Settles at', (s) => ({ text: `${fixed(s.V * s.cin, 1)} kg`, good: true })],
    ] },
  ],
  tex: (s) => `\\dfrac{dS}{dt}=r\\,c_{in}-\\dfrac{r}{V}S\\ \\Rightarrow\\ S=${fixed(s.V * s.cin, 1)}+(${fixed(s.S0 - s.V * s.cin, 1)})e^{-t/${fixed(tau(s), 1)}}`,
});
