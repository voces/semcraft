/**
 * Actions: move, switchLeft(), switchRight()
 */

import { actions } from "../client/actions/index.ts";
import { currentSemcraft, withSemcraft } from "../semcraftContext.ts";
import { data } from "../util/data.ts";
import { currentKeyboard } from "./keyboard.ts";
import { currentMouse } from "./systems/mouse.ts";

const { current: getTransmit, set: setTransmit } = data<
  (
    data: ReturnType<typeof actions[keyof typeof actions]["handle"]>,
  ) => void
>();
export { getTransmit, setTransmit };

export type Controls = Partial<
  Record<string, typeof actions[keyof typeof actions]>
>;

export const newControls = (controls: Controls) => {
  const semcraft = currentSemcraft();

  const mouse = currentMouse();
  const keyboard = currentKeyboard();

  const process = async () => {
    const hotkey = Object.entries(keyboard).concat(
      Object.entries(mouse.buttons),
    ).filter(([, v]) => v).map(([k]) => k).join(" + ");

    const event = await controls[hotkey]?.handle();
    if (event) getTransmit()(event);
  };

  semcraft.addEventListener("mousedown", process);
  semcraft.addEventListener("keydown", process);
  semcraft.addEventListener("mousemove", process);

  globalThis.onbeforeunload = () => {
    withSemcraft(semcraft, () => getTransmit()({ action: "exit" }));
  };

  return { update: process };
};
