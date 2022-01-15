import { h } from "preact";
import { useECS } from "../hooks/useECS.ts";

export const Position = () => {
  const data = useECS(
    ["life", "maxLife", "mana", "entityId", "x", "y"] as const,
  );

  return (
    <div
      style={{
        position: "absolute",
        bottom: 8,
        left: 8,
      }}
    >
      {Array.from(data.values()).map((unit) => `(${unit.x}, ${unit.y})`)}
    </div>
  );
};
