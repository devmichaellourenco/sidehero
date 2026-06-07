import { GameStateDto } from '../../application/dto/GameStateDto';

export class HeroPanelRenderer {
  constructor(private readonly container: HTMLElement) {}

  render(state: GameStateDto): void {
    this.container.innerHTML = state.heroes
      .map((hero) => {
        const healthPercent = Math.max(0, (hero.health / hero.maxHealth) * 100);
        const equipment = Object.entries(hero.equipment)
          .filter(([, gear]) => gear)
          .map(([, gear]) => gear!.name)
          .join(', ');

        return `
          <div class="hero-card">
            <div class="hero-card-header">
              <strong>${hero.emoji} ${hero.name}</strong>
              <span>Lv.${hero.level}</span>
            </div>
            <div class="hero-stats">
              ⚔️ ${hero.attack} · 🛡️ ${hero.defense} · ❤️ ${hero.health}/${hero.maxHealth}
            </div>
            <div class="health-bar">
              <div class="health-fill hero" style="width: ${healthPercent}%"></div>
            </div>
            ${equipment ? `<div class="hero-stats">🎒 ${equipment}</div>` : ''}
          </div>
        `;
      })
      .join('');
  }
}
