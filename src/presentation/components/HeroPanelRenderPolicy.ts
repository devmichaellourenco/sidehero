import { GameStateDto } from '../../application/dto/GameStateDto';

function partyCompositionKey(state: GameStateDto): string {
  const heroIds = state.heroes
    .map((hero) => hero.id)
    .sort()
    .join(',');
  return `${state.activePartyIds.join(',')}|${heroIds}`;
}

export function shouldRenderHeroPanel(
  previous: GameStateDto | null,
  next: GameStateDto,
): boolean {
  if (!previous) return true;
  if (next.canEditParty) return true;
  return partyCompositionKey(previous) !== partyCompositionKey(next);
}
