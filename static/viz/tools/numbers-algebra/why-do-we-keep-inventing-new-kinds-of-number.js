import { createTool } from '../../lib/tool.js';
import { poly, dot, label } from '../../lib/draw.js';
import { LEVELS, EQNS } from './_number-systems-math.js';

const state = { eq: 'b', level: 1 };

createTool({
  state,
  label: 'Five nested boxes: the natural numbers inside the integers inside the rationals inside the reals inside the complex numbers. A dot shows where the answer of the chosen equation lives, and the boxes up to the chosen set are filled in.',
  draw(ctx, stage, c) {
    const dx = stage.w * 0.06;
    const dy = stage.h * 0.07;
    const fills = [c.fillA, c.fillB, c.fillC, c.fillA, c.fillB];
    const rect = (i) => {
      const k = 4 - i;
      const [x, y] = [8 + k * dx, 8 + k * dy];
      return [x, y, stage.w - 2 * x, stage.h - 2 * y];
    };
    for (let i = 4; i >= 0; i--) {
      const [x, y, w, h] = rect(i);
      poly(ctx, [[x, y], [x + w, y], [x + w, y + h], [x, y + h]], { fill: i <= state.level ? fills[i] : c.paper, stroke: c.ink });
      label(ctx, LEVELS[i], x + 14, y + 13, c, { size: 14, patch: false });
    }
    const eq = EQNS[state.eq];
    const [x, y, w, h] = rect(eq.home);
    const found = eq.home <= state.level;
    const px = eq.home === 0 ? x + w / 2 : x + w / 2;
    const py = eq.home === 0 ? y + h / 2 : y + dy * 0.55 + 4;
    dot(ctx, px, py, 8, found ? c.a : c.paper, c.ink);
    label(ctx, found ? `x = ${eq.sol}` : '?', px + 14, py, c, { size: 13, align: 'left', bounds: stage, patch: false });
    label(ctx, `${eq.text} in ${LEVELS[state.level]}: ${found ? 'solved' : 'no answer here'}`, stage.w / 2, stage.h - 12, c, { size: 12, bounds: stage, patch: false });
  },
  controls: [
    { title: 'An equation to solve' },
    { key: 'eq', label: 'Equation', options: Object.entries(EQNS).map(([k, v]) => [k, v.text]) },
    { key: 'level', label: 'Allowed numbers', options: LEVELS.map((n, i) => [i, n]) },
    { readout: [
      ['Answer', (s) => EQNS[s.eq].sol],
      ['First set that has it', (s) => LEVELS[EQNS[s.eq].home]],
      ['Solved here?', (s) => ({ text: EQNS[s.eq].home <= s.level ? 'yes' : 'no', good: EQNS[s.eq].home <= s.level })],
    ] },
  ],
  tex: (s) => `${EQNS[s.eq].text.replace('x²', 'x^2').replace('−', '-')}\\ \\Rightarrow\\ x=${EQNS[s.eq].sol.replace('±√2', '\\pm\\sqrt2').replace('±i', '\\pm i').replace('−', '-').replace('3/2', '\\tfrac32')}`,
});
