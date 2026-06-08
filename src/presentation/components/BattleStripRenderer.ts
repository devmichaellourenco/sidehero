import { GameStateDto } from '../../application/dto/GameStateDto';
import { ASSETS, getAssetUrl, getEnemySprite, getHeroSprite, imgTag } from '../assets/AssetCatalog';
import { bindBarTooltips } from './BarTooltipBinder';
import { renderEnemyBattleCard } from './EnemyBattlePresentation';
import { bindEnemyTooltips } from './EnemyTooltipBinder';
import { renderHeroBattleSprite } from './HeroBattlePresentation';
import { bindHeroTooltips } from './HeroTooltipBinder';

export class BattleStripRenderer {
  constructor(
    private readonly heroesContainer: HTMLElement,
    private readonly enemyContainer: HTMLElement,
  ) {}

  render(state: GameStateDto): void {
    const glowUrl = getAssetUrl(ASSETS.characters.glow);
    const activeTurn = state.activeTurn;

    this.heroesContainer.innerHTML = state.heroes
      .map((hero) => {
        const glowHtml = `<img class="hero-glow" src="${glowUrl}" alt="" aria-hidden="true" />`;
        const spriteHtml = imgTag(getHeroSprite(hero.heroClass), hero.name, 'hero-image');
        const isActive = activeTurn?.side === 'hero' && activeTurn.id === hero.id;
        return renderHeroBattleSprite(hero, glowHtml, spriteHtml, { isActiveTurn: isActive });
      })
      .join('');

    bindBarTooltips(this.heroesContainer);
    bindHeroTooltips(this.heroesContainer);

    if (state.enemies.length === 0) {
      this.enemyContainer.innerHTML = '<span class="empty-state">...</span>';
      return;
    }

    this.enemyContainer.innerHTML = `
      <div class="enemies-row">
        ${state.enemies
          .map((enemy) => {
            const spriteHtml = imgTag(
              getEnemySprite(enemy.enemyType),
              enemy.name,
              'enemy-image',
            );
            const isActive = activeTurn?.side === 'enemy' && activeTurn.id === enemy.id;
            return renderEnemyBattleCard(enemy, state.difficultyTier, spriteHtml, {
              isActiveTurn: isActive,
              isBossWave: state.phaseRun?.isBossWave ?? false,
            });
          })
          .join('')}
      </div>
    `;

    bindBarTooltips(this.enemyContainer);
    bindEnemyTooltips(this.enemyContainer);
  }
}
