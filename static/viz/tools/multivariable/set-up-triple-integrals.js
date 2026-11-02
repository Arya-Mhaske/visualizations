import { createStepper } from '../../lib/stepper.js';
import { liveFormula } from '../../lib/formula.js';

// Project the solid down onto the xy plane to get a region D. Over each point of D, z runs from the bottom surface to the top.
// Then ∭ f dV = ∬_D ( ∫ f dz ) dA.
export const SOLIDS = {
  tetra: { name: 'Corner of a box: x + y + z ≤ 1, x, y, z ≥ 0', region: 'the triangle x, y ≥ 0, x + y ≤ 1', zlo: () => 0, zhi: (x, y) => 1 - x - y, inD: (x, y) => x >= 0 && y >= 0 && x + y <= 1, box: [0, 1, 0, 1], exact: 1 / 6, exactTex: '\\tfrac16', lo: '0', hi: '1-x-y', outer: '\\int_0^1\\!\\!\\int_0^{1-x}\\!\\!\\int_0^{1-x-y}' },
  ball: { name: 'Ball: x² + y² + z² ≤ 4', region: 'the disk x² + y² ≤ 4', zlo: (x, y) => -Math.sqrt(4 - x * x - y * y), zhi: (x, y) => Math.sqrt(4 - x * x - y * y), inD: (x, y) => x * x + y * y <= 4, box: [-2, 2, -2, 2], exact: (32 * Math.PI) / 3, exactTex: '\\tfrac{32\\pi}{3}', lo: '-\\sqrt{4-x^2-y^2}', hi: '\\sqrt{4-x^2-y^2}', outer: '\\iint_{x^2+y^2\\le4}\\int' },
  bowl: { name: 'Under z = x² + y², inside x² + y² ≤ 1', region: 'the disk x² + y² ≤ 1', zlo: () => 0, zhi: (x, y) => x * x + y * y, inD: (x, y) => x * x + y * y <= 1, box: [-1, 1, -1, 1], exact: Math.PI / 2, exactTex: '\\tfrac{\\pi}{2}', lo: '0', hi: 'x^2+y^2', outer: '\\iint_{x^2+y^2\\le1}\\int' },
};
const state = { solid: 'tetra' };
export function volume(key, n = 600) {
  const S = SOLIDS[key];
  const [x0, x1, y0, y1] = S.box;
  const dx = (x1 - x0) / n;
  const dy = (y1 - y0) / n;
  let v = 0;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    const x = x0 + (i + 0.5) * dx;
    const y = y0 + (j + 0.5) * dy;
    if (S.inD(x, y)) v += (S.zhi(x, y) - S.zlo(x, y)) * dx * dy;
  }
  return v;
}

function steps(s) {
  const S = SOLIDS[s.solid];
  return [
    { text: `Sketch the solid: ${S.name}.` },
    { text: `Project it onto the xy plane: its shadow is ${S.region}.` },
    { text: 'Over each point (x, y) of the shadow, a vertical line enters the solid at the bottom surface and leaves at the top.', tex: `${S.lo}\\le z\\le ${S.hi}` },
    { text: 'Write the integral: the z limits are innermost, the shadow gives the others.', tex: `V=${S.outer}\\,1\\,dz\\,dA` },
    { text: 'Evaluating (numerically here):', tex: `V\\approx ${volume(s.solid).toFixed(4)}` },
    { text: 'Check with the known formula.', tex: `V=${S.exactTex}=${S.exact.toFixed(4)}` },
  ];
}
const formula = liveFormula(document.querySelector('#formula'), (s) => `\\iiint_E dV=\\iint_D\\left[z\\right]_{z_{\\text{bottom}}}^{z_{\\text{top}}}dA=${volume(s.solid).toFixed(4)}`);
formula.update(state);

createStepper({
  stage: document.querySelector('#stage'),
  panel: document.querySelector('#panel'),
  state,
  steps,
  controls: [
    { title: 'Choose a solid' },
    { key: 'solid', label: 'Solid E', options: Object.entries(SOLIDS).map(([k, v]) => [k, v.name]) },
    { readout: [['Volume by stacking', (s) => volume(s.solid).toFixed(4)], ['Known formula', (s) => SOLIDS[s.solid].exact.toFixed(4)]] },
  ],
  onChange: (s) => formula.update(s),
});
