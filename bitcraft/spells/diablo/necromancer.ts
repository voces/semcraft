import {
  AoE,
  AttackSpeed,
  Beam,
  Bolt,
  Buff,
  Cold,
  Corpse,
  Debuff,
  Fire,
  Guided,
  Item,
  LifeRegen,
  Lightning,
  Magic,
  MaxLife,
  Multiply,
  Nova,
  Physical,
  Poison,
  Reflect,
  Resistance,
  Strike,
  Summon,
  Vision,
  Wall,
} from "../../bits/index.ts";

export type RaiseSkeleton = Physical & Summon & Corpse;
export type Teeth = Magic & Bolt & Multiply;
export type BoneArmor = Physical & MaxLife & Buff;
export type AmplifyDamage = Debuff & AoE & Strike & Physical & Resistance;

export type ClayGolem = Physical & Summon;
export type PoisonDagger = Poison & Buff;
export type CorpseExplosion = Corpse & Fire & Physical;
export type DimVision = Debuff & AoE & Strike & Vision;
export type Weaken = Debuff & AoE & Strike & Physical;

export type SkeletalMage = RaiseSkeleton & (Cold | Fire | Lightning | Poison);
export type BoneWall = Summon & Physical & Wall;
export type IronMaiden = Debuff & AoE & Strike & Physical & Reflect;

export type BloodGolem = LifeRegen & Summon;
export type PoisonExplosion = CorpseExplosion & Poison;
export type BoneSpear = Magic & Beam;

// export type SummonResist =
//   & Summon
//   & Cold
//   & Fire
//   & Lightning
//   & Poison
//   & Resistance;
export type IronGolem = Summon & Item;
export type BonePrison = BoneWall & Nova;
export type Decrepify =
  & Debuff
  & AoE
  & Strike
  & AttackSpeed
  & Physical
  & Resistance;

export type FireGolem = Fire & Summon;
export type Revive = Summon & Corpse;
export type PoisonNova = Poison & Bolt & Nova;
export type BoneSpirit = Magic & Bolt & Guided;
export type LowerResist =
  & Debuff
  & AoE
  & Strike
  & Resistance
  & Cold
  & Fire
  & Lightning
  & Poison;
