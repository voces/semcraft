import { Fragment, h } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";
import { actions } from "../actions/index.ts";
import { newClient } from "../client.ts";
import { Controls as ControlsType } from "../controls.ts";
import { Controls } from "./Controls.tsx";

export const HUD = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [controls] = useState<ControlsType>({
    Left: actions.move,
    Right: actions.firebolt,
    KeyQ: actions.poisonNova,
    KeyW: actions.firebolt,
  });

  useEffect(() => {
    if (!canvasRef.current) return;

    return newClient(canvasRef.current, controls);
  }, [canvasRef.current]);

  return (
    <>
      <canvas
        id="semcraft-canvas"
        ref={canvasRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
        }}
      />
      <Controls controls={controls} />
    </>
  );
};
