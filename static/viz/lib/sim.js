// Fixed-timestep simulation. Velocity Verlet for forces, RK4 for general systems; never plain Euler.
//   const sim = createSim(stageEl, {
//     init: () => ({ t: 0, x: [0], v: [20] }),        // or y: [...] for RK4
//     accel: (x, t) => [-9.8],                        // Verlet (depends on position and time only)
//     deriv: (t, y) => [...],                         // RK4 (use this if forces depend on velocity)
//     dt: 1 / 120, speed: 1, onFrame(state) {}, stopWhen(state) -> bool });
//   sim.play(), sim.pause(), sim.step(), sim.reset(); sim.state; sim.playing.
//   With reduced motion, play() does nothing and returns false: use sim.step(), offered by transport().
//   transport(sim) returns a { row: [...] } entry for bindControls.
//   createClock(target, { onFrame }) is a sim with no physics, for tools that animate an exact formula: use clock.state.t.
import { createLoop, reducedMotion } from './anim.js';

export function verletStep({ t, x, v }, accel, dt) {
  const a0 = accel(x, t);
  const nextX = x.map((xi, i) => xi + v[i] * dt + 0.5 * a0[i] * dt * dt);
  const a1 = accel(nextX, t + dt);
  return { t: t + dt, x: nextX, v: v.map((vi, i) => vi + 0.5 * (a0[i] + a1[i]) * dt) };
}

export function rk4Step({ t, y }, deriv, dt) {
  const along = (base, slope, h) => base.map((yi, i) => yi + slope[i] * h);
  const k1 = deriv(t, y);
  const k2 = deriv(t + dt / 2, along(y, k1, dt / 2));
  const k3 = deriv(t + dt / 2, along(y, k2, dt / 2));
  const k4 = deriv(t + dt, along(y, k3, dt));
  return { t: t + dt, y: y.map((yi, i) => yi + (dt / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i])) };
}

export function createSim(target, { init, accel, deriv, dt = 1 / 120, speed = 1, onFrame = () => {}, stopWhen = () => false }) {
  const advance = (state) => (accel ? verletStep(state, accel, dt) : rk4Step(state, deriv, dt));
  let spare = 0;
  const sim = {
    state: init(),
    speed,
    play() {
      if (stopWhen(sim.state)) sim.reset();
      return loop.start();
    },
    pause() { loop.stop(); },
    get playing() { return loop.playing; },
    reset() {
      loop.stop();
      spare = 0;
      sim.state = init();
      onFrame(sim.state);
    },
    // One visible step for reduced-motion users: a tenth of a second of simulated time.
    step(seconds = 0.1) {
      for (let i = Math.round(seconds / dt); i > 0 && !stopWhen(sim.state); i--) sim.state = advance(sim.state);
      onFrame(sim.state);
    },
  };
  const loop = createLoop(target, (elapsed) => {
    spare += elapsed * sim.speed;
    while (spare >= dt && !stopWhen(sim.state)) {
      sim.state = advance(sim.state);
      spare -= dt;
    }
    if (stopWhen(sim.state)) loop.stop();
    onFrame(sim.state);
  });
  return sim;
}

export const createClock = (target, { speed = 1, onFrame = () => {} } = {}) => createSim(target, {
  init: () => ({ t: 0, y: [] }), deriv: () => [], dt: 1 / 60, speed, onFrame,
});

export function transport(sim, { onChange = () => {} } = {}) {
  const row = [
    { button: 'Play', onClick() { sim.play(); onChange(); } },
    { button: 'Pause', ghost: true, onClick() { sim.pause(); onChange(); } },
    { button: 'Step', ghost: true, onClick() { sim.pause(); sim.step(); onChange(); } },
    { button: 'Reset', ghost: true, onClick() { sim.reset(); onChange(); } },
  ];
  return { row: reducedMotion() ? row.slice(2) : row };
}
