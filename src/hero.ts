import { Affinity, AffinityTuple, Widget } from "./core/Entity.ts";
import { currentSemcraft } from "./semcraftContext.ts";
import { data } from "./util/data.ts";

export type Hero = Widget & {
  affinities: NonNullable<Widget["affinities"]>;
  mana: number;
  life: number;
};

const { current: currentHero, set: setHero } = data<Hero>();
export { currentHero, setHero };

export const affinityMap = <T>(fn: (index: number) => T) =>
  Array.from(Array(Affinity.speed + 1), (_, k) => fn(k)) as AffinityTuple<T>;

export const normalize = (
  arr: number[],
  fn = (item: number, sum: number) => item / sum,
  sumFn?: (item: number) => number,
) => {
  const sum = sumFn
    ? arr.reduce((sum, v) => sum + sumFn(v), 0)
    : arr.reduce((sum, v) => sum + v, 0);

  return arr.map((v) => fn(v, sum));
};

/** Generate random hero affinities. */
export const initializeAffinities = (): AffinityTuple<number> =>
  Array(Affinity.speed + 1).fill(
    (1 / (Affinity.speed + 1)) ** (1 / 3),
  ) as AffinityTuple<number>;
//   normalize(
//     affinityMap(() => Math.random()),
//     (v, sum) => ((v ** 3) / sum) ** (1 / 3),
//     (item) => item ** 3,
//   ) as AffinityTuple<number>;

export const spellsheet = (
  affinities: [affinityIndex: number, affinity: number][],
) => {
  const parts = Array(Affinity.speed + 1).fill(0) as AffinityTuple<number>;
  for (const [index, affinity] of affinities) parts[index] = affinity;

  const manaWeights = normalize(
    parts.map((v) => v ** 0.5),
  ) as AffinityTuple<number>;

  const calcSpellAffinity = (hero: Hero): [number, AffinityTuple<number>] => {
    let sum = 0;
    const burns = affinityMap(() => 0);
    for (let i = 0; i < hero.affinities.length; i++) {
      sum += hero.affinities[i] * manaWeights[i];
      burns[i] = (1 - hero.affinities[i]) * manaWeights[i];
    }
    return [sum, burns];
  };

  return { parts, manaWeights, calcSpellAffinity };
};

export const newHero = () =>
  currentSemcraft().add({
    x: (Math.random() - 0.5) * 10,
    y: (Math.random() - 0.5) * 10,
    speed: 5,
    art: { geometry: { type: "cylinder" as const } },
    affinities: initializeAffinities(),
    counts: affinityMap(() => 0),
    transitions: affinityMap(() => affinityMap(() => 0)),
    life: 100,
    mana: 0,
  }) as Hero;
