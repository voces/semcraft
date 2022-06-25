/** Unaspected energy. */
export type Magic = { magic: true };
/**
 * Fire energy. Moderate AoE damage. Has lingering burn damage halving each
 * second.
 */
export type Fire = { fire: true };
/**
 * Cold energy. Low damage, crowd control. Impacted targets are slowed by the
 * same percent of the target's remaining life taken for SQRT(100 * p) time.
 * Non-stacking but simultaneously queued with highest slow taking priority.
 * @example
 * If the target is at 80 life, and 7 ice damage is inflected, the target is
 * slowed by 8.75% for 2.96 seconds.
 */
export type Cold = { cold: true };
/**
 * Lightning energy. High single target damage. Targets are shocked (stunned)
 * for ∛p÷10 time, where p is equal to the percent of damage done (remaining
 * life) times 100 and must be greater than 1%.
 */
export type Lightning = { lightning: true };
/**
 * Physical energy. Moderate damage, easy to mix. Targets are stunned for ∜p÷10
 * time, where p is equal to the percent of damage done (remainining life) times
 * 100 and must be greater than 1%.
 */
export type Physical = { physical: true };
/**
 * Poison energy. Damage over time. Non-stacking but simultaneously queued with
 * highest damage taking priority
 */
export type Poison = { poison: true };
// /** Mind magics. */
// export type Mental = { mental: true };
