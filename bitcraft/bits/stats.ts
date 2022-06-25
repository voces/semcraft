export type Mana = { mana: true };
export type Life = { life: true };
export type Stamina = { stamina: true };
export type Regen = { regen: true };
export type Pool = { pool: true };
export type Steal = { steal: true };
/** Base mana regen is 1% of pool. */
export type ManaRegen = Mana & Regen;
export type MaxMana = Mana & Pool;
/** % damage converted to mana. */
export type ManaSteal = Mana & Steal;
/** Base life regen is 1% of pool. */
export type LifeRegen = Life & Regen;
/** % damage converted to life. */
export type MaxLife = Life & Pool;
export type LifeSteal = Life & Steal;
/**
 * Base stamina regen is 3% of pool. Walking and spell casting consumes 1% while
 * running or physical attacks (including bows) consume 5%.
 */
export type StaminaRegen = Stamina & Regen;
export type MaxStamina = Stamina & Pool;
export type StaminaSteal = Stamina & Steal;
export type MovementSpeed = { movementSpeed: true };
export type Space = { space: true };
/** Relating to vision/sight radius. */
export type Vision = { vision: true };
/** All energy types have resistance: Fire, Cold, Lightning, Poison, Magic, Physical. */
export type Resistance = { resistance: true };
export type AttackSpeed = { attackSpeed: true };
/**
 * Determines likelihood of an attack landing and the effectiveness of said
 * attack. There are three kinds of attack: melee, missile, and aoe. DR is
 * impacted by movement speed, where final DR is equal to DR *
 * (1-movementSpeed/(movementSpeed+64)); walk should be 50% and run 33%.
 * - Melee
 *   - Chance to hit: AR / (AR + DR)
 *   - Damage: AR / (AR + 2DR)
 * - Missile
 *   - Chance to hit: (2AR+PS/128) / ((2AR+PS/128) + DR) where PS = projectile speed
 *   - Damage: AR / (AR + 3DR)
 * - AoE // Not sure about this... Firebolt should function as a missile, but how do we determine AR?
 *   - Chance to hit: 1/(max(DR, 0)+1000)^5
 *   - Damage: 100%
 * @examples
 * - Melee: 25 AR vs 25 DR => 50% chance to hit, 33% damage
 * - Melee: 50 AR vs 25 DR => 67% chance to hit, 50% damage
 * - Melee: 100 AR vs 25 DR => 80% chance to hit, 67% damage
 * - Melee: 250 AR vs 25 DR => 91% chance to hit, 83% damage
 * - Missile: 25 AR vs 25 DR => 67% chance to hit, 25% damage
 * - Missile: 50 AR vs 25 DR => 80% chance to hit, 40% damage
 * - Missile: 100 AR vs 25 DR => 89% chance to hit, 57% damage
 * - Missile: 250 AR vs 25 DR => 95% chance to hit, 77%% damage
 * - AoE: 25 DR => 99.5% chance to hit
 * - AoE: 50 DR => 99.0% chance to hit
 * - AoE: 100 DR => 98.1% chance to hit
 * - AoE: 250 DR => 95.6% chance to hit
 * - AoE: 500 DR => 92.2% chance to hit
 * - AoE: 1000 DR => 87% chance to hit
 * - AoE: 2500 DR => 78% chance to hit
 * - AoE: 5000 DR => 70% chance to hit
 * - AoE: 10000 DR => 62% chance to hit
 * - AoE: 25000 DR => 52% chance to hit
 * - AoE: 50000 DR => 46% chance to hit
 */
export type Defense = { defense: true };
export type AttackRating = { attackRating: true };
/**
 * Increases chance of dealing a critical strike and the multiplier (should
 * these be separate?). Base multiplier is 2x. Base chance is 5%. Only physical
 * damage can critical strike.
 */
export type CriticalStrike = { criticalStrike: true }; // is this where it goes?
/**
 * If an attack passes the AR/DR chance to hit, it can still be blocked by a
 * shield. Chance to block is related to the specific shield + DR. Unlike
 * defense, a block incurs frame stun (queued after current action).
 */
export type Block = { block: true };
/** Capability of a bolt, beam, or Missile to pass through enemies. */
export type Pierce = { pierce: true };
