import { Hero } from '../../domain/entities/Hero';
import { Enemy } from '../../domain/entities/Enemy';
import { CombatSkillIntentResolver } from '../../domain/services/combat/CombatSkillIntentResolver';
import { SkillCooldownMap, SkillCooldownTracker } from '../../domain/services/combat/SkillCooldownTracker';
import { CombatSkillIntentDto } from '../dto/GameStateDto';

const resolver = new CombatSkillIntentResolver();

export function mapHeroCombatIntent(
  hero: Hero,
  party: Hero[],
  enemies: Enemy[],
  skillCooldowns: SkillCooldownMap | undefined,
): CombatSkillIntentDto | null {
  const intent = resolver.resolveForHero(
    hero,
    party,
    enemies,
    SkillCooldownTracker.fromMap(skillCooldowns),
  );

  return intent ? mapIntentToDto(intent) : null;
}

export function mapEnemyCombatIntent(
  enemy: Enemy,
  party: Hero[],
  enemies: Enemy[],
  skillCooldowns: SkillCooldownMap | undefined,
): CombatSkillIntentDto | null {
  const intent = resolver.resolveForEnemy(
    enemy,
    party,
    enemies,
    SkillCooldownTracker.fromMap(skillCooldowns),
  );

  return intent ? mapIntentToDto(intent) : null;
}

function mapIntentToDto(intent: {
  nextSkillName: string;
  nextSkillId: string;
  status: 'ready' | 'cooldown';
  turnsRemaining: number;
  chargingSkills: Array<{ skillName: string; turnsRemaining: number }>;
}): CombatSkillIntentDto {
  return {
    nextSkillName: intent.nextSkillName,
    nextSkillId: intent.nextSkillId,
    status: intent.status,
    turnsRemaining: intent.turnsRemaining,
    chargingSkills: intent.chargingSkills.map((entry) => ({
      skillName: entry.skillName,
      turnsRemaining: entry.turnsRemaining,
    })),
  };
}
