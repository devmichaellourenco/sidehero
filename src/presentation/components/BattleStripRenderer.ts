import { GameStateDto } from '../../application/dto/GameStateDto';

export class BattleStripRenderer {
  constructor(
    private readonly heroesContainer: HTMLElement,
    private readonly enemyContainer: HTMLElement,
  ) {}

  render(state: GameStateDto): void {
    this.heroesContainer.innerHTML = state.heroes
      .map(
        (hero) => `
        <div class="hero-sprite" title="${hero.name} Lv.${hero.level}">
          ${hero.emoji}
        </div>
      `,
      )
      .join('');

    if (!state.enemy) {
      this.enemyContainer.innerHTML = '<span class="empty-state">...</span>';
      return;
    }

    const healthPercent = Math.max(0, (state.enemy.health / state.enemy.maxHealth) * 100);

    this.enemyContainer.innerHTML = `
      <div class="enemy-sprite">👾</div>
      <div class="enemy-name">${state.enemy.name}</div>
      <div class="health-bar">
        <div class="health-fill" style="width: ${healthPercent}%"></div>
      </div>
    `;
  }
}
