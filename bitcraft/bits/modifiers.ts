/** Splitting effects. */
export type Multiply = { multiply: true };
/** Spells that have long-run effects. */
// export type Persist = { persist: true };
/** Spells that impact an area. */
export type AoE = { aoe: true };
/** Freezing effects related to cold. */
export type Freeze = { freeze: true }; // do we want explicit freeze?
export type Stun = { stun: true }; // similar: do we want explicit stun?
export type Burn = { burn: true }; // similar
/** Ability of a lightning of life aspected bolt or beam to chain to another target. */
export type Chain = { chain: true };
/** Reducing enemy resistance. */
export type Bypass = { bypass: true };
export type Reflect = { reflect: true };
export type Guided = { guided: true };
export type Knockback = { knockback: true };
export type Spiral = { spiral: true };
/** Charges build up with each successful usage. These charges can improve the effect or can be expended for a one-time effect. */
export type Charge = { charge: true };
export type Percentage = { percentage: true };
