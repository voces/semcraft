/**
 * Actions: move, switchLeft(), switchRight()
 */

import { actions } from "../actions/index.ts";
import { currentSemcraft } from "../semcraftContext.ts";
import { data } from "../util/data.ts";
import { currentKeyboard } from "./keyboard.ts";
import { currentMouse } from "./mouse.ts";

const { current, set: setTransmit } = data<
  (
    data: ReturnType<typeof actions[keyof typeof actions]["clientHandler"]>,
  ) => void
>();
export { setTransmit };

export const controls = () => {
  const semcraft = currentSemcraft();

  const controls: Partial<
    Record<string, typeof actions[keyof typeof actions]>
  > = {};

  controls.Left = actions.move;
  controls.KeyF = actions.firebolt;

  const mouse = currentMouse();
  const keyboard = currentKeyboard();

  const process = () => {
    const hotkey = Object.entries(keyboard).concat(
      Object.entries(mouse.buttons),
    ).filter(([, v]) => v).map(([k]) => k).join(" + ");

    const event = controls[hotkey]?.clientHandler();
    if (event) current()(event);
  };

  semcraft.addEventListener("mousedown", process);
  semcraft.addEventListener("keydown", process);
  semcraft.addEventListener("mousemove", process);

  document.documentElement.addEventListener(
    "mouseleave",
    () => console.log("out"),
  );
};
