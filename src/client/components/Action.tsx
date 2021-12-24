import { ComponentChildren, h } from "preact";
import { useState } from "preact/hooks";
import { ClientAction } from "../actions/index.ts";
import { Text } from "./Text.tsx";

export const Action = (
  { action, size, onLeftClick, onRightClick, trigger }: {
    action?: ClientAction;
    size: number;
    onLeftClick?: () => void;
    onRightClick?: () => void;
    trigger?: ComponentChildren;
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
        backgroundSize: "cover",
        background: [action && `url("${action.icon}")`, "black"]
          .filter(Boolean).join(", "),
        // background:
        //   `conic-gradient(transparent, 90%, transparent, 90%, rgba(0,0,255,0.5)), url("${action
        //     ?.icon}"), black`,
        color: "white",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseDown={(e) => {
        e.preventDefault();
        e.stopPropagation();

        if (e.button === 0) onLeftClick?.();
        if (e.button === 2) onRightClick?.();
      }}
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
          <div style={{ fontWeight: "bold" }}>{action.name}</div>
          {"description" in action && <div>{action.description}</div>}
        </div>
      )}
      {trigger && (
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
          {trigger}
        </Text>
      )}
    </span>
  );
};
