import { createTool } from '../../lib/tool.js';
import { cellGrid } from '../../lib/discrete.js';
import { host, textBox } from './_aa-view.js';

// Claim P(n): 1 + 3 + 5 + ... + (2n − 1) = n². Press cells to say "P(n) fails here".
// If any n fails, the smallest failing n would need P(n − 1) true and P(n) false, which the step rule forbids.
const N = 12;
const state = { stepRule: true };
const failing = new Set([7]);
const smallest = () => (failing.size ? Math.min(...failing) : null);

const tool = createTool({
  state,
  label: 'Twelve numbered cells for the claim P(n). A pressed cell is a supposed counterexample. The panel shows the smallest one and why it cannot exist if P(1) is true and P(n) always forces P(n+1).',
  dom(el) {
    el.classList.add('viz-stage--flow');
    host(el, 'nb-label').textContent = 'Press a cell to say the claim fails at that n.';
    const grid = cellGrid(host(el), {
      rows: 2, cols: 6,
      cell: (r, col) => {
        const n = r * 6 + col + 1;
        const bad = failing.has(n);
        return { text: String(n), state: bad ? (n === smallest() ? 'both' : 'off') : 'on', label: `P(${n}) ${bad ? 'fails' : 'holds'}` };
      },
      onPress: (r, col) => {
        const n = r * 6 + col + 1;
        if (failing.has(n)) failing.delete(n); else failing.add(n);
        tool.update();
      },
    });
    const box = textBox(el);
    function refresh() {
      grid.refresh();
      const m = smallest();
      if (m === null) box.set(['No counterexample. P(1) is true and each true P(n) makes the next one true, so all are true.']);
      else if (m === 1) box.set(['P(1) fails: the base case is wrong. Check 1 = 1² to see it is true.']);
      else if (!state.stepRule) box.set([`Smallest failure: n = ${m}. P(${m - 1}) holds. With the step rule switched off, nothing stops P(${m}) failing.`]);
      else box.set([`Smallest failure: n = ${m}. P(${m - 1}) holds, since ${m - 1} is smaller and not a failure.`, `But the step rule says P(${m - 1}) forces P(${m}). Contradiction: no smallest failure can exist.`]);
    }
    refresh();
    return { refresh };
  },
  controls: [
    { title: 'Well-ordering' },
    { key: 'stepRule', label: 'Step rule: P(n) forces P(n + 1)', toggle: true },
    { readout: [
      ['Counterexamples', () => (failing.size ? [...failing].sort((a, b) => a - b).join(', ') : 'none')],
      ['Smallest one', () => (smallest() === null ? 'none' : String(smallest()))],
    ] },
  ],
  tex: () => '1+3+5+\\cdots+(2n-1)=n^2',
});
