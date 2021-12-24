import { ComponentChildren, h, JSX } from "preact";
import { Entity } from "../../core/Entity.ts";
import { precision } from "../../util/formatting.ts";
import { useECS } from "../hooks/useECS.ts";
import { Text } from "./Text.tsx";

const keys = ["life", "maxLife", "mana", "entityId"] as const;

type Unit = Required<Pick<Entity, typeof keys[number]>>;

const Bar = (
  { value, maxValue, color = "red", style, children }: {
    value: number;
    maxValue: number;
    color?: string;
    style?: JSX.CSSProperties;
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
        fontSize: 12,
        textAlign: "center",
        borderRadius: 2,
        boxShadow: "0.5px 0.5px 3px black",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

const Vitals = ({ unit }: { unit: Unit }) => (
  <div style={{ color: "white" }}>
    <span
      style={{
        display: "inline-block",
        background: 'url("./assets/deadly-strike.svg")',
        width: 72,
        height: 72,
        borderRadius: "50%",
        verticalAlign: "middle",
        zIndex: 1,
        position: "relative",
        boxShadow: "0.5px 0.5px 3px black",
      }}
    >
    </span>
    <span
      style={{
        display: "inline-block",
        verticalAlign: "middle",
        marginLeft: -6,
        marginTop: -8,
        width: 192,
      }}
    >
      <Text dropShadow={3} style={{ paddingLeft: 6 }}>
        Entity {unit.entityId}
      </Text>
      <Bar
        value={unit.life}
        maxValue={unit.maxLife}
        color="red"
        style={{ marginBottom: 4 }}
      >
        <Text dropShadow={3}>
          {precision(unit.life, 2)} / {precision(unit.maxLife, 2)}
        </Text>
      </Bar>
      <Bar value={unit.mana} maxValue={unit.maxLife} color="blue">
        <Text dropShadow={3}>
          {precision(unit.mana, 2)} / {precision(unit.maxLife, 2)}
        </Text>
      </Bar>
    </span>
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
      {Array.from(data.values()).map((unit) => <Vitals unit={unit} />)}
    </div>
  );
};
