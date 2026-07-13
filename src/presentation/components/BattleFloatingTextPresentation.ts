import { CombatFloatingEventDto } from '../../application/dto/CombatFloatingEventDto';

export function resolveBattleFloatClass(
  event: Pick<CombatFloatingEventDto, 'kind' | 'damageElement'>,
): string {
  if (event.kind === 'crit' || event.kind === 'crit-heal' || event.kind === 'crit-buff') {
    return event.kind === 'crit' ? 'crit' : event.kind;
  }

  if (event.kind === 'heal') {
    return 'heal';
  }

  if (event.kind === 'damage' && event.damageElement) {
    return `damage-${event.damageElement}`;
  }

  return event.kind;
}
