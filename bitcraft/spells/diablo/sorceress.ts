import {
  AoE,
  Beam,
  Bolt,
  Buff,
  Bypass,
  Chain,
  Cold,
  Fire,
  Freeze,
  Item,
  LifeRegen,
  Lightning,
  Magic,
  ManaRegen,
  MovementSpeed,
  Multiply,
  Nova,
  Passive,
  Percentage,
  Physical,
  Pierce,
  Space,
  Strike,
  Summon,
  Wall,
} from "../../bits/index.ts";

export type IceBolt = Cold & Bolt;
export type FrozenArmor = Cold & Physical & Freeze & Buff;
export type ChargedBolt = Lightning & Bolt & Multiply;
export type FireBolt = Fire & Bolt;
export type Warmth = ManaRegen & Passive;

export type FrostNova = Cold & Nova;
export type IceBlast = IceBolt & Freeze;
export type StaticField = Lightning & Nova & Percentage;
export type Telekinesis = Lightning & Magic & Space & Item; // what about other UI activations?
export type Inferno = Fire & Beam;

export type ShiverArmor = Cold & Physical & Buff;
export type LightningNova = Lightning & Nova;
export type LightningBeam = Lightning & Beam & Pierce;
export type Blaze = Fire & Buff & MovementSpeed;
export type FireBall = FireBolt & AoE;

export type GlacialSpike = IceBlast & AoE;
export type ChainLightning = Lightning & Chain;
export type Teleport = Magic & Space;
export type FireWall = Fire & Wall;
export type Enchant = Fire & Buff;

export type Blizzard = Cold & Strike & Multiply;
export type ChillingArmor = Cold & Physical & Bolt;
export type ThunderStorm = Lightning & Strike & Buff;
export type EnergyShield = LifeRegen & Magic & Buff;
export type Meteor = Fire & Physical & Strike & AoE;

export type FrozenOrb = IceBolt & Multiply;
export type ColdMastery = Cold & Passive & Bypass;
export type Hydra = FireBolt & Summon;
