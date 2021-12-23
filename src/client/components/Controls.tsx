import { ComponentChildren, h } from "preact";
import { useState } from "preact/hooks";
import { actions } from "../actions/index.ts";
import { Controls as ControlsType, getTransmit } from "../controls.ts";
import { Text } from "./Text.tsx";

const Hotkey = (
  { size, hotkey, action }: {
    hotkey?: ComponentChildren;
    size: 32 | 64;
    action?: Readonly<{
      name: string;
      icon: string;
      description?: string;
      handle: typeof actions[keyof typeof actions]["handle"];
    }>;
  },
) => {
  const [hovered, setHovered] = useState(false);

  return (
    <span
      style={{
        display: "inline-block",
        width: size,
        height: size,
        boxShadow: "0.5px 0.5px 3px black",
        borderRadius: 2,
        margin: size / 16,
        position: "relative",
        cursor: "pointer",
        backgroundColor: "black",
        backgroundImage: action?.icon ? `url("${action.icon}")` : undefined,
        backgroundSize: "cover",
        color: "white",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={action
        ? async (e) => {
          e.preventDefault();
          e.stopPropagation();
          const event = await action.handle();
          if (event) getTransmit()(event);
        }
        : undefined}
    >
      {hovered && action && (
        <div
          style={{
            position: "absolute",
            boxShadow: "0.5px 0.5px 3px black",
            borderRadius: 2,
            background: "black",
            bottom: "calc(100% + 8px)",
            left: -2,
            padding: 4,
            zIndex: 1,
            maxWidth: 250,
            width: "max-content",
          }}
        >
          <div>{action.name}</div>
          {action.description && <div>{action.description}</div>}
        </div>
      )}
      <Text
        dropShadow={5}
        style={{
          position: "absolute",
          left: "50%",
          transform: "translate(-50%, 50%)",
          bottom: 0,
          fontWeight: "bold",
          fontSize: 13,
        }}
      >
        {hotkey}
      </Text>
    </span>
  );
};

const QWER = ["Q", "W", "E", "R"];
const ASDF = ["A", "S", "D", "F"];

export const Controls = (
  { controls }: { controls: ControlsType },
) => (
  <div
    style={{
      position: "absolute",
      bottom: 16,
      left: "50%",
      transform: "translateX(-50%)",
    }}
  >
    <Hotkey
      size={64}
      hotkey={<img src="./assets/left.svg" style={{ width: 10 }}></img>}
      action={controls.Left}
    />
    <span style={{ display: "inline-block", verticalAlign: "bottom" }}>
      <div>
        {QWER.map((key) => (
          <Hotkey
            key={key}
            size={32}
            hotkey={key}
            action={controls[`Key${key}`]}
          />
        ))}
      </div>
      <div>
        {ASDF.map((key) => (
          <Hotkey
            key={key}
            size={32}
            hotkey={key}
            action={controls[`Key${key}`]}
          />
        ))}
      </div>
    </span>
    <Hotkey
      size={64}
      hotkey={<img src="./assets/right.svg" style={{ width: 10 }}></img>}
      action={controls.Right}
    />
  </div>
);

function currentTransmit() {
  throw new Error("Function not implemented.");
}
