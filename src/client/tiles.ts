import { Material, MeshPhongMaterial, NearestFilter, Texture } from "three";

const QUALITY = 256;
const FILL = 0.98;
const textures: Record<number, Texture> = {};
const materials = new Map<Texture, Material>();

const hourglass = (
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  rotate?: boolean,
): void => {
  const offsetX = QUALITY * centerX;
  const offsetY = QUALITY * centerY;

  const r = rotate ? -1 : 1;

  const half = QUALITY / 2;
  const edge = (QUALITY * (1 - FILL)) / 2;

  const p1 = { x: -half + offsetX, y: edge * r + offsetY };
  const p2 = { x: -edge + offsetX, y: edge * r + offsetY };
  const p3 = { x: edge + offsetX, y: -edge * r + offsetY };
  const p4 = { x: edge + offsetX, y: -half * r + offsetY };

  const p5 = { x: half + offsetX, y: -edge * r + offsetY };
  const p6 = { x: -edge + offsetX, y: half * r + offsetY };

  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.bezierCurveTo(p2.x, p2.y, p3.x, p3.y, p4.x, p4.y);
  ctx.lineTo(p5.x, p5.y);
  ctx.bezierCurveTo(p3.x, p3.y, p2.x, p2.y, p6.x, p6.y);
  ctx.lineTo(p1.x, p1.y);
  ctx.fill();
};

const canvasTexture = (
  fn: (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => void,
): Texture => {
  let hash = 0;
  let canvas;

  try {
    canvas = document.createElement("canvas");
    canvas.width = QUALITY;
    canvas.height = QUALITY;

    const context = canvas.getContext("2d")!;
    context.fillStyle = "#133a2b";
    context.fillRect(0, 0, QUALITY, QUALITY);
    context.fillStyle = "#0b4f35";
    fn(context, canvas);

    // Crap hashing; it breaks down if QUALITY is changed
    const bits = context.getImageData(0, 0, QUALITY, QUALITY).data;
    for (let i = 0; i < bits.length; i += 809) {
      hash = ((hash + 2217911) * bits[i]) % 14689313;
    }
  } catch { /* ignore errors */ }

  if (textures[hash]) return textures[hash];

  const texture = new Texture(canvas);
  texture.needsUpdate = true;
  texture.magFilter = texture.minFilter = NearestFilter;

  textures[hash] = texture;

  return texture;
};

const TOPLEFT = 1;
const TOP = 2;
const TOPRIGHT = 4;
const LEFT = 8;
const CENTER = 16;
const RIGHT = 32;
const BOTLEFT = 64;
const BOT = 128;
const BOTRIGHT = 256;

export const materialsBitmap = Array(2 ** 9)
  .fill(0)
  .map((_, i) =>
    canvasTexture((ctx) => {
      const half = QUALITY / 2;
      const diameter = QUALITY * FILL;
      const radius = diameter / 2;
      const edge = (QUALITY * (1 - FILL)) / 2;

      if (i & CENTER) {
        ctx.beginPath();
        ctx.ellipse(half, half, radius, radius, 0, 0, 2 * Math.PI);
        ctx.fill();

        if (i & TOP) ctx.fillRect(edge, half, diameter, half);
        if (i & LEFT) ctx.fillRect(0, edge, half, diameter);
        if (i & RIGHT) ctx.fillRect(half, edge, half, diameter);
        if (i & BOT) ctx.fillRect(edge, 0, diameter, half);

        if (i & TOPLEFT) hourglass(ctx, 0, 1);
        if (i & TOPRIGHT) hourglass(ctx, 1, 1, true);
        if (i & BOTLEFT) hourglass(ctx, 0, 0, true);
        if (i & BOTRIGHT) hourglass(ctx, 1, 0);

        if (i & TOP && i & LEFT) ctx.fillRect(0, half, half, half);
        if (i & TOP && i & RIGHT) ctx.fillRect(half, half, half, half);
        if (i & BOT && i & LEFT) ctx.fillRect(0, 0, half, half);
        if (i & BOT && i & RIGHT) ctx.fillRect(half, 0, half, half);
      } else {
        if (i & TOP && i & LEFT) hourglass(ctx, 0, 1, true);
        if (i & TOP && i & RIGHT) hourglass(ctx, 1, 1);
        if (i & BOT && i & LEFT) hourglass(ctx, 0, 0);
        if (i & BOT && i & RIGHT) hourglass(ctx, 1, 0, true);
      }
    })
  )
  .map((map) => {
    const mat = materials.get(map);
    if (mat) return mat;
    const newMat = new MeshPhongMaterial({ map });
    materials.set(map, newMat);
    return newMat;
  });
