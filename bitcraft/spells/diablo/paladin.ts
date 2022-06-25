import {
  AttackRating,
  AttackSpeed,
  Aura,
  Bolt,
  Buff,
  Bypass,
  Cold,
  Corpse,
  Defense,
  Demon,
  Enemy,
  Fire,
  Knockback,
  LifeRegen,
  Lightning,
  Magic,
  ManaRegen,
  MaxStamina,
  MovementSpeed,
  Multiply,
  Physical,
  Reflect,
  Resistance,
  Shield,
  Spiral,
  StaminaRegen,
  Strike,
  Undead,
} from "../../bits/index.ts";

export type Prayer = Aura & LifeRegen;
export type ResistFire = Aura & Fire & Resistance;
export type Might = Aura & Physical;
export type Smite = Physical & Shield & Knockback;

export type Defiance = Aura & Defense;
export type ResistCold = Aura & Cold & Resistance;
// there's really two parts: aura that does fire damage to nearby enemies and
// aura that increases fire damage of nearby allies
export type HolyFire = Aura & Enemy & Fire;
export type Thorns = Aura & Reflect;
export type HolyBolt = Magic & Bolt & Demon;

// export type Cleansing = Aura;
export type ResistLightning = Aura & Lightning & Resistance;
export type BlessedAim = Aura & AttackRating;
export type Zeal = AttackSpeed;
export type ShieldCharge = Shield & Physical & MovementSpeed;

export type Vigor = Aura & MovementSpeed & MaxStamina & StaminaRegen;
export type Concentration = Aura & Physical & Magic; // concept of interrupts? hidden stat?
export type HolyFreeze = Aura & Cold;
export type Vengeance = AttackRating & Fire & Lightning & Cold;
export type BlessedHammer = Magic & Bolt & Spiral;

export type Meditation = Aura & ManaRegen;
export type HolyShock = Aura & Lightning;
export type Sanctuary =
  & Aura
  & Magic
  & Physical
  & Resistance
  & Undead
  & Knockback;
// export type Conversion =
export type HolyShield = Buff & Shield & Defense;

export type Redemption = Aura & Corpse & LifeRegen & ManaRegen;
export type Salvation = Aura & Fire & Cold & Lightning & Resistance;
export type Fanaticism = Aura & AttackRating & AttackSpeed & Physical;
export type Conviction =
  & Aura
  & Defense
  & Fire
  & Cold
  & Lightning
  & Bypass;
export type FistOfTheHeavens = HolyBolt & Multiply & Lightning & Strike;
