import { CombatSkillIntentDto, EnemyDto, GameStateDto, HeroDto } from '../../application/dto/GameStateDto';
import { renderCombatSkillIntent } from './CombatSkillIntentPresentation';
import { renderCombatStatusEffects } from './CombatStatusEffectPresentation';
import { formatEnemyHealthLabel } from './EnemyBattlePresentation';
import { formatHealthLabel } from './HeroBarsPresentation';

function clampPercent(value: number, total: number): number {
  if (total <= 0) return 0;
  return Math.max(0, Math.min(100, (value / total) * 100));
}

function updateHealthBar(
  card: HTMLElement,
  selector: string,
  healthLabel: string,
  healthPercent: number,
): void {
  const bar = card.querySelector(selector);
  if (!bar) return;

  bar.setAttribute('data-bar-label', healthLabel);
  bar.setAttribute('aria-label', `Vida ${healthLabel}`);

  const fill = bar.querySelector('.health-fill') as HTMLElement | null;
  if (fill) {
    fill.style.width = `${healthPercent}%`;
  }
}

function replaceOrRemoveStatusEffects(card: HTMLElement, effectsHtml: string, anchor: string): void {
  const anchorEl = card.querySelector(anchor);
  if (!anchorEl) return;

  const existing = card.querySelector('.combat-status-effects');
  if (!effectsHtml) {
    existing?.remove();
    return;
  }

  if (existing) {
    existing.outerHTML = effectsHtml;
    return;
  }

  anchorEl.insertAdjacentHTML('afterend', effectsHtml);
}

function skillIntentKey(intent: CombatSkillIntentDto | null | undefined): string {
  if (!intent) return '';
  return JSON.stringify(intent);
}

function replaceOrRemoveSkillIntent(
  card: HTMLElement,
  intent: CombatSkillIntentDto | null | undefined,
): void {
  const intentHtml = renderCombatSkillIntent(intent);
  const existing = card.querySelector('.combat-skill-floor-slot') as HTMLElement | null;
  const nextKey = skillIntentKey(intent);

  if (!intentHtml) {
    existing?.remove();
    return;
  }

  if (existing && existing.dataset.intentKey === nextKey) {
    return;
  }

  if (existing) {
    existing.outerHTML = intentHtml;
    card.querySelector<HTMLElement>('.combat-skill-floor-slot')?.setAttribute(
      'data-intent-key',
      nextKey,
    );
    return;
  }

  card.insertAdjacentHTML('beforeend', intentHtml);
  card.querySelector<HTMLElement>('.combat-skill-floor-slot')?.setAttribute(
    'data-intent-key',
    nextKey,
  );
}

function patchHeroCard(card: HTMLElement, hero: HeroDto, isActiveTurn: boolean): void {
  card.classList.toggle('hero-battle-card--active-turn', isActiveTurn);

  updateHealthBar(
    card,
    '.health-bar',
    formatHealthLabel(hero),
    clampPercent(hero.health, hero.maxHealth),
  );

  replaceOrRemoveStatusEffects(card, renderCombatStatusEffects(hero.statusEffects), '.hero-sprite');
  replaceOrRemoveSkillIntent(card, isActiveTurn ? hero.combatIntent : null);
}

function patchEnemyCard(
  card: HTMLElement,
  enemy: EnemyDto,
  isActiveTurn: boolean,
): void {
  card.classList.toggle('enemy-battle-card--active-turn', isActiveTurn);

  updateHealthBar(
    card,
    '.health-bar',
    formatEnemyHealthLabel(enemy),
    clampPercent(enemy.health, enemy.maxHealth),
  );

  replaceOrRemoveStatusEffects(
    card,
    renderCombatStatusEffects(enemy.statusEffects),
    '.enemy-battle-hitbox',
  );
  replaceOrRemoveSkillIntent(card, isActiveTurn ? enemy.combatIntent : null);
}

export function patchBattleStripInPlace(
  state: GameStateDto,
  heroesContainer: HTMLElement,
  enemyContainer: HTMLElement,
): void {
  const activeTurn = state.activeTurn;

  for (const hero of state.activeParty) {
    const card = heroesContainer.querySelector<HTMLElement>(`[data-hero-id="${hero.id}"]`);
    if (!card) continue;

    const isActive = activeTurn?.side === 'hero' && activeTurn.id === hero.id;
    patchHeroCard(card, hero, isActive);
  }

  if (state.enemies.length === 0) return;

  for (const enemy of state.enemies) {
    const card = enemyContainer.querySelector<HTMLElement>(`[data-enemy-id="${enemy.id}"]`);
    if (!card) continue;

    const isActive = activeTurn?.side === 'enemy' && activeTurn.id === enemy.id;
    patchEnemyCard(card, enemy, isActive);
  }
}
