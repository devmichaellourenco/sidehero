import { Hero } from '../../domain/entities/Hero';
import { Enemy } from '../../domain/entities/Enemy';
import { CombatSkillBarResolver } from '../../domain/services/combat/CombatSkillBarResolver';
import { PendingSkillAction } from '../../domain/services/combat/PendingSkillAction';
import { StatusEffectMap } from '../../domain/services/combat/CombatStatusEffect';
import { CombatStatusEffectTracker } from '../../domain/services/combat/CombatStatusEffectTracker';
import { SkillCooldownMap, SkillCooldownTracker } from '../../domain/services/combat/SkillCooldownTracker';
import { CombatBattleSkillDto } from '../dto/GameStateDto';

const resolver = new CombatSkillBarResolver();

function mapEntryToDto(entry: ReturnType<CombatSkillBarResolver['resolveForHero']>[number]): CombatBattleSkillDto {
  return {
    skillId: entry.skillId,
    skillName: entry.skillName,
    secondsRemaining: entry.secondsRemaining,
    cooldownTotal: entry.cooldownTotal,
    ready: entry.ready,
    highlight: entry.highlight,
  };
}

function barOptions(
  isActiveTurn: boolean,
  pendingActions: PendingSkillAction[],
  combatTime: number,
) {
  return { isActiveTurn, pendingActions, combatTime };
}

export function mapHeroCombatSkills(
  hero: Hero,
  party: Hero[],
  enemies: Enemy[],
  skillCooldowns: SkillCooldownMap | undefined,
  combatStatusEffects: StatusEffectMap | undefined,
  options: {
    isActiveTurn: boolean;
    pendingActions: PendingSkillAction[];
    combatTime: number;
  },
): CombatBattleSkillDto[] {
  const entries = resolver.resolveForHero(
    hero,
    party,
    enemies,
    SkillCooldownTracker.fromMap(skillCooldowns),
    barOptions(options.isActiveTurn, options.pendingActions, options.combatTime),
    CombatStatusEffectTracker.fromMap(combatStatusEffects),
  );

  return entries.map(mapEntryToDto);
}

export function mapEnemyCombatSkills(
  enemy: Enemy,
  party: Hero[],
  enemies: Enemy[],
  skillCooldowns: SkillCooldownMap | undefined,
  options: {
    isActiveTurn: boolean;
    pendingActions: PendingSkillAction[];
    combatTime: number;
  },
): CombatBattleSkillDto[] {
  const entries = resolver.resolveForEnemy(
    enemy,
    party,
    enemies,
    SkillCooldownTracker.fromMap(skillCooldowns),
    barOptions(options.isActiveTurn, options.pendingActions, options.combatTime),
  );

  return entries.map(mapEntryToDto);
}
