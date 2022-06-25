import {
  AoE,
  AttackRating,
  AttackSpeed,
  Axe,
  Bit,
  Buff,
  Charge,
  Cold,
  Corpse,
  CriticalStrike,
  Debuff,
  Defense,
  DualWield,
  Fire,
  Item,
  Knockback,
  Lightning,
  Mace,
  Magic,
  MaxLife,
  MaxMana,
  MaxStamina,
  MovementSpeed,
  Nova,
  Passive,
  Physical,
  Poison,
  Polearm,
  Potion,
  Resistance,
  Space,
  Spear,
  StaminaRegen,
  Stun,
  Sword,
  Throwing,
} from "../../bits/index.ts";

export type FindPotion = Corpse & Potion;
export type SwordMastery =
  & Passive
  & Sword
  & Physical
  & AttackRating
  & CriticalStrike;
export type AxeMastery =
  & Passive
  & Axe
  & Physical
  & AttackRating
  & CriticalStrike;
export type MaceMastery =
  & Passive
  & Mace
  & Physical
  & AttackRating
  & CriticalStrike;
export type Bash = Physical & AttackRating & Knockback;

export type Taunt = Nova & Debuff & Physical & AttackRating;
export type Shout = Nova & Buff & Defense;
export type PolearmMastery =
  & Passive
  & Polearm
  & Physical
  & AttackRating
  & CriticalStrike;
export type ThrowingMastery =
  & Passive
  & Throwing
  & Physical
  & AttackRating
  & CriticalStrike;
export type SpearMastery =
  & Passive
  & Spear
  & Physical
  & AttackRating
  & CriticalStrike;
export type Leap = Space & AoE & Knockback; // Not really space...
export type DoubleSwing = DualWield & AttackRating & AttackSpeed;

export type FindItem = Corpse & Item;
export type IncreasedStamina = Passive & MaxStamina & StaminaRegen;
export type StunAttack = AttackRating & Stun;
export type DoubleThrow = DualWield & Throwing & AttackRating;

export type BattleCry = Nova & Debuff & Defense & Physical; // effectively same as Taunt
export type IronSkin = Passive & Defense;
export type LeapAttack = Leap & Physical & AttackRating;
export type Concentrate = Defense & AttackRating & Physical;

export type BattleOrders = Nova & Buff & MaxLife & MaxMana & MaxStamina;
export type IncreasedSpeed = Passive & MovementSpeed;
export type Frenzy =
  & DualWield
  & AttackRating
  & Physical
  & AttackSpeed
  & Space
  & Charge;

export type WarCry = Nova & Physical & Stun;
export type BattleCommand = Nova & Buff & Bit;
export type NaturalResistance =
  & Passive
  & Fire
  & Cold
  & Lightning
  & Poison
  & Resistance;
export type Whirlwind = Physical & AttackRating & AoE & MovementSpeed;
export type Berserk = AttackRating & Magic & Defense;
