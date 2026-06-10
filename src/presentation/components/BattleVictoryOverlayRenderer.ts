import { ASSETS, getAssetUrl, imgTag } from '../assets/AssetCatalog';
import { BattleVictoryPayload } from './BattleVictoryDetector';

export class BattleVictoryOverlayRenderer {
  render(container: HTMLElement, payload: BattleVictoryPayload): void {
    const title = payload.seasonCompleted
      ? 'Temporada Concluída!'
      : 'Vitória!';

    const subtitle = payload.seasonCompleted
      ? `${payload.clearedPhaseName} — boss final derrotado`
      : payload.clearedPhaseName;

    const rewardRows = this.buildRewardRows(payload);
    const levelUpRows = this.buildLevelUpRows(payload);
    const nextPhaseLine = payload.nextPhaseName
      ? `<p class="battle-victory-next">Próxima fase: <strong>${payload.nextPhaseName}</strong></p>`
      : payload.seasonCompleted
        ? '<p class="battle-victory-next">Inicie um novo jogo quando quiser recomeçar.</p>'
        : '';

    container.innerHTML = `
      <div class="battle-victory-backdrop" aria-hidden="true">
        ${imgTag(getAssetUrl(ASSETS.ui.victoryGlow), '', 'battle-victory-glow')}
      </div>
      <div class="battle-victory-card" role="dialog" aria-labelledby="battle-victory-title">
        <div class="battle-victory-frame" style="background-image: url('${getAssetUrl(ASSETS.ui.victoryFrame)}')"></div>
        <div class="battle-victory-wings" aria-hidden="true">
          ${imgTag(getAssetUrl(ASSETS.ui.victoryWings), '', 'battle-victory-wings-img')}
        </div>
        <div class="battle-victory-content">
          <h3 id="battle-victory-title" class="battle-victory-title">${title}</h3>
          <p class="battle-victory-subtitle">${subtitle}</p>
          <ul class="battle-victory-rewards" aria-label="Recompensas">
            ${rewardRows}
          </ul>
          ${levelUpRows}
          ${nextPhaseLine}
          <div class="battle-victory-actions">
            <button type="button" class="battle-victory-adjust" data-victory-adjust>
              ${imgTag(getAssetUrl(ASSETS.buttons.secondary), '', 'battle-victory-btn-bg')}
              <span>Realizar alterações</span>
            </button>
            <button type="button" class="battle-victory-continue" data-victory-continue>
              ${imgTag(getAssetUrl(ASSETS.buttons.primary), '', 'battle-victory-btn-bg')}
              <span>Continuar</span>
            </button>
          </div>
          <p class="battle-victory-hint" data-victory-countdown>Avançando em 3s…</p>
        </div>
      </div>
    `;
  }

  private buildRewardRows(payload: BattleVictoryPayload): string {
    const rows: string[] = [];

    if (payload.goldGained > 0) {
      rows.push(this.rewardRow(ASSETS.ui.gold, `+${payload.goldGained} ouro`));
    }

    if (payload.xpGained > 0) {
      rows.push(this.rewardRow(ASSETS.ui.energy, `+${payload.xpGained} XP`));
    }

    if (payload.tierReached !== null) {
      rows.push(this.rewardRow(ASSETS.ui.stage, `Tier ${payload.tierReached} alcançado`));
    }

    if (payload.chestDropped) {
      const label =
        payload.chestCount === 1 ? 'Baú obtido!' : `${payload.chestCount} baús obtidos!`;
      rows.push(this.rewardRow(ASSETS.ui.chestOpen, label));
    }

    if (rows.length === 0) {
      rows.push(`<li class="battle-victory-reward battle-victory-reward--empty">Fase concluída</li>`);
    }

    return rows.join('');
  }

  private buildLevelUpRows(payload: BattleVictoryPayload): string {
    if (payload.heroRewards.length === 0) return '';

    const items = payload.heroRewards
      .map(
        (hero) =>
          `<li class="battle-victory-levelup">${hero.name} subiu para Lv.${hero.newLevel}</li>`,
      )
      .join('');

    return `<ul class="battle-victory-levelups" aria-label="Level-ups">${items}</ul>`;
  }

  private rewardRow(iconPath: string, label: string): string {
    return `
      <li class="battle-victory-reward">
        ${imgTag(getAssetUrl(iconPath), '', 'battle-victory-reward-icon')}
        <span>${label}</span>
      </li>
    `;
  }
}
