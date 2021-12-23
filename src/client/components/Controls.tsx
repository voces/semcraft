import { ComponentChildren, h } from "preact";
import { useState } from "preact/hooks";
import { Controls as ControlsType } from "../controls.ts";

const Hotkey = (
  { size, hotkey, action }: {
    hotkey?: ComponentChildren;
    size: 32 | 64;
    action?: Readonly<{
      name: string;
      icon: string;
      description?: string;
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
        border: "2px solid #111",
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
    >
      {hovered && action && (
        <div
          style={{
            position: "absolute",
            border: "2px solid #111",
            background: "black",
            bottom: "calc(100% + 8px)",
            left: -2,
            padding: 2,
            zIndex: 1,
            maxWidth: 250,
            width: "max-content",
          }}
        >
          <div>{action.name}</div>
          {action.description && <div>{action.description}</div>}
        </div>
      )}
      <span
        style={{
          position: "absolute",
          left: "50%",
          transform: "translate(-50%, 50%)",
          bottom: 0,
          fontWeight: "bold",
          filter: Array(5).fill("drop-shadow(0 0 1px black)").join(" "),
          fontSize: 13,
        }}
      >
        {hotkey}
      </span>
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
