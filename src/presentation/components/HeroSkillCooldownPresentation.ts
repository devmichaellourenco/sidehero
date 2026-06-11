import { HeroSkillCooldownDto } from '../../application/dto/GameStateDto';
import { formatCooldownLabel } from '../../domain/combat/SkillCooldownTiming';

export function getSkillCooldownRatio(cooldown: HeroSkillCooldownDto): number {
  if (cooldown.ready || cooldown.cooldownTotal <= 0) return 0;
  return Math.min(1, cooldown.secondsRemaining / cooldown.cooldownTotal);
}

export function renderSkillCooldownOverlay(cooldown: HeroSkillCooldownDto | undefined): string {
  if (!cooldown || cooldown.ready) {
    return `
      <span class="hero-skill-cooldown hero-skill-cooldown--ready" aria-hidden="true">
        <span class="hero-skill-cooldown-shade"></span>
      </span>
    `;
  }

  const ratio = getSkillCooldownRatio(cooldown);
  const label = formatCooldownLabel(cooldown.secondsRemaining);

  return `
    <span
      class="hero-skill-cooldown"
      aria-hidden="true"
      data-remaining-label="${label}"
    >
      <span
        class="hero-skill-cooldown-shade"
        style="--cooldown-ratio: ${ratio}"
      ></span>
      <span class="hero-skill-cooldown-label">${label}</span>
    </span>
  `;
}
