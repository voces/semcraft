import { ComponentChildren, h } from "preact";
import { Entity } from "../../core/Entity.ts";
import { useECS } from "../hooks/useECS.ts";

const keys = ["life", "maxLife", "mana", "entityId"] as const;

type Unit = Required<Pick<Entity, typeof keys[number]>>;

/**
 * Formats the number to have n digits.
 * @example
 * precise(0.36, 1); // "0.4"
 * precise(0.36, 2); // "0.36"
 * precise(0.36, 3); // "0.360"
 * precise(360, 1); // "400"
 */
const precision = (value: number, digits: number) => {
  const precise = value.toPrecision(digits);
  return precise.includes("e") ? parseFloat(precise) : precise;
};

const Bar = (
  { value, maxValue, color = "red", children }: {
    value: number;
    maxValue: number;
    color?: string;
    children?: ComponentChildren;
  },
) => {
  const percent = value / maxValue * 100;
  return (
    <div
      style={{
        background: `linear-gradient(90deg, ${color}, ${percent}%, ${color}, ${
          percent + 1
        }%, transparent)`,
      }}
    >
      {children}
    </div>
  );
};

const Vitals = ({ hero }: { hero: Unit }) => (
  <div style={{ color: "white" }}>
    <div>Entity {hero.entityId}</div>
    <Bar value={hero.life} maxValue={hero.maxLife} color="red">
      Life: {precision(hero.life, 2)} / {precision(hero.maxLife, 2)}
    </Bar>
    <Bar value={hero.mana} maxValue={hero.maxLife} color="blue">
      Mana: {precision(hero.mana, 2)} / {precision(hero.maxLife, 2)}
    </Bar>
  </div>
);

export const VitalsBoard = () => {
  const data = useECS(keys);

  return (
    <div
      style={{
        position: "absolute",
        top: 16,
        left: 16,
      }}
    >
      {Array.from(data.values()).map((hero) => <Vitals hero={hero} />)}
    </div>
  );
};
