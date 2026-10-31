import { createTool } from '../../lib/tool.js';
import { venn } from '../../lib/discrete.js';
import { label } from '../../lib/draw.js';
import { surveyRegions, surveyValid } from './_sets-math.js';

const state = { total: 100, tea: 60, coffee: 45, both: 20 };
const regions = (s) => surveyRegions(s.total, s.tea, s.coffee, s.both);
const valid = (s) => surveyValid(s.total, s.tea, s.coffee, s.both);

createTool({
  state,
  label: 'A Venn diagram of tea and coffee drinkers, with the count in each region and the people who drink neither in the corner.',
  draw(ctx, stage, c) {
    const r = regions(state);
    venn(ctx, { x: 6, y: 6, w: stage.w - 12, h: stage.h - 40 }, c, { a: c.fillA, b: c.fillB, both: c.fillY }, {
      names: ['Tea', 'Coffee'], counts: { a: r.teaOnly, both: state.both, b: r.coffeeOnly, none: `neither ${r.neither}` },
    });
    label(ctx, valid(state) ? `${state.total} people surveyed` : 'These numbers can\'t all be true', stage.w / 2, stage.h - 16, c, { size: 12, bounds: stage, color: valid(state) ? c.ink : c.a });
  },
  controls: [
    { title: 'Fill from the middle out' },
    { key: 'total', label: 'People surveyed', min: 20, max: 200, step: 5 },
    { key: 'tea', label: 'Drink tea', min: 0, max: 200, step: 5 },
    { key: 'coffee', label: 'Drink coffee', min: 0, max: 200, step: 5 },
    { key: 'both', label: 'Drink both', min: 0, max: 100, step: 5 },
    { readout: [
      ['Tea only', (s) => (valid(s) ? String(regions(s).teaOnly) : '—')],
      ['Coffee only', (s) => (valid(s) ? String(regions(s).coffeeOnly) : '—')],
      ['At least one', (s) => (valid(s) ? String(s.tea + s.coffee - s.both) : '—')],
      ['Neither', (s) => (valid(s) ? String(regions(s).neither) : '—')],
      ['Consistent?', (s) => ({ text: valid(s) ? 'yes' : 'no', good: valid(s) })],
    ] },
  ],
  tex: (s) => `n(T \\cup C) = ${s.tea} + ${s.coffee} - ${s.both} = ${s.tea + s.coffee - s.both}`,
});
