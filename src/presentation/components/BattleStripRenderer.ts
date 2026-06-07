import { GameStateDto } from '../../application/dto/GameStateDto';
import { ASSETS, getAssetUrl, getEnemySprite, getHeroSprite, imgTag } from '../assets/AssetCatalog';
import { bindBarTooltips } from './BarTooltipBinder';
import { renderEnemyBattleCard } from './EnemyBattlePresentation';
import { bindEnemyTooltips } from './EnemyTooltipBinder';

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

    const spriteHtml = imgTag(
      getEnemySprite(state.enemy.enemyType),
      state.enemy.name,
      'enemy-image',
    );

    this.enemyContainer.innerHTML = renderEnemyBattleCard(
      state.enemy,
      state.stage,
      spriteHtml,
    );

    bindBarTooltips(this.enemyContainer);
    bindEnemyTooltips(this.enemyContainer);
  }
}
