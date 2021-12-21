import { currentSemcraft, wrapSemcraft } from "../semcraftContext.ts";
import { data } from "../util/data.ts";

export type Keyboard = Partial<Record<string, boolean>>;

const { current: currentKeyboard, set } = data<Keyboard>();
export { currentKeyboard };

export const keyboard = () => {
  const keyboard: Keyboard = {};
  set(keyboard);

  const semcraft = currentSemcraft();

  globalThis.addEventListener(
    "keydown",
    wrapSemcraft(semcraft, (e) => {
      keyboard[e.code] = true;
      currentSemcraft().dispatchEvent("keydown", keyboard);
    }),
  );

  globalThis.addEventListener(
    "keyup",
    wrapSemcraft(semcraft, (e) => {
      keyboard[e.code] = false;
      currentSemcraft().dispatchEvent("keyup", keyboard);
    }),
  );
};
