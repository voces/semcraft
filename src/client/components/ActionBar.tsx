import { Fragment, h } from "preact";
import { useState } from "preact/hooks";
import { ClientAction } from "../actions/index.ts";
import { Controls, getTransmit } from "../controls.ts";
import { Action } from "./Action.tsx";
import { ActionSelection } from "./ActionSelection.tsx";

const QWER = ["Q", "W", "E", "R"];
const ASDF = ["A", "S", "D", "F"];

const invoke = async (action?: ClientAction) => {
  const event = await action?.handle();
  if (event) getTransmit()(event);
};

export const ActionBar = (
  { controls }: { controls: Controls },
) => {
  const [showSelection, setShowSelection] = useState<string | undefined>(
    undefined,
  );

  return (
    <>
      <div
        style={{
          position: "absolute",
          bottom: 16,
          left: "50%",
          transform: "translateX(-50%)",
        }}
      >
        <Action
          action={controls.Left}
          onLeftClick={() => invoke(controls.Left)}
          onRightClick={() => setShowSelection("Left")}
          size={64}
          trigger={<img src="./assets/left.svg" style={{ width: 10 }}></img>}
        />
        <span style={{ display: "inline-block", verticalAlign: "bottom" }}>
          <div>
            {QWER.map((key) => (
              <Action
                action={controls[`Key${key}`]}
                onLeftClick={() => controls[`Key${key}`]}
                onRightClick={() => setShowSelection(`Key${key}`)}
                key={key}
                size={32}
                trigger={key}
              />
            ))}
          </div>
          <div>
            {ASDF.map((key) => (
              <Action
                action={controls[`Key${key}`]}
                onLeftClick={() => controls[`Key${key}`]}
                onRightClick={() => setShowSelection(`Key${key}`)}
                key={key}
                size={32}
                trigger={key}
              />
            ))}
          </div>
        </span>
        <Action
          action={controls.Right}
          onLeftClick={() => invoke(controls.Right)}
          onRightClick={() => setShowSelection("Right")}
          size={64}
          trigger={<img src="./assets/right.svg" style={{ width: 10 }}></img>}
        />
      </div>
      {showSelection && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.5)",
          }}
          onClick={() => setShowSelection(undefined)}
        >
          <ActionSelection
            // Note: IDK why this works. Should have to trigger a re-render...?
            onSelection={(action) => {
              controls[showSelection] = action;
              setShowSelection(undefined);
            }}
          />
        </div>
      )}
    </>
  );
};
