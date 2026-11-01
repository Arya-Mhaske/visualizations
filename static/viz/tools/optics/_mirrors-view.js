// Drawing shared by the paraxial mirror tools: the bench with its labels, the object, the rays and the image.
import { dot, label } from '../../lib/draw.js';
import { imageOf, principalRays } from './_mirrors-math.js';

// The rays hit the tangent plane at P, the usual paraxial drawing. The mirror's true curve would leave them crossing the
// glass, so it is drawn much flatter than it is: just enough to show which kind of mirror it is.
export function drawBench(bench, stage, c, { f }) {
  const v = bench.view();
  const flatR = (v.right - v.left) * 2;
  bench.axis();
  bench.mirror(f < 0 ? flatR : -flatR, Math.min(v.top, -v.bottom) * 0.85);
  bench.mark('P', 0, { below: false });
  bench.mark('F', f);
  bench.mark('C', 2 * f);
}

export function drawRay(bench, c, u, h, ray, color, image) {
  bench.ray([u, h], ray.hit, { color });
  const end = bench.rayTo(ray.hit, ray.dir, { color });
  if (image.atInfinity || image.real) return end;
  bench.ray(ray.hit, [image.v, image.m * h], { color, dash: [5, 5], arrow: false });
  return end;
}

// names picks which rays, with their colours: { parallel: c.b, ... }
export function drawScene(bench, stage, ctx, c, { u, h, f, colors }) {
  const image = imageOf(u, f);
  for (const ray of principalRays(u, h, f)) {
    if (colors[ray.name]) drawRay(bench, c, u, h, ray, colors[ray.name], image);
  }
  bench.object(u, h, c.a);
  if (image.atInfinity) return image;
  const tip = [image.v, image.m * h];
  if (bench.inView(...tip)) {
    bench.object(image.v, image.m * h, c.c, image.real ? {} : { dash: [6, 4] });
    dot(ctx, ...bench.toPx(...tip), 4, c.c, c.ink, 1);
  } else {
    label(ctx, 'Image is off the drawing', stage.w / 2, 12, c, { size: 12, bounds: stage, color: c.c });
  }
  return image;
}
