import { currentHero } from "../../hero.ts";
import { currentMouse } from "../systems/mouse.ts";
import { newCooldown } from "./util.ts";

// export const poisonNova = {
//   name: "Poison nova",
//   icon: "./assets/poisonnova.svg",
//   description: "Fires a nova of poison.",
//   handle: () => {
//     const hero = currentHero();
//     if (hero.mana < 0.1 || onCooldown()) return;

//     const { ground: { x, y } } = currentMouse();
//     return { action: "poisonNova", x, y, mana: Math.min(hero.mana, 5) };
//   },
// };

const poisonNovaFormula = (
  cooldown: number,
  mana: { poison: number; conjuration: number },
) => {
  const onCooldown = newCooldown(cooldown);

  return {
    name: "Poison nova",
    icon: "./assets/poisonnova.svg",
    description: "Fires a nova of poison.",
    handle: () => {
      const hero = currentHero();
      if (hero.mana < 0.1 || onCooldown()) return;

      const wantedMana = Object.values(mana).reduce((sum, v) => sum + v, 0);
      const p = Math.min(hero.mana, wantedMana) / wantedMana;

      const { ground: { x, y } } = currentMouse();
      return {
        action: "poisonNova",
        x,
        y,
        poisonMana: mana.poison * p,
        conjurationMana: mana.conjuration * p,
      };
    },
    cooldown,
    mana,
    formulate: poisonNovaFormula,
  };
};

export const poisonNova = poisonNovaFormula(750, {
  poison: 4.9,
  conjuration: 0.1,
});
