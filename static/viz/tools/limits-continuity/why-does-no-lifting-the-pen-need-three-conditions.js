import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';

// Near x = a = 2: a line f(x) = x/2 + 1 with one break of size g. a is where we test continuity.
const A = 2;
const state = { kind: 'ok', g: 1.5 };
const line = (x) => x / 2 + 1;
const L = (s) => (s.kind === 'nolimit' ? null : line(A));
const fa = (s) => (s.kind === 'undefined' ? null : s.kind === 'differ' ? line(A) + s.g : line(A));
const left = () => line(A);
const right = (s) => (s.kind === 'nolimit' ? line(A) + s.g : line(A));
const yes = (b) => (b ? '✓ yes' : '✗ no');

createTool({
  state,
  label: 'A graph near x equals 2 that can be broken in three ways. A hole where the function has no value. A jump where the left and right limits disagree. Or a limit that exists but the function takes a different value. Three checks are listed and the graph can be drawn without lifting the pen only if all three pass.',
  setup: (stage, c) => createPlot(stage, { c, x: [0, 4], y: [0, 5] }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'x', yLabel: 'f(x)' });
    plot.fn(line, { color: c.a, domain: [0, A] });
    plot.fn((x) => line(x) + (right(state) - line(A)), { color: c.a, domain: [A, 4] });
    plot.segment(A, 0, A, 5, { color: c.grid, width: 1.5, dash: [4, 4] });
    const val = fa(state);
    if (state.kind === 'nolimit') {
      plot.point(A, left(), { fill: c.a });
      plot.point(A, right(state), { fill: c.paper });
    } else {
      plot.point(A, left(), { fill: c.paper });
      if (val !== null) plot.point(A, val, { fill: state.kind === 'differ' ? c.b : c.a });
    }
  },
  controls: [
    { title: 'Break the graph' },
    { key: 'kind', label: 'What is wrong at x = 2', options: [['ok', 'Nothing'], ['undefined', 'No value'], ['nolimit', 'Jump'], ['differ', 'Wrong value']] },
    { key: 'g', label: 'Size of the break', min: 0.5, max: 2, step: 0.5, format: (v) => v.toFixed(1) },
    { readout: [
      ['1. f(2) is defined', (s) => yes(fa(s) !== null || s.kind === 'nolimit')],
      ['2. limit exists', (s) => yes(L(s) !== null)],
      ['3. limit = f(2)', (s) => yes(s.kind === 'ok')],
      ['Draw without lifting the pen?', (s) => ({ text: s.kind === 'ok' ? 'yes' : 'no', good: s.kind === 'ok' })],
    ] },
  ],
  tex: (s) => `f(2)=${fa(s) === null ? '\\text{undefined}' : fa(s).toFixed(1)},\\quad \\lim_{x\\to2}f(x)=${L(s) === null ? '\\text{does not exist}' : L(s).toFixed(1)}`,
});
