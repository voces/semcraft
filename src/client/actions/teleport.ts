import { currentHero } from "../../hero.ts";
import { currentMouse } from "../systems/mouse.ts";
import { newCooldown } from "./util.ts";

const teleportFormula = (
  cooldown: number,
  mana: { space: number },
) => {
  const onCooldown = newCooldown(cooldown);

  return {
    name: "Teleport",
    icon: "./assets/teleport.svg",
    description: "Intantly transports you between two points.",
    handle: () => {
      const hero = currentHero();
      if (hero.mana < 0.1 || onCooldown()) return;

      const wantedMana = Object.values(mana).reduce((sum, v) => sum + v, 0);
      const p = Math.min(hero.mana, wantedMana) / wantedMana;

      const { ground: { x, y } } = currentMouse();
      return {
        action: "teleport",
        x,
        y,
        spaceMana: mana.space * p - 1e-15,
      };
    },
    cooldown,
    mana,
    formulate: teleportFormula,
  };
};

export const teleport = teleportFormula(100, {
  space: 5,
});
