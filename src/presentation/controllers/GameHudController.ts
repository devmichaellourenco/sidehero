import { GameStateDto } from '../../application/dto/GameStateDto';
import { ASSETS, getAssetUrl, imgTag } from '../assets/AssetCatalog';
import { countUpgradeItems } from '../components/GearComparison';

export class GameHudController {
  constructor(
    private readonly stageLabel: HTMLElement,
    private readonly goldLabel: HTMLElement,
    private readonly chestLabel: HTMLElement,
    private readonly chestProgressLabel: HTMLElement,
    private readonly openInventoryBtn: HTMLButtonElement,
    private readonly optimizeLoadoutBtn: HTMLButtonElement,
    private readonly openAllChestsBtn: HTMLButtonElement,
    private readonly openUpgradesBtn: HTMLButtonElement,
    private readonly openChestBtn: HTMLButtonElement,
    private readonly tickBtn: HTMLButtonElement,
  ) {}

  render(state: GameStateDto, options: { openingChests: boolean; autoBattleEnabled: boolean }): void {
    const waveLabel = state.phaseRun
      ? ` · Wave ${state.phaseRun.waveIndex + 1}/${state.phaseRun.waveCount}${state.phaseRun.isBossWave ? ' ☠' : ''}`
      : '';
    this.stageLabel.innerHTML = `${imgTag(getAssetUrl(ASSETS.ui.stage), 'Fase', 'stat-icon')} ${state.phaseLabel}${waveLabel}`;
    this.stageLabel.title = `${state.campaignName} · ${state.mapName} · Tier ${state.stage}`;
    this.goldLabel.innerHTML = `${imgTag(getAssetUrl(ASSETS.ui.gold), 'Ouro', 'stat-icon')} ${state.gold}`;
    this.chestLabel.innerHTML = `${imgTag(getAssetUrl(ASSETS.ui.chest), 'Baús', 'stat-icon')} ${state.pendingChestCount}`;

    const progress = state.chestProgress;
    this.chestProgressLabel.innerHTML = `${imgTag(getAssetUrl(ASSETS.ui.chest), 'Próximo baú', 'stat-icon')} ${progress.current}/${progress.target}`;
    this.chestProgressLabel.title = 'Vitórias até o próximo baú';

    const upgradeCount = countUpgradeItems(state);
    const upgradeBadge =
      upgradeCount > 0 ? `<span class="inventory-upgrade-badge">↑${upgradeCount}</span>` : '';

    this.openInventoryBtn.innerHTML = `
      ${imgTag(getAssetUrl(ASSETS.ui.inventory), 'Inventário', 'btn-icon')}
      Inventário (${state.inventory.length})
      ${upgradeBadge}
    `;

    const flags = state.featureFlags;
    this.optimizeLoadoutBtn.classList.toggle('hidden', !flags.optimizeLoadout);
    this.optimizeLoadoutBtn.disabled = !flags.optimizeLoadout || upgradeCount === 0;
    this.optimizeLoadoutBtn.innerHTML =
      upgradeCount > 0 ? `Otimizar (↑${upgradeCount})` : 'Otimizar equipe';

    this.openAllChestsBtn.classList.toggle(
      'hidden',
      !flags.openAllChests || state.pendingChestCount < 2,
    );

    const purchasableBadge =
      state.purchasableUpgradeCount > 0
        ? `<span class="inventory-upgrade-badge">↑${state.purchasableUpgradeCount}</span>`
        : '';
    this.openUpgradesBtn.innerHTML = `Melhorias${purchasableBadge}`;

    const hasChests = state.pendingChestCount > 0;
    this.openChestBtn.disabled = !hasChests || options.openingChests;
    this.openAllChestsBtn.disabled =
      !flags.openAllChests || state.pendingChestCount < 2 || options.openingChests;
    this.openChestBtn.classList.toggle('chest-available', hasChests);

    this.tickBtn.classList.toggle('auto-battle-active', options.autoBattleEnabled);
    this.tickBtn.disabled = options.autoBattleEnabled;
  }
}
