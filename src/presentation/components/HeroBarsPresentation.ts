import { HeroDto } from '../../application/dto/GameStateDto';

function clampPercent(value: number, total: number): number {
  if (total <= 0) return 0;
  return Math.max(0, Math.min(100, (value / total) * 100));
}

export function formatHealthLabel(hero: Pick<HeroDto, 'health' | 'maxHealth'>): string {
  return `${hero.health}/${hero.maxHealth}`;
}

export function formatExperienceLabel(
  hero: Pick<HeroDto, 'experience' | 'experienceToNextLevel'>,
): string {
  return `${hero.experience}/${hero.experienceToNextLevel}`;
}

export function renderHeroBars(hero: HeroDto, options: { compact?: boolean } = {}): string {
  const healthPercent = clampPercent(hero.health, hero.maxHealth);
  const xpPercent = clampPercent(hero.experience, hero.experienceToNextLevel);
  const compactClass = options.compact ? ' hero-bars-compact' : '';
  const healthLabel = formatHealthLabel(hero);
  const xpLabel = formatExperienceLabel(hero);

  return `
    <div class="hero-bars${compactClass}">
      <div
        class="stat-bar health-bar hero card-bar"
        data-bar-label="${healthLabel}"
        tabindex="0"
        aria-label="Vida ${healthLabel}"
      >
        <div class="stat-bar-track">
          <div class="health-fill hero" style="width: ${healthPercent}%"></div>
        </div>
      </div>
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
