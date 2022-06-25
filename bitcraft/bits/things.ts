/** Spells revolving around bones. */
// export type Bone = { bone: true };
/** Spells revolving around corpses. */
export type Corpse = { corpse: true };
/** Generic item. */
export type Item = { item: true };
/** Potion items. */
export type Potion = { potion: true }; // should there be a hierarchy?
/** Spells revolving around missiles (arrows & bolts). */
export type Missile = { Missile: true };
/** General class of all armors. */
export type Armor = { armor: true };
export type BodyArmor = { bodyArmor: true };
export type Boots = { boots: true };
export type Gloves = { gloves: true };
export type Belts = { belts: true };
export type Helms = { helms: true };
export type Shield = { shield: true };
/** Light armor/weapon. */
export type Light = { light: true };
/** Medium armor/weapon. */
export type Medium = { medium: true };
/** Heavy armor/weapon. */
export type Heavy = { heavy: true };
/** Any weapon item. */
export type Weapon = { weapon: true };
export type Javelin = { javelin: true };
export type Spear = { spear: true };
export type Bow = { bow: true };
export type Crossbow = { crossbow: true };
export type Claw = { claw: true };
export type Sword = { sword: true };
export type Axe = { axe: true };
export type Mace = { mace: true };
export type Polearm = { polearm: true };
export type Wand = { wand: true };
export type Stave = { stave: true };
export type Dagger = { dagger: true };
export type Throwing = { throwing: true };
export type ThrowingKnife = { throwingKnife: true };
export type ThrowingAxe = { throwingAxe: true };
export type Scepter = { scepter: true };
export type Ring = { ring: true };
export type Amulet = { amulet: true };
export type Charm = { charm: true };
export type Jewel = { jewel: true };

// Everything is either Undead, Demon, Monster, or Player
export type Undead = { undead: true };
export type Demon = { demon: true };
export type Monster = { monster: true };
export type Player = { player: true };

export type Enemy = { enemy: true };
export type Ally = { ally: true };

export type Raven = { raven: true };
export type Vines = { vines: true };
export type Wolf = { wolf: true };
export type Bear = { bear: true };
export type Clone = { clone: true }; // hmm...
export type Human = { human: true };
