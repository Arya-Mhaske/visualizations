// Pure maths for the Projectiles box (SI, y up).
export const G = 9.8;
export const rad = (d) => (d * Math.PI) / 180;
export const pos = (v, th, t, h = 0) => [v * Math.cos(rad(th)) * t, h + v * Math.sin(rad(th)) * t - 0.5 * G * t * t];
export const vel = (v, th, t) => [v * Math.cos(rad(th)), v * Math.sin(rad(th)) - G * t];
export const flightTime = (v, th, h = 0) => {
  const vy = v * Math.sin(rad(th));
  return (vy + Math.sqrt(vy * vy + 2 * G * h)) / G;
};
export const range = (v, th, h = 0) => v * Math.cos(rad(th)) * flightTime(v, th, h);
export const peak = (v, th, h = 0) => h + (v * Math.sin(rad(th))) ** 2 / (2 * G);
