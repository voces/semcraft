import { currentHero } from "../../hero.ts";
import { currentMouse } from "../systems/mouse.ts";
import { newCooldown } from "./util.ts";

const fireboltFormula = (
  cooldown: number,
  mana: { fire: number; conjuration: number },
) => {
  const onCooldown = newCooldown(cooldown);

  return {
    name: "Fire bolt",
    // https://game-icons.net/1x1/lorc/plasma-bolt.html
    icon: "./assets/firebolt.svg",
    description: "Fires a fire bolt.",
    handle: () => {
      const hero = currentHero();
      if (hero.mana < 0.1 || onCooldown()) return;

      const wantedMana = Object.values(mana).reduce((sum, v) => sum + v, 0);
      const p = Math.min(hero.mana, wantedMana) / wantedMana;

      const { ground: { x, y } } = currentMouse();
      return {
        action: "firebolt",
        x,
        y,
        fireMana: mana.fire * p,
        conjurationMana: mana.conjuration * p,
      };
    },
    cooldown,
    mana,
    formulate: fireboltFormula,
  };
};

export const firebolt = fireboltFormula(750, { fire: 4.95, conjuration: 0.05 });
