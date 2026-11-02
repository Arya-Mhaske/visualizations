import { createDrill } from '../../lib/drill.js';

// Classic optimisation set. Every answer is worked out by setting the derivative to zero; the explanation shows that step.
const KINDS = [
  (r) => {
    const L = r.int(4, 12) * 20; // metres of fence
    return { prompt: `You have ${L} m of fencing for a rectangular field along a straight river (no fence on the river side). What width x, at right angles to the river, gives the greatest area?`, tex: `A=x(${L}-2x)`, answer: L / 4, tolerance: 0.01, unit: 'm',
      hint: 'Write A in terms of x, differentiate, set A′ = 0.', explain: `A = ${L}x − 2x², A′ = ${L} − 4x = 0, so x = ${L / 4} m. A″ = −4 < 0, so it is a maximum.` };
  },
  (r) => {
    const a = r.int(3, 8) * 6; // side of the sheet in cm
    const x = a / 6;
    return { prompt: `Squares of side x are cut from the corners of a ${a} cm square sheet and the sides folded up into an open box. Find the x that gives the greatest volume.`, tex: `V=x(${a}-2x)^2`, answer: x, tolerance: 0.01, unit: 'cm',
      hint: 'Use the product rule, then factor V′.', explain: `V′ = (${a} − 2x)(${a} − 6x) = 0. x = ${a / 2} gives no box, so x = ${a / 6} cm.` };
  },
  (r) => {
    const P = r.int(4, 12) * 10; // perimeter in metres
    const rad = P / (4 + Math.PI);
    return { prompt: `A Norman window is a rectangle topped by a semicircle. Its whole perimeter is ${P} m. What radius of the semicircle lets in the most light (greatest area)? Give a number to 2 decimals.`, tex: `A=2rh+\\tfrac12\\pi r^2,\\quad P=2r+2h+\\pi r`, answer: Number(rad.toFixed(4)), tolerance: 0.02, unit: 'm',
      hint: 'Use P to write h in terms of r, then differentiate A.', explain: `h = (P − 2r − πr)/2, so A = Pr − (2 + π/2)r². A′ = P − (4 + π)r = 0 gives r = P/(4 + π) = ${rad.toFixed(3)} m.` };
  },
  (r) => {
    const s = r.int(3, 9) * 10; // sum
    return { prompt: `Two positive numbers add up to ${s}. What is the largest their product can be?`, tex: `P=x(${s}-x)`, answer: (s / 2) ** 2, tolerance: 0.01,
      hint: 'Write P in terms of x and find where P′ = 0.', explain: `P′ = ${s} − 2x = 0, so x = ${s / 2}, and P = ${s / 2} × ${s / 2} = ${(s / 2) ** 2}.` };
  },
];

createDrill({
  stage: document.querySelector('#stage'),
  panel: document.querySelector('#panel'),
  seed: 5,
  generate(rng) {
    return KINDS[rng.int(0, KINDS.length - 1)](rng);
  },
});
