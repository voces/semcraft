import {
  AoE,
  AttackRating,
  AttackSpeed,
  Aura,
  Beam,
  Bear,
  Bolt,
  Buff,
  Charge,
  Cold,
  Corpse,
  Defense,
  Fire,
  LifeRegen,
  LifeSteal,
  Lightning,
  ManaRegen,
  ManaSteal,
  MaxLife,
  MaxMana,
  MaxStamina,
  MovementSpeed,
  Multiply,
  Nova,
  Physical,
  Poison,
  Raven,
  Reflect,
  Strike,
  Stun,
  Summon,
  Vines,
  Wolf,
} from "../../bits/index.ts";

export type Firestorm = Fire & AoE; // What about export type?
export type Werewolf = Buff & AttackSpeed & AttackRating & MaxLife & MaxStamina;
export type SummonRaven = Summon & Raven;
export type PoisonCreeper = Summon & Vines & Poison;

export type MoltenBoulder = Fire & Physical;
export type ArcticBlast = Cold & Beam;
export type Werebear = Buff & Physical & Defense & MaxLife;
// Summons results in a lower reserve against the caster than Auras
export type OakSage = Summon & MaxMana & Aura & MaxLife;
export type SummonSpiritWolf = Summon & Wolf;

export type Fissure = Fire & AoE; // compared to Firestorm?
export type CycloneArmor = Buff & MaxLife & Fire & Cold & Lightning;
export type FeralRage =
  & Physical
  & AttackRating
  & MovementSpeed
  & LifeSteal
  & Charge;
export type Maul = Physical & AttackRating & Stun;
export type CarrionVine = Summon & Vines & Corpse & LifeRegen;

export type Twister = Physical & Bolt & Multiply & Stun;
export type Rabies = Physical & Poison & AttackRating;
export type FireClaws = Fire & AttackRating;
export type HeartOfWolverine = Summon & Aura & Physical & AttackRating;
export type SummonDireWolf = Summon & Wolf & MaxMana & MaxLife;

export type Volcano = Physical & Fire & AoE & Strike;
export type Tornado = Physical & Bolt;
export type Hunger = Physical & AttackRating & LifeSteal & ManaSteal;
export type ShockWave = Physical & Nova & Stun;
export type SolarCreeper = Summon & Vines & Corpse & ManaRegen;

export type Armageddon = Buff & Fire & Strike & Multiply;
export type Hurricane = Buff & Cold & Nova;
export type Fury = AttackRating & Physical & AttackSpeed;
export type SpiritOfBarbs = Summon & Aura & Reflect;
export type SummonGrizzly = Summon & Bear;
