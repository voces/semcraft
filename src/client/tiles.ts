import { Material, MeshPhongMaterial, Texture } from "three";

const QUALITY = 64;
const FILL = 0.98;
const textures: Texture[] = [];
const materials = new Map<Texture, Material>();

// Computed by (in canvasTexture):
// 1) const newMap = new Map<string, number[]>();
// 2) Add the following aftenr fn():
//      hash = canvas.toDataURL();
//      newMap.set(hash, (newMap.get(hash) ?? []).concat(idx));
// 3) console.log(
//      JSON.stringify(
//        Array.from(newMap.values()).reduce((arr, values, i) => {
//          for (const value of values) arr[value] = i;
//          return arr;
//        }, []),
//      ),
//    );
//
// deno-fmt-ignore
const map = [0,0,0,0,0,0,0,0,0,0,1,1,0,0,1,1,2,3,4,5,6,7,8,9,10,11,12,12,13,14,15,15,0,0,16,16,0,0,16,16,0,0,17,17,0,0,17,17,18,19,20,21,22,23,20,21,24,25,26,26,27,28,26,26,0,0,0,0,0,0,0,0,0,0,1,1,0,0,1,1,29,30,31,32,33,34,35,36,37,38,39,39,40,41,42,42,0,0,16,16,0,0,16,16,0,0,17,17,0,0,17,17,43,44,45,46,47,48,45,46,49,50,51,51,52,53,51,51,0,0,0,0,0,0,0,0,54,54,55,55,54,54,55,55,56,57,58,59,60,61,62,63,64,65,66,66,67,68,69,69,70,70,71,71,70,70,71,71,72,72,73,73,72,72,73,73,74,75,76,77,78,79,76,77,80,81,82,82,83,84,82,82,0,0,0,0,0,0,0,0,54,54,55,55,54,54,55,55,85,86,87,88,89,90,91,92,64,65,66,66,67,68,69,69,70,70,71,71,70,70,71,71,72,72,73,73,72,72,73,73,93,94,95,96,97,98,95,96,80,81,82,82,83,84,82,82,0,0,0,0,0,0,0,0,0,0,1,1,0,0,1,1,99,100,101,102,103,104,105,106,107,108,109,109,110,111,112,112,0,0,16,16,0,0,16,16,0,0,17,17,0,0,17,17,113,114,115,116,117,118,115,116,119,120,121,121,122,123,121,121,0,0,0,0,0,0,0,0,0,0,1,1,0,0,1,1,124,125,126,127,128,129,130,131,132,133,134,134,135,136,137,137,0,0,16,16,0,0,16,16,0,0,17,17,0,0,17,17,138,139,140,141,142,143,140,141,144,145,146,146,147,148,146,146,0,0,0,0,0,0,0,0,54,54,55,55,54,54,55,55,149,150,151,152,153,154,155,156,157,158,159,159,160,161,162,162,70,70,71,71,70,70,71,71,72,72,73,73,72,72,73,73,74,75,76,77,78,79,76,77,80,81,82,82,83,84,82,82,0,0,0,0,0,0,0,0,54,54,55,55,54,54,55,55,163,164,165,166,167,168,169,170,157,158,159,159,160,161,162,162,70,70,71,71,70,70,71,71,72,72,73,73,72,72,73,73,93,94,95,96,97,98,95,96,80,81,82,82,83,84,82,82];

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

// We can use a Cache here with canvas.toBlob() functionality to speed up
// reloads, but I made it pretty fast for now.
const canvasTexture = (
  idx: number,
  fn: (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => void,
): Texture => {
  if (textures[map[idx]]) return textures[map[idx]];

  const texture = new Texture();

  queueMicrotask(() => {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = QUALITY;
      canvas.height = QUALITY;

      const context = canvas.getContext("2d")!;
      context.fillStyle = "#133a2b";
      context.fillRect(0, 0, QUALITY, QUALITY);
      context.fillStyle = "#0b4f35";
      fn(context, canvas);

      texture.image = canvas;
      texture.needsUpdate = true;
    } catch { /* ignore errors */ }
  });

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
    canvasTexture(i, (ctx) => {
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
