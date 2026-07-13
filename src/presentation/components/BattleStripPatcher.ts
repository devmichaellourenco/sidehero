import { EnemyDto, GameStateDto, HeroDto } from '../../application/dto/GameStateDto';
import { renderCombatStatusEffects } from './CombatStatusEffectPresentation';
import { patchCombatSkillBar } from './CombatSkillIntentPresentation';
import { formatEnemyHealthLabel } from './EnemyBattlePresentation';
import { formatHealthLabel } from './HeroBarsPresentation';
import { clampHealthPercent, patchActionTimeBar } from './BattleActorHealthPresentation';

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

function replaceOrRemoveStatusBadges(card: HTMLElement, effectsHtml: string): void {
  const hitbox = card.querySelector('.battle-actor-hitbox');
  if (!hitbox) return;

  const existing = hitbox.querySelector('.combat-status-badges');
  if (!effectsHtml) {
    existing?.remove();
    return;
  }

  if (existing) {
    existing.outerHTML = effectsHtml;
    return;
  }

  hitbox.insertAdjacentHTML('beforeend', effectsHtml);
}

function patchActorCard(
  card: HTMLElement,
  options: {
    isActiveTurn: boolean;
    activeTurnClass: string;
    healthLabel: string;
    healthPercent: number;
    actionTimeRatio: number;
    actionTimeRemaining: number;
    actionTimeTotal: number;
    statusEffectsHtml: string;
    combatSkills: HeroDto['combatSkills'] | EnemyDto['combatSkills'];
  },
): void {
  card.classList.toggle(options.activeTurnClass, options.isActiveTurn);

  updateHealthBar(card, '.health-bar', options.healthLabel, options.healthPercent);
  patchActionTimeBar(
    card,
    options.actionTimeRatio,
    options.actionTimeRemaining,
    options.actionTimeTotal,
  );
  replaceOrRemoveStatusBadges(card, options.statusEffectsHtml);
  patchCombatSkillBar(card, options.combatSkills);
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

    patchActorCard(card, {
      isActiveTurn: activeTurn?.side === 'hero' && activeTurn.id === hero.id,
      activeTurnClass: 'hero-battle-card--active-turn',
      healthLabel: formatHealthLabel(hero),
      healthPercent: clampHealthPercent(hero.health, hero.maxHealth),
      actionTimeRatio: hero.actionTimeRatio,
      actionTimeRemaining: hero.actionTimeRemaining,
      actionTimeTotal: hero.actionTimeTotal,
      statusEffectsHtml: renderCombatStatusEffects(hero.statusEffects),
      combatSkills: hero.combatSkills,
    });
  }

  if (state.enemies.length === 0) return;

  for (const enemy of state.enemies) {
    const card = enemyContainer.querySelector<HTMLElement>(`[data-enemy-id="${enemy.id}"]`);
    if (!card) continue;

    patchActorCard(card, {
      isActiveTurn: activeTurn?.side === 'enemy' && activeTurn.id === enemy.id,
      activeTurnClass: 'enemy-battle-card--active-turn',
      healthLabel: formatEnemyHealthLabel(enemy),
      healthPercent: clampHealthPercent(enemy.health, enemy.maxHealth),
      actionTimeRatio: enemy.actionTimeRatio,
      actionTimeRemaining: enemy.actionTimeRemaining,
      actionTimeTotal: enemy.actionTimeTotal,
      statusEffectsHtml: renderCombatStatusEffects(enemy.statusEffects),
      combatSkills: enemy.combatSkills,
    });
  }
}

export function shouldUseCrowdedBattleStrip(heroCount: number, enemyCount: number): boolean {
  return heroCount + enemyCount >= 5 || (heroCount >= 3 && enemyCount >= 2);
}

export function syncBattleStripCrowdedLayout(
  battleStrip: HTMLElement,
  heroCount: number,
  enemyCount: number,
): void {
  battleStrip.classList.toggle(
    'battle-strip--crowded',
    shouldUseCrowdedBattleStrip(heroCount, enemyCount),
  );
}
