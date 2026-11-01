// Pure maths for the Cylindrical & Spherical Coordinates box (no DOM). z is up; θ is measured from +x in the xy plane;
// φ is measured down from +z (0 to π); ρ is the distance from the origin. Angles are in radians.
// Checked by catalogue/tool_tests/test_vectors_3d_cylindrical_spherical.py.
export const toCylindrical = (x, y, z) => ({ r: Math.hypot(x, y), theta: Math.atan2(y, x), z });
export const fromCylindrical = (r, theta, z) => [r * Math.cos(theta), r * Math.sin(theta), z];
export const toSpherical = (x, y, z) => {
  const rho = Math.hypot(x, y, z);
  return { rho, theta: Math.atan2(y, x), phi: rho === 0 ? 0 : Math.acos(z / rho) };
};
export const fromSpherical = (rho, theta, phi) => [rho * Math.sin(phi) * Math.cos(theta), rho * Math.sin(phi) * Math.sin(theta), rho * Math.cos(phi)];
export const deg = (r) => (r * 180) / Math.PI;
export const rad = (d) => (d * Math.PI) / 180;

// Latitude λ north of the equator is φ = 90° − λ. East longitude is θ (mod 360°).
export const phiFromLatitude = (lat) => 90 - lat;
export const thetaFromLongitude = (lon) => ((lon % 360) + 360) % 360;
export const EARTH_RADIUS_KM = 6371;
export const CITIES = {
  pune: { name: 'Pune', lat: 18.5204, lon: 73.8567 },
  delhi: { name: 'Delhi', lat: 28.6139, lon: 77.209 },
  greenwich: { name: 'Greenwich', lat: 51.4769, lon: 0 },
  sydney: { name: 'Sydney', lat: -33.8688, lon: 151.2093 },
};
