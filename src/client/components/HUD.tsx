import { Fragment, h } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";
import { Semcraft } from "../../semcraft.ts";
import { actions } from "../actions/index.ts";
import { newClient } from "../client.ts";
import { SemcraftContext } from "../contexts/SemcraftContext.ts";
import { Controls as ControlsType } from "../controls.ts";
import { Controls } from "./Controls.tsx";
import { VitalsBoard } from "./Vitals.tsx";

export const HUD = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [controls] = useState<ControlsType>({
    Left: actions.move,
    Right: actions.firebolt,
    KeyQ: actions.poisonNova,
    KeyW: actions.firebolt,
  });
  const [app, setApp] = useState<Semcraft>();

  useEffect(() => {
    if (!canvasRef.current || app) return;

    const [semcraft] = newClient(canvasRef.current, controls);
    setApp(semcraft);

    // setApp triggers a remount, which is... unfortunate
    // return cb;
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
      {app && (
        <SemcraftContext.Provider value={app}>
          <VitalsBoard />
          <Controls controls={controls} />
        </SemcraftContext.Provider>
      )}
    </>
  );
};
