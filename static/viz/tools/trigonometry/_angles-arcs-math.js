// Pure maths for the Angles & Arcs box (no DOM). Checked by catalogue/tool_tests/test_trigonometry_angles_arcs.py.
export const DEG = Math.PI / 180;

export const principal = (deg) => ((deg % 360) + 360) % 360;
export const fullTurns = (deg) => Math.trunc(deg / 360);
export const coterminals = (deg) => [-1, 0, 1].map((k) => principal(deg) + (k * 360));

export const dmsToDecimal = (d, m, s) => d + m / 60 + s / 3600;
export function decimalToDms(x) {
  const total = Math.round(x * 3600);
  return [Math.floor(total / 3600), Math.floor(total / 60) % 60, total % 60];
}

export const arc = (r, rad) => r * rad;
export const chord = (r, rad) => 2 * r * Math.sin(rad / 2);
export const sectorArea = (r, rad) => 0.5 * r * r * rad;
export const fanArea = (r, rad, n) => n * 0.5 * r * r * Math.sin(rad / n);
export const speed = (r, omega) => r * omega;
export const followerOmega = (omega, driver, follower) => (omega * driver) / follower;
export const circumference = (shadowDeg, distance) => (360 / shadowDeg) * distance;
export const trueDiameter = (distance, angleDeg) => 2 * distance * Math.tan((angleDeg * DEG) / 2);
export const smallAngleDiameter = (distance, angleDeg) => distance * angleDeg * DEG;

export function angleClass(deg) {
  if (deg === 0) return 'zero';
  if (deg < 90) return 'acute';
  if (deg === 90) return 'right';
  if (deg < 180) return 'obtuse';
  if (deg === 180) return 'straight';
  return deg < 360 ? 'reflex' : 'full turn';
}
