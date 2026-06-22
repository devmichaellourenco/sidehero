import { GameStateDto } from '../../application/dto/GameStateDto';
import { ASSETS, getAssetUrl, imgTag } from '../assets/AssetCatalog';
import { countUpgradeItems } from '../components/GearComparison';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderCampaignTooltipContent(state: GameStateDto): string {
  const waveLine = state.phaseRun
    ? `Wave ${state.phaseRun.waveIndex + 1}/${state.phaseRun.waveCount}${state.phaseRun.isBossWave ? ' (Boss)' : ''}`
    : 'Wave —';

  return `
    <strong class="campaign-tooltip-title">Progresso</strong>
    <span class="campaign-tooltip-line">Campanha: ${escapeHtml(state.campaignName)}</span>
    <span class="campaign-tooltip-line">Mapa: ${escapeHtml(state.mapName)}</span>
    <span class="campaign-tooltip-line">Fase: ${escapeHtml(state.phaseLabel)}</span>
    <span class="campaign-tooltip-line">${escapeHtml(waveLine)}</span>
    <span class="campaign-tooltip-line">Tier ${state.stage}</span>
  `;
}

function renderIconBadge(value: number): string {
  if (value <= 0) return '';
  return `<span class="action-icon-badge">${value}</span>`;
}

export class GameHudController {
  constructor(
    private readonly campaignContextLabel: HTMLElement,
    private readonly goldLabel: HTMLElement,
    private readonly chestLabel: HTMLElement,
    private readonly chestProgressLabel: HTMLElement,
    private readonly openInventoryBtn: HTMLButtonElement,
    private readonly openStashBtn: HTMLButtonElement,
    private readonly openForgeBtn: HTMLButtonElement,
    private readonly optimizeLoadoutBtn: HTMLButtonElement,
    private readonly openAllChestsBtn: HTMLButtonElement,
    private readonly openUpgradesBtn: HTMLButtonElement,
    private readonly openChestBtn: HTMLButtonElement,
    private readonly pauseLoadoutBtn: HTMLButtonElement,
    private readonly continueLoadoutBtn: HTMLButtonElement,
  ) {}

  render(
    state: GameStateDto,
    options: {
      openingChests: boolean;
      loadoutPauseActive?: boolean;
    },
  ): void {
    const phaseId = state.phaseRun?.phaseId ?? state.campaignProgress.selectedPhaseId;
    const waveSuffix = state.phaseRun
      ? ` · ${state.phaseRun.waveIndex + 1}/${state.phaseRun.waveCount}${state.phaseRun.isBossWave ? ' ☠' : ''}`
      : '';

    this.campaignContextLabel.innerHTML = `
      ${imgTag(getAssetUrl(ASSETS.ui.stage), 'Campanha', 'stat-icon')}
      <span class="campaign-context-compact">${escapeHtml(phaseId)}${escapeHtml(waveSuffix)}</span>
      <span class="campaign-tooltip-content hidden">${renderCampaignTooltipContent(state)}</span>
    `;
    this.campaignContextLabel.setAttribute(
      'aria-label',
      `${state.campaignName}, ${state.mapName}, ${state.phaseLabel}`,
    );

    this.goldLabel.innerHTML = `${imgTag(getAssetUrl(ASSETS.ui.gold), 'Ouro', 'stat-icon')} ${state.gold}`;
    this.chestLabel.innerHTML = `${imgTag(getAssetUrl(ASSETS.ui.chest), 'Baús', 'stat-icon')} ${state.pendingChestCount}`;

    const progress = state.chestProgress;
    this.chestProgressLabel.innerHTML = `${imgTag(getAssetUrl(ASSETS.ui.chest), 'Próximo baú', 'stat-icon')} ${progress.current}/${progress.target}`;
    this.chestProgressLabel.title = 'Vitórias até o próximo baú';

    const upgradeCount = countUpgradeItems(state);
    const flags = state.featureFlags;

    this.openInventoryBtn.title = `Inventário (${state.storageCapacity.inventoryUsed}/${state.storageCapacity.inventoryLimit})`;
    this.openInventoryBtn.innerHTML = `
      <img class="btn-icon" src="${getAssetUrl(ASSETS.ui.inventory)}" alt="" aria-hidden="true" />
      ${renderIconBadge(upgradeCount > 0 ? upgradeCount : state.storageCapacity.inventoryUsed >= state.storageCapacity.inventoryLimit ? 1 : 0)}
    `;

    if (state.storageCapacity.stashUnlocked) {
      this.openStashBtn.classList.remove('hidden');
      this.openStashBtn.title = `Baú (${state.storageCapacity.stashUsed}/${state.storageCapacity.stashLimit})`;
      this.openStashBtn.innerHTML = `
        <img class="btn-icon" src="${getAssetUrl(ASSETS.ui.chestOpen)}" alt="" aria-hidden="true" />
        ${renderIconBadge(state.storageCapacity.stashUsed)}
      `;
    } else {
      this.openStashBtn.classList.add('hidden');
    }

    if (flags.divineForge) {
      this.openForgeBtn.classList.remove('hidden');
      this.openForgeBtn.title = 'Forja Divina';
      this.openForgeBtn.innerHTML = `
        <img class="btn-icon" src="${getAssetUrl(ASSETS.ui.forge)}" alt="" aria-hidden="true" />
      `;
    } else {
      this.openForgeBtn.classList.add('hidden');
    }

    this.optimizeLoadoutBtn.classList.toggle('hidden', !flags.optimizeLoadout);
    this.optimizeLoadoutBtn.disabled = !flags.optimizeLoadout || upgradeCount === 0;
    this.optimizeLoadoutBtn.title =
      upgradeCount > 0 ? `Otimizar equipe (↑${upgradeCount})` : 'Otimizar equipe';
    this.optimizeLoadoutBtn.innerHTML = `⬆${renderIconBadge(upgradeCount)}`;

    this.openAllChestsBtn.classList.toggle(
      'hidden',
      !flags.openAllChests || state.pendingChestCount < 2,
    );

    this.openUpgradesBtn.title = 'Melhorias';
    this.openUpgradesBtn.innerHTML = `★${renderIconBadge(state.purchasableUpgradeCount)}`;

    const hasChests = state.pendingChestCount > 0;
    this.openChestBtn.disabled = !hasChests || options.openingChests;
    this.openAllChestsBtn.disabled =
      !flags.openAllChests || state.pendingChestCount < 2 || options.openingChests;
    this.openChestBtn.classList.toggle('chest-available', hasChests);
    this.openChestBtn.title = hasChests
      ? `Abrir baú (${state.pendingChestCount})`
      : 'Nenhum baú disponível';

    const canPause =
      Boolean(state.phaseRun) &&
      !state.seasonCompleted &&
      !options.loadoutPauseActive;
    this.pauseLoadoutBtn.disabled = !canPause;
    this.pauseLoadoutBtn.classList.toggle('hidden', options.loadoutPauseActive);

    this.continueLoadoutBtn.classList.toggle('hidden', !options.loadoutPauseActive);
  }
}
