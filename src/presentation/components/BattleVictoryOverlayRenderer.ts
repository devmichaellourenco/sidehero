import { ASSETS, getAssetUrl, imgTag } from '../assets/AssetCatalog';
import { BattleVictoryPayload } from './BattleVictoryDetector';

export class BattleVictoryOverlayRenderer {
  render(container: HTMLElement, payload: BattleVictoryPayload): void {
    const isWarning = payload.variant === 'boss-approach';
    const toneClass = isWarning ? 'battle-victory-compact--warning' : 'battle-victory-compact--clear';
    const headline = isWarning ? 'WARNING' : 'CLEAR';
    const subtitle = this.buildSubtitle(payload);
    const rewardRows = this.buildRewardRows(payload);
    const levelUpRows = this.buildLevelUpRows(payload);
    const nextPhaseLine = payload.nextPhaseName
      ? `<p class="battle-victory-detail-line">Próxima fase: <strong>${payload.nextPhaseName}</strong></p>`
      : payload.seasonCompleted
        ? '<p class="battle-victory-detail-line">Temporada concluída!</p>'
        : '';

    container.innerHTML = `
      <div class="battle-victory-compact ${toneClass}">
        <div class="battle-victory-compact-main">
          <span class="battle-victory-compact-label">${headline}</span>
          <span class="battle-victory-compact-sub">${subtitle}</span>
        </div>
        <div class="battle-victory-details hidden" data-victory-details-panel>
          <p class="battle-victory-detail-line">${payload.clearedPhaseName}</p>
          <ul class="battle-victory-rewards" aria-label="Recompensas">
            ${rewardRows}
          </ul>
          ${levelUpRows}
          ${nextPhaseLine}
        </div>
        <div class="battle-victory-compact-actions">
          <button type="button" class="battle-victory-details-btn" data-victory-details-toggle>
            Detalhes
          </button>
        </div>
      </div>
    `;
  }

  private buildSubtitle(payload: BattleVictoryPayload): string {
    if (payload.variant === 'boss-approach') {
      return 'Boss à frente';
    }

    if (payload.variant === 'wave-clear') {
      return 'Wave concluída';
    }

    if (payload.seasonCompleted) {
      return 'Boss final';
    }

    return 'Fase concluída';
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
      rows.push(`<li class="battle-victory-reward battle-victory-reward--empty">Sem recompensas extras</li>`);
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
