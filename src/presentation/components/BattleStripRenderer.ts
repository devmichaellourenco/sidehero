import { GameStateDto } from '../../application/dto/GameStateDto';
import { ASSETS, getAssetUrl, getEnemySprite, getHeroSprite, imgTag } from '../assets/AssetCatalog';

export class BattleStripRenderer {
  constructor(
    private readonly heroesContainer: HTMLElement,
    private readonly enemyContainer: HTMLElement,
  ) {}

  render(state: GameStateDto): void {
    const glowUrl = getAssetUrl(ASSETS.characters.glow);

    this.heroesContainer.innerHTML = state.heroes
      .map(
        (hero) => `
        <div class="hero-sprite" title="${hero.name} Lv.${hero.level}">
          <img class="hero-glow" src="${glowUrl}" alt="" aria-hidden="true" />
          ${imgTag(getHeroSprite(hero.heroClass), hero.name, 'hero-image')}
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
      ${imgTag(getEnemySprite(state.enemy.enemyType), state.enemy.name, 'enemy-image')}
      <div class="enemy-name">${state.enemy.name}</div>
      <div class="health-bar enemy">
        <div class="health-fill enemy" style="width: ${healthPercent}%"></div>
      </div>
    `;
  }
}
