import { createTool } from '../../lib/tool.js';
import { cellGrid } from '../../lib/discrete.js';
import { mod7, related, weekday } from './_sets-math.js';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const LENGTH = 31;
const state = { a: 3, b: 24, first: 1 };
let tool = null;

tool = createTool({
  state,
  label: 'A month of 31 dates in rows of seven. Dates with the same remainder on division by 7 are lit, so each class is one column.',
  dom: (el) => cellGrid(el, {
    rows: 5,
    cols: 7,
    cell(r, c) {
      const date = r * 7 + c + 1;
      if (date > LENGTH) return { text: '' };
      const lit = related(date, state.a);
      return { text: String(date), state: date === state.a ? 'both' : date === state.b ? 'mark' : lit ? 'on' : '', label: `Date ${date}` };
    },
    onPress(r, c) {
      const date = r * 7 + c + 1;
      if (date > LENGTH) return;
      state.a = date;
      tool.update();
    },
  }),
  controls: [
    { title: 'Same class, same weekday' },
    { text: 'Press a date. Green dates share its remainder on division by 7.' },
    { key: 'a', label: 'Date a', min: 1, max: LENGTH },
    { key: 'b', label: 'Date b', min: 1, max: LENGTH },
    { key: 'first', label: 'The 1st falls on', min: 0, max: 6, format: (v) => DAYS[v] },
    { readout: [
      ['a mod 7', (s) => String(mod7(s.a))],
      ['b mod 7', (s) => String(mod7(s.b))],
      ['a − b', (s) => String(s.a - s.b).replace('-', '−')],
      ['Related?', (s) => ({ text: related(s.a, s.b) ? 'yes: 7 divides a − b' : 'no', good: related(s.a, s.b) })],
      ['Date a is a', (s) => DAYS[weekday(s.first, s.a)]],
      ['Date b is a', (s) => DAYS[weekday(s.first, s.b)]],
    ] },
  ],
  tex: (s) => `${s.a} - ${s.b} = ${s.a - s.b}\\ ${related(s.a, s.b) ? `= 7 \\times (${(s.a - s.b) / 7})` : '\\text{, not a multiple of 7}'}`,
});
