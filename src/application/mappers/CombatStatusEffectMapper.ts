import { statusEffectLabel, StatusEffectMap } from '../../domain/services/combat/CombatStatusEffect';
import { CombatStatusEffectTracker } from '../../domain/services/combat/CombatStatusEffectTracker';
import { combatantKey } from '../../domain/services/combat/SkillCooldownTracker';
import { CombatStatusEffectDto } from '../dto/GameStateDto';

export function mapCombatantStatusEffects(
  side: 'hero' | 'enemy',
  id: string,
  statusEffects: StatusEffectMap | undefined,
): CombatStatusEffectDto[] {
  const tracker = CombatStatusEffectTracker.fromMap(statusEffects);
  const key = combatantKey(side, id);

  return tracker.listFor(key).map((effect) => ({
    label: statusEffectLabel(effect),
    turnsRemaining: effect.remainingTurns,
    polarity: effect.kind === 'buff_attack' ? 'buff' : 'debuff',
  }));
}
