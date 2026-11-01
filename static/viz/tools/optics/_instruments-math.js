// Maths for the optical-instruments box. Lengths in cm. The near point D is 25 cm.
import { nAt } from './_prism-math.js';

export const NEAR = 25;

// Magnifier: the object sits a distance u (<= f) from a lens of focal length f. Image at v (negative: virtual, on the same side).
export const imageDist = (f, u) => (u === f ? -Infinity : 1 / (1 / f - 1 / u)); // magnitudes, u > 0, v < 0 means virtual
export const angleUnaided = (h) => h / NEAR; // radians, small angle
export const angleWith = (h, u) => h / u; // the image subtends the same angle as the object seen from the lens
export const magnifier = (f, atNear) => (atNear ? 1 + NEAR / f : NEAR / f);
// The object distance that puts the virtual image at distance `d` from the lens: 1/u = 1/f + 1/d.
export const objectFor = (f, d) => 1 / (1 / f + 1 / d);

// Compound microscope. Lens separation L. Final image at infinity (relaxed eye) or at the near point.
export function microscope({ fo, fe, L, atNear }) {
  const ue = atNear ? (fe * NEAR) / (fe + NEAR) : fe; // the intermediate image sits this far from the eyepiece
  const vo = L - ue; // and this far behind the objective
  if (vo <= fo) return null; // no real image
  const uo = 1 / (1 / fo - 1 / vo);
  const mo = vo / uo;
  const me = atNear ? 1 + NEAR / fe : NEAR / fe;
  return { ue, vo, uo, mo, me, M: mo * me };
}

// Telescope, objective fo and eyepiece fe a distance d apart; the object is very far away.
// The intermediate image is at fo; its distance from the eyepiece is ue = d - fo.
export function telescope({ fo, fe, d }) {
  const ue = d - fo;
  const normal = Math.abs(d - (fo + fe)) < 1e-9;
  const inv = 1 / fe - 1 / ue; // 1/v from the lens equation with magnitudes: 1/v = 1/f - 1/u (real image positive)
  const v = Math.abs(inv) < 1e-12 ? Infinity : 1 / inv; // negative: virtual image
  const M = ue > 0 ? fo / ue : Infinity; // angle of the image over angle of the object
  return { ue, v, M, normal };
}
export const telescopeAngle = (fo, fe, alphaDeg) => (Math.atan((fo * Math.tan((alphaDeg * Math.PI) / 180)) / fe) * 180) / Math.PI;

// A single glass lens (equal radii) of diameter Dm and focal ratio N: how far apart are the red and violet foci?
export function lensColour(Dm, ratio) {
  const f = Dm * ratio; // the mean focal length at 580 nm
  const R = 2 * (nAt(580) - 1) * f;
  const focus = (nm) => R / (2 * (nAt(nm) - 1));
  return { f, R, red: focus(700), violet: focus(410), spread: focus(700) - focus(410), at: focus };
}
// Blur on the image: the diameter of the red circle when the violet is in focus (similar triangles with the aperture).
export const blurSize = (Dm, spread, f) => (Dm * spread) / f;
