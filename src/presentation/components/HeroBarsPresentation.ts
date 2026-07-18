import { HeroDto } from '../../application/dto/GameStateDto';
import { clampHealthPercent, renderStripHealthBar } from './BattleActorHealthPresentation';

export function formatHealthLabel(hero: Pick<HeroDto, 'health' | 'maxHealth'>): string {
  return `${hero.health}/${hero.maxHealth}`;
}

export function formatExperienceLabel(
  hero: Pick<HeroDto, 'experience' | 'experienceToNextLevel'>,
): string {
  return `${hero.experience}/${hero.experienceToNextLevel}`;
}

export function renderHeroStripHealthBar(hero: HeroDto): string {
  return renderStripHealthBar({
    side: 'hero',
    healthLabel: formatHealthLabel(hero),
    healthPercent: clampHealthPercent(hero.health, hero.maxHealth),
  });
}

export function renderHeroBars(
  hero: HeroDto,
  options: { compact?: boolean; showHealth?: boolean } = {},
): string {
  const healthPercent = clampHealthPercent(hero.health, hero.maxHealth);
  const xpPercent = clampHealthPercent(hero.experience, hero.experienceToNextLevel);
  const compactClass = options.compact ? ' hero-bars-compact' : '';
  const healthLabel = formatHealthLabel(hero);
  const xpLabel = formatExperienceLabel(hero);
  const healthBar =
    options.showHealth === false
      ? ''
      : `
      <div
        class="stat-bar health-bar hero card-bar"
        data-bar-label="${healthLabel}"
        tabindex="0"
        aria-label="Vida ${healthLabel}"
      >
        <div class="stat-bar-track">
          <div class="health-fill hero" style="width: ${healthPercent}%"></div>
        </div>
      </div>`;

  return `
    <div class="hero-bars${compactClass}">${healthBar}
      <div
        class="stat-bar xp-bar card-bar"
        data-bar-label="${xpLabel}"
        tabindex="0"
        aria-label="Experiência ${xpLabel}"
      >
        <div class="stat-bar-track">
          <div class="xp-fill" style="width: ${xpPercent}%"></div>
        </div>
      </div>
    </div>
  `;
}
