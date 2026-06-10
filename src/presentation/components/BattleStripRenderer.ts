import { GameStateDto } from '../../application/dto/GameStateDto';
import { ASSETS, getAssetUrl, getEnemySprite, getHeroSprite, imgTag } from '../assets/AssetCatalog';
import { bindBarTooltips } from './BarTooltipBinder';
import { patchBattleStripInPlace } from './BattleStripPatcher';
import {
  battleStripDomMatchesStructure,
  buildBattleStripStructureKey,
} from './BattleStripStructure';
import { renderEnemyBattleCard } from './EnemyBattlePresentation';
import { bindEnemyTooltips } from './EnemyTooltipBinder';
import { renderHeroBattleSprite } from './HeroBattlePresentation';
import { bindHeroTooltips } from './HeroTooltipBinder';

export class BattleStripRenderer {
  private structureKey: string | null = null;

  constructor(
    private readonly heroesContainer: HTMLElement,
    private readonly enemyContainer: HTMLElement,
  ) {}

  render(state: GameStateDto): void {
    const nextStructureKey = buildBattleStripStructureKey(state);
    if (
      nextStructureKey === this.structureKey &&
      battleStripDomMatchesStructure(state, this.heroesContainer, this.enemyContainer)
    ) {
      patchBattleStripInPlace(state, this.heroesContainer, this.enemyContainer);
      return;
    }

    this.structureKey = nextStructureKey;
    this.renderFull(state);
  }

  private renderFull(state: GameStateDto): void {
    const glowUrl = getAssetUrl(ASSETS.characters.glow);
    const activeTurn = state.activeTurn;

    this.heroesContainer.innerHTML = state.activeParty
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
