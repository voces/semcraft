import {
  AoE,
  AttackRating,
  AttackSpeed,
  Beam,
  Bolt,
  Bow,
  Burn,
  Clone,
  Cold,
  CriticalStrike,
  Debuff,
  Defense,
  Durability,
  Fire,
  Freeze,
  Guided,
  Human,
  Javelin,
  Knockback,
  Lightning,
  Magic,
  Missile,
  MovementSpeed,
  Multiply,
  Nova,
  Passive,
  Physical,
  Pierce,
  Poison,
  Spear,
  Summon,
} from "../../bits/index.ts";
import { ChainLightning, ChargedBolt } from "./sorceress.ts";

export type Jab = (Javelin | Spear) & Physical & AttackRating;
export type InnerSight = Debuff & Nova & Defense;
export type CriticalStrikeAttack = CriticalStrike;
export type MagicArrow =
  & Bow
  & Magic
  & Bolt
  & AttackRating
  & Physical
  & Knockback;
export type FireArrow = Missile & Fire & AttackRating;

export type PowerStrike = (Javelin | Spear) & Lightning & AttackRating;
export type PoisonJavelin = Javelin & Poison & AoE;
export type Dodge = Passive & Physical & Defense;
export type ColdArrow = Missile & Cold & AttackRating;
export type MultipleShot = Missile & Multiply;

export type Impale = Spear & Physical & Durability;
export type LightningBolt = Javelin & Physical & Lightning;
export type SlowMissiles = Nova & Missile & MovementSpeed;
export type Avoid = Passive & Missile & Defense;
export type ExplodingArrow = FireArrow & AoE;

export type ChargedStrike = (Javelin | Spear) & ChargedBolt;
export type PlagueJavelin = PoisonJavelin;
export type Penetrate = Passive & AttackRating;
export type IceArrow = Missile & Cold & Freeze & AttackRating;
export type GuidedArrow = Missile & Physical & Guided;

export type Fend = AttackRating & Physical & AttackSpeed;
export type Decoy = Summon & Clone;
export type Evade = Passive & Missile & Defense;
export type Strafe = Bow & Physical & AttackSpeed;
export type ImmolationArrow = FireArrow & Burn;

export type LightningStrike = (Javelin | Spear) & ChainLightning;
export type LightningFury = Javelin & Lightning & Beam & Multiply;
export type Valkyrie = Summon & Human;
export type MissilePierce = Passive & Missile & Pierce;
export type FreezingArrow = ColdArrow & Freeze;
