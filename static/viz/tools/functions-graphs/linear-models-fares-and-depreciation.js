import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';

// Both stories are made up for practice; the numbers are not real tariffs or prices.
const STORIES = {
  taxi: { name: 'Taxi fare', x: 'distance', xu: 'km', yu: '₹', bmin: 20, bmax: 100, mmin: 5, mmax: 25, b: 50, m: 12, xmax: 20, ymax: 400, sign: 1, bword: 'the fare for 0 km (the starting charge)', mword: 'each extra km adds' },
  car: { name: 'Value of a scooter', x: 'age', xu: 'years', yu: '₹ thousand', bmin: 40, bmax: 120, mmin: 3, mmax: 12, b: 80, m: 6, xmax: 10, ymax: 130, sign: -1, bword: 'the price when new (age 0)', mword: 'each year it loses' },
};
const state = { story: 'taxi', b: 50, m: 12, x: 8 };
const S = (s = state) => STORIES[s.story];
const value = (s, x) => s.b + S(s).sign * s.m * x;
let tool;

tool = createTool({
  state,
  label: 'A straight-line model built from a story. The line starts at the intercept b on the vertical axis and goes up or down by m for each unit along the horizontal axis. A marker shows the value at a chosen input, and the readouts say in words what m and b mean in the story.',
  setup: (stage, c) => createPlot(stage, { x: [-1, 20], y: [-30, 400], c, pad: 20 }),
  draw(ctx, stage, c, plot) {
    const st = S();
    plot.setRange([-0.05 * st.xmax, st.xmax], [-0.07 * st.ymax, st.ymax]);
    plot.axes({ xLabel: st.xu, yLabel: st.yu === '₹' ? '₹' : '₹ k' });
    plot.fn((x) => value(state, x), { color: c.a, width: 4, domain: [0, st.xmax] });
    plot.point(0, state.b, { fill: c.c, r: 8 });
    plot.segment(state.x, 0, state.x, value(state, state.x), { color: c.grid, width: 2, dash: [4, 4] });
    plot.point(state.x, value(state, state.x), { fill: c.fillY, r: 9 });
  },
  controls: [
    { title: 'Build the model' },
    { key: 'story', label: 'Story', options: [['taxi', 'Taxi fare'], ['car', 'Scooter value']] },
    { key: 'b', label: 'Intercept, b', min: 20, max: 120, step: 5 },
    { key: 'm', label: 'Rate, m', min: 3, max: 25, step: 1 },
    { key: 'x', label: 'Input', min: 0, max: 20, step: 1 },
    { readout: [
      ['b means', (s) => `${S(s).bword}: ${s.b}`],
      ['m means', (s) => `${S(s).mword} ${s.m}`],
      ['Value there', (s) => `${fixed(value(s, s.x), 1)} ${S(s).yu}`],
    ] },
  ],
  onChange(s) {
    const st = STORIES[s.story];
    if (s.b < st.bmin) s.b = st.bmin;
    if (s.b > st.bmax) s.b = st.bmax;
    if (s.m < st.mmin) s.m = st.mmin;
    if (s.m > st.mmax) s.m = st.mmax;
    s.x = Math.min(s.x, st.xmax);
  },
  tex: (s) => `${s.story === 'taxi' ? 'C' : 'V'}=${s.story === 'taxi' ? `${s.m}x+${s.b}` : `${s.b}-${s.m}x`}\\ \\Rightarrow\\ ${s.story === 'taxi' ? 'C' : 'V'}(${s.x})=${fixed(value(s, s.x), 1)}`,
});
