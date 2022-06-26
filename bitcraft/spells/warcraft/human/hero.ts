import {
  Ally,
  AoE,
  AttackSpeed,
  Aura,
  Beam,
  Bolt,
  Buff,
  Cold,
  Corpse,
  Debuff,
  Defense,
  Demon,
  Elemental,
  Enemy,
  Fire,
  Guided,
  Life,
  LifeRegen,
  Magic,
  ManaRegen,
  ManaSteal,
  MaxLife,
  MovementSpeed,
  Passive,
  Physical,
  Raven,
  Strike,
  Structure,
  Stun,
  Summon,
  Undead,
} from "../../../bits/index.ts";
import { Teleport } from "../../diablo/sorceress.ts";
// import { Blizzard } from "../../diablo/sorceress.ts";

export type Avatar = Buff & Physical & Defense & MaxLife;
export type Banish = Debuff & MovementSpeed & Physical & Elemental & Magic;
export type Bash = Passive & Physical & Stun;
// export type ArchMageBlizzard = Blizzard;
export type BrillianceAura = Aura & ManaRegen;
export type DevotionAura = Aura & Defense;
export type DivineShield = Buff & Defense;
export type FlameStrike = Strike & Fire & AoE & Structure;
export type HolyLight =
  & Strike
  & Magic
  & ((Ally & LifeRegen) | (Enemy & (Demon | Undead)));
export type MassTeleport = Teleport & AoE; // Ally?
export type Phoenix = Summon & Fire & Raven & LifeRegen;
export type Resurrection = Life & AoE & Corpse & Ally;
export type SiphonMana = Beam & ManaSteal;
export type StormBolt = Physical & Bolt & Guided & Stun;
export type SummonWaterElemental = Summon & Cold;
export type ThunderClap = AoE & Physical & Debuff & MovementSpeed & AttackSpeed;
