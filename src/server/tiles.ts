import { SIZE } from "../constants.ts";
import { currentSemcraft } from "../semcraftContext.ts";

const TOPLEFT = 1;
const TOP = 2;
const TOPRIGHT = 4;
const LEFT = 8;
const CENTER = 16;
const RIGHT = 32;
const BOTLEFT = 64;
const BOT = 128;
const BOTRIGHT = 256;

const grid = Array.from(
  Array(SIZE),
  () =>
    Array.from(Array(SIZE), () => Math.random() * Math.random() < 0.5 ? 0 : 1),
);

export const tiles = () => {
  const semcraft = currentSemcraft();

  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const matIdx = ((grid[y - 1]?.[x - 1] ?? 0) * TOPLEFT) +
        (grid[y - 1]?.[x] ?? 0) * TOP +
        (grid[y - 1]?.[x + 1] ?? 0) * TOPRIGHT +
        (grid[y][x - 1] ?? 0) * LEFT +
        (grid[y][x] ?? 0) * CENTER +
        (grid[y][x + 1] ?? 0) * RIGHT +
        (grid[y + 1]?.[x - 1] ?? 0) * BOTLEFT +
        (grid[y + 1]?.[x] ?? 0) * BOT +
        (grid[y + 1]?.[x + 1] ?? 0) * BOTRIGHT;

      const entity = {
        x: (x - SIZE / 2) + 0.5,
        y: (y - SIZE / 2) + 0.5,
        isTerrain: true,
        art: {
          geometry: { type: "plane" as const },
          material: { type: "tile" as const, index: matIdx },
        },
      };

      semcraft.add(entity);
    }
  }
};
