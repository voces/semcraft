// Spell classes

/** A classic bolt spell. High single target damage. */
export type Bolt = { bolt: true };
/** A channeled spell. Very high single target damage. */
export type Beam = { beam: true };
/** A passive that effects nearby targets. They by default target all nearby allies. */
export type Aura = { aura: true };
/** A spell in the shape of a wall. */
export type Wall = { wall: true };
/** A spell that radiates out. When targeting, targets enemies by default. */
export type Nova = { nova: true };
/** A spell that effects one self without casting. */
export type Passive = { passive: true };
/** Relating to a summon. */
export type Summon = { summon: true };
/** Characterizes a from-the-sky effect. */
export type Strike = { strike: true };

// These can also be modifiers

/** A positive incurring effect. */
export type Buff = { buff: true };
/** A negative incurring effect. */
export type Debuff = { debuff: true };
