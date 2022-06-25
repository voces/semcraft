import {
  AoE,
  AttackRating,
  AttackSpeed,
  Beam,
  Block,
  Bolt,
  Buff,
  Charge,
  Claw,
  Clone,
  Cold,
  CriticalStrike,
  Debuff,
  Defense,
  DualWield,
  Fire,
  Freeze,
  Knockback,
  LifeSteal,
  Lightning,
  Magic,
  ManaSteal,
  MovementSpeed,
  Multiply,
  Nova,
  Passive,
  Physical,
  Poison,
  Resistance,
  Strike,
  Summon,
  Weapon,
} from "../../bits/index.ts";
import { Firestorm } from "./druid.ts";
import { CorpseExplosion } from "./necromancer.ts";
import {
  ChainLightning,
  ChargedBolt,
  IceBolt,
  Inferno,
  Meteor,
  Teleport,
} from "./sorceress.ts";

export type TigerStrike = AttackRating & Physical & Charge;
export type DragonTalon = AttackRating & Physical & AttackSpeed & Charge;
export type ClawMastery =
  & Passive
  & Claw
  & AttackRating
  & Physical
  & CriticalStrike;
export type PsychicHammer = Physical & Magic & Strike;
export type FireBlast = Strike & Fire & AoE;

export type FistsOfFire = AttackRating & Fire & Charge;
export type DragonClaw = AttackRating & Physical & Charge;
export type BurstOfSpeed = Buff & AttackSpeed & MovementSpeed;
export type ShockWeb = Lightning & Strike & Multiply;
export type BladeSentinel = Physical & Beam & Weapon; // what about return?

export type CobraStrike = AttackRating & LifeSteal & ManaSteal & Charge;
export type WeaponBlock = Passive & DualWield & Claw & Block;
export type CloakOfShadows = Passive & Defense & Debuff & Nova;
export type ChargedBoltSentry = Summon & ChargedBolt;
export type WakeOfFire = Summon & Firestorm;

export type ClawsOfThunder =
  & Claw
  & AttackRating
  & Lightning
  & Charge
  & Nova
  & Bolt
  & Multiply;
export type DragonTail = Fire & AttackRating & Knockback & AoE & Charge;
export type Fade =
  & Buff
  & Physical
  & Fire
  & Lightning
  & Cold
  & Poison
  & Resistance
  & Debuff;
export type ShadowWarrior = Summon & Clone;
export type BladeFury = BladeSentinel & Multiply;

export type BladesOfIce = AttackRating & Charge & Cold & AoE & Freeze;
export type DragonFlight = AttackRating & Physical & Charge & Teleport;
export type MindBlast = Physical & AoE & Strike;
export type LightningSentry = Summon & Lightning;
export type WakeOfInferno = Summon & Inferno;

export type PhoenixStrike =
  & AttackRating
  & Charge
  & Meteor
  & ChainLightning
  & IceBolt
  & Multiply;
export type Venom = Buff & Poison;
export type ShadowMaster = ShadowWarrior;
export type DeathSentry = LightningSentry & CorpseExplosion;
export type BladeShield = Buff & AoE & Physical & Weapon;
