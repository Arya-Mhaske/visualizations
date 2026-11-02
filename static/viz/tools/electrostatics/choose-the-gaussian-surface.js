import { createDrill } from '../../lib/drill.js';

const OPT = ['A sphere centred on it', 'A cylinder along its axis', 'A pillbox through the sheet', 'No simple surface works'];
const CASES = [
  ['a point charge', 0, 'The field points straight out and depends only on r, so a sphere keeps E constant on the surface.'],
  ['a uniformly charged solid sphere', 0, 'It has spherical symmetry: use a concentric sphere.'],
  ['a thin charged spherical shell', 0, 'Spherical symmetry again: a concentric sphere inside or outside.'],
  ['a very long straight charged wire', 1, 'The field points radially outward and depends on the distance from the wire, so use a coaxial cylinder.'],
  ['a long uniformly charged cylinder', 1, 'Cylindrical symmetry: use a coaxial cylinder.'],
  ['a large flat sheet of charge', 2, 'The field is perpendicular to the sheet and equal on both sides, so a pillbox straddling the sheet works.'],
  ['a large charged conducting plate', 2, 'Close to the plate its field is uniform and perpendicular: a pillbox does it.'],
  ['an electric dipole', 3, 'It has no spherical, cylindrical or planar symmetry, so E is not constant on any simple surface.'],
  ['a short charged rod', 3, 'Too short to be a long cylinder and not a sphere, so there is no simple Gaussian surface. Gauss still holds, but cannot give E.'],
  ['a small charged disc, near its edge', 3, 'A finite disc has no symmetry that makes E constant on a simple surface.'],
];

createDrill({
  stage: document.querySelector('#stage'),
  panel: document.querySelector('#panel'),
  seed: 3,
  generate(rng) {
    const [name, ans, why] = rng.pick(CASES);
    const options = rng.shuffle([0, 1, 2, 3]);
    return {
      prompt: `Which Gaussian surface would you choose to find the field of ${name}?`,
      options: options.map((i) => OPT[i]),
      answer: options.indexOf(ans),
      hint: 'Which shape keeps E constant, and at right angles to the surface, all over it?',
      explain: `${OPT[ans]}. ${why}`,
    };
  },
});
