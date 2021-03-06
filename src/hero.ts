import { affinityCount, AffinityTuple, Widget } from "./core/Entity.ts";
import { data } from "./util/data.ts";

/** An entity representing a unit. */
type Unit = Widget & {
  life: number;
};

export type Hero = Unit & {
  affinities: NonNullable<Widget["affinities"]>;
  counts: NonNullable<Widget["counts"]>;
  mana: NonNullable<Widget["mana"]>;
  maxLife: NonNullable<Widget["maxLife"]>;
};

// TODO: This should just alias on client.hero
const { current: currentHero, set: setHero, tryGetHero } = data<Hero>();
export { currentHero, setHero, tryGetHero };

const affinityMap = <T>(fn: (index: number) => T) =>
  Array.from(Array(affinityCount + 1), (_, k) => fn(k)) as AffinityTuple<T>;

const normalize = <T extends number[]>(
  arr: T,
  fn = (item: number, sum: number) => item / sum,
  sumFn?: (item: number) => number,
) => {
  const sum = sumFn
    ? arr.reduce((sum, v) => sum + sumFn(v), 0)
    : arr.reduce((sum, v) => sum + v, 0);

  return arr.map((v) => fn(v, sum)) as T;
};

export const normalizeAffinities = <T extends number[]>(arr: T) =>
  normalize(arr, (v, sum) => ((v ** 3) / sum) ** (1 / 3), (item) => item ** 3);

/** Generate random hero affinities. */
const initializeAffinities = (): AffinityTuple<number> =>
  Array(affinityCount + 1).fill(
    (1 / (affinityCount + 1)) ** (1 / 3),
  ) as AffinityTuple<number>;
//   normalize(
//     affinityMap(() => Math.random()),
//     (v, sum) => ((v ** 3) / sum) ** (1 / 3),
//     (item) => item ** 3,
//   ) as AffinityTuple<number>;

export const newHero = () => ({
  // deno-lint-ignore no-explicit-any
  entityId: (crypto as any).randomUUID(),
  name: "Hero",
  isHero: true,
  x: 0,
  y: 0,
  // x: (Math.random() - 0.5) * 10,
  // y: (Math.random() - 0.5) * 10,
  speed: 5,
  art: { geometry: { type: "cylinder" as const } },
  affinities: initializeAffinities(),
  counts: affinityMap(() => 0),
  life: 100,
  maxLife: 100,
  mana: 0,
  // TODO: we can't send this entity through the tubes because of this hook
  // We can avoid this by adding {transformers: [fnName: string, ...args: unknown[]][]}
  // beforeDelete: (e) => {
  //   e.x = (Math.random() - 0.5) * 10;
  //   e.y = (Math.random() - 0.5) * 10;
  //   e.life = e.maxLife;
  //   return false;
  // },
} as Hero);
