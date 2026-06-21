import { CombatFloatingEventDto } from '../../application/dto/CombatFloatingEventDto';

export function resolveBattleFloatClass(
  event: Pick<CombatFloatingEventDto, 'kind' | 'damageElement'>,
): string {
  if (event.kind === 'crit') {
    return 'crit';
  }

  if (event.kind === 'heal') {
    return 'heal';
  }

  if (event.kind === 'damage' && event.damageElement) {
    return `damage-${event.damageElement}`;
  }

  return event.kind;
}
