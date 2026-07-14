import { GameStateDto } from '../../application/dto/GameStateDto';
import { ASSETS, getAssetUrl } from '../assets/AssetCatalog';
import {
  countClearedPhasesForMap,
  getCampaignMapTheme,
  getMapFlavorText,
  phaseCountForMap,
} from '../components/CampaignMapPresentation';
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
  const theme = getCampaignMapTheme(state.mapId);
  const cleared = countClearedPhasesForMap(state.campaignProgress.clearedPhaseIds, state.mapId);
  const total = phaseCountForMap(state.mapId);
  const fillPct = total > 0 ? Math.round((cleared / total) * 100) : 0;

  return `
    <strong class="campaign-tooltip-title">${escapeHtml(state.mapName)}</strong>
    <span class="campaign-tooltip-line campaign-tooltip-biome">${escapeHtml(theme.biomeLabel)}</span>
    <span class="campaign-tooltip-line campaign-tooltip-flavor">${escapeHtml(getMapFlavorText(state.mapId))}</span>
    <span class="campaign-tooltip-line">Campanha: ${escapeHtml(state.campaignName)}</span>
    <span class="campaign-tooltip-line">Fase: ${escapeHtml(state.phaseLabel)}</span>
    <span class="campaign-tooltip-line">${escapeHtml(waveLine)}</span>
    <span class="campaign-tooltip-line">Tier ${state.stage}</span>
    <div
      class="campaign-tooltip-progress"
      role="progressbar"
      aria-valuenow="${cleared}"
      aria-valuemin="0"
      aria-valuemax="${total}"
      aria-label="Progresso do mapa"
    >
      <div class="campaign-tooltip-progress-track">
        <div class="campaign-tooltip-progress-fill" style="width: ${fillPct}%"></div>
      </div>
      <span class="campaign-tooltip-progress-label">${cleared}/${total} concluídas</span>
    </div>
  `;
}

function buildCampaignTooltipKey(state: GameStateDto): string {
  const waveKey = state.phaseRun
    ? `${state.phaseRun.waveIndex}/${state.phaseRun.waveCount}/${state.phaseRun.isBossWave}`
    : 'none';
  const cleared = countClearedPhasesForMap(state.campaignProgress.clearedPhaseIds, state.mapId);
  return `${state.mapId}|${state.campaignName}|${state.mapName}|${state.phaseLabel}|${waveKey}|${state.stage}|${cleared}`;
}

function createIcon(assetPath: string, alt: string, className: string): HTMLImageElement {
  const img = document.createElement('img');
  img.className = className;
  img.alt = alt;
  img.loading = 'eager';
  img.decoding = 'async';
  img.src = getAssetUrl(assetPath);
  return img;
}

function ensureButtonIcon(button: HTMLButtonElement, assetPath: string): HTMLImageElement {
  let icon = button.querySelector<HTMLImageElement>(':scope > .btn-icon');
  if (!icon) {
    icon = createIcon(assetPath, '', 'btn-icon');
    icon.setAttribute('aria-hidden', 'true');
    button.prepend(icon);
    return icon;
  }

  const nextSrc = getAssetUrl(assetPath);
  if (icon.src !== nextSrc) {
    icon.src = nextSrc;
  }
  icon.loading = 'eager';
  return icon;
}

function ensureBadge(button: HTMLButtonElement): HTMLElement {
  let badge = button.querySelector<HTMLElement>(':scope > .action-icon-badge');
  if (!badge) {
    badge = document.createElement('span');
    badge.className = 'action-icon-badge hidden';
    button.append(badge);
  }
  return badge;
}

function setupStatPill(
  container: HTMLElement,
  assetPath: string,
  alt: string,
): HTMLElement {
  container.replaceChildren();
  const icon = createIcon(assetPath, alt, 'stat-icon');
  const value = document.createElement('span');
  container.append(icon, document.createTextNode(' '), value);
  return value;
}

function updateBadge(badge: HTMLElement, value: number): void {
  if (value <= 0) {
    badge.classList.add('hidden');
    badge.textContent = '';
    return;
  }

  badge.classList.remove('hidden');
  badge.textContent = String(value);
}

export class GameHudController {
  private readonly campaignCompactEl: HTMLElement;
  private readonly campaignTooltipEl: HTMLElement;
  private readonly goldValueEl: HTMLElement;
  private readonly chestValueEl: HTMLElement;
  private readonly chestProgressValueEl: HTMLElement;
  private readonly heroesBadgeEl: HTMLElement;
  private readonly inventoryBadgeEl: HTMLElement;
  private readonly stashBadgeEl: HTMLElement;
  private readonly optimizeBadgeEl: HTMLElement;
  private readonly upgradesBadgeEl: HTMLElement;
  private readonly chestBadgeEl: HTMLElement;
  private readonly openAllChestsBadgeEl: HTMLElement;
  private lastCampaignTooltipKey = '';

  constructor(
    private readonly campaignContextLabel: HTMLElement,
    private readonly goldLabel: HTMLElement,
    private readonly chestLabel: HTMLElement,
    private readonly chestProgressLabel: HTMLElement,
    private readonly openHeroesBtn: HTMLButtonElement,
    private readonly openFormationBtn: HTMLButtonElement,
    private readonly openShopBtn: HTMLButtonElement,
    private readonly openInventoryBtn: HTMLButtonElement,
    private readonly openStashBtn: HTMLButtonElement,
    private readonly openForgeBtn: HTMLButtonElement,
    private readonly optimizeLoadoutBtn: HTMLButtonElement,
    private readonly openAllChestsBtn: HTMLButtonElement,
    private readonly openUpgradesBtn: HTMLButtonElement,
    private readonly openChestBtn: HTMLButtonElement,
    private readonly pauseLoadoutBtn: HTMLButtonElement,
    private readonly continueLoadoutBtn: HTMLButtonElement,
  ) {
    this.campaignContextLabel.replaceChildren();
    this.campaignContextLabel.append(
      createIcon(ASSETS.ui.campaign, 'Campanha', 'stat-icon'),
      (this.campaignCompactEl = document.createElement('span')),
      (this.campaignTooltipEl = document.createElement('span')),
    );
    this.campaignCompactEl.className = 'campaign-context-compact';
    this.campaignTooltipEl.className = 'campaign-tooltip-content hidden';

    this.goldValueEl = setupStatPill(this.goldLabel, ASSETS.ui.gold, 'Ouro');
    this.chestValueEl = setupStatPill(this.chestLabel, ASSETS.ui.chest, 'Baús');
    this.chestProgressValueEl = setupStatPill(
      this.chestProgressLabel,
      ASSETS.ui.chest,
      'Próximo baú',
    );

    ensureButtonIcon(this.openHeroesBtn, ASSETS.ui.heroes);
    this.heroesBadgeEl = ensureBadge(this.openHeroesBtn);

    ensureButtonIcon(this.openFormationBtn, ASSETS.ui.defense);

    ensureButtonIcon(this.openShopBtn, ASSETS.ui.shop);

    ensureButtonIcon(this.openInventoryBtn, ASSETS.ui.inventory);
    this.inventoryBadgeEl = ensureBadge(this.openInventoryBtn);

    ensureButtonIcon(this.openStashBtn, ASSETS.ui.chestOpen);
    this.stashBadgeEl = ensureBadge(this.openStashBtn);

    ensureButtonIcon(this.openForgeBtn, ASSETS.ui.forge);

    ensureButtonIcon(this.optimizeLoadoutBtn, ASSETS.ui.attack);
    this.optimizeBadgeEl = ensureBadge(this.optimizeLoadoutBtn);

    ensureButtonIcon(this.openUpgradesBtn, ASSETS.ui.stage);
    this.upgradesBadgeEl = ensureBadge(this.openUpgradesBtn);

    ensureButtonIcon(this.openChestBtn, ASSETS.ui.chest);
    this.chestBadgeEl = ensureBadge(this.openChestBtn);

    ensureButtonIcon(this.openAllChestsBtn, ASSETS.ui.chestOpen);
    this.openAllChestsBadgeEl = ensureBadge(this.openAllChestsBtn);
  }

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
    const cleared = countClearedPhasesForMap(state.campaignProgress.clearedPhaseIds, state.mapId);
    const total = phaseCountForMap(state.mapId);

    this.campaignContextLabel.setAttribute('data-campaign-theme', state.mapId);
    this.campaignCompactEl.textContent = `${state.mapName} · ${phaseId}${waveSuffix}`;
    this.campaignCompactEl.title = `${state.mapName} · ${cleared}/${total} concluídas`;
    this.campaignContextLabel.setAttribute(
      'aria-label',
      `${state.campaignName}, ${state.mapName}, ${state.phaseLabel}`,
    );

    const tooltipKey = buildCampaignTooltipKey(state);
    if (tooltipKey !== this.lastCampaignTooltipKey) {
      this.campaignTooltipEl.innerHTML = renderCampaignTooltipContent(state);
      this.lastCampaignTooltipKey = tooltipKey;
    }

    this.goldValueEl.textContent = String(state.gold);
    this.chestValueEl.textContent = String(state.pendingChestCount);

    const progress = state.chestProgress;
    this.chestProgressValueEl.textContent = `${progress.current}/${progress.target}`;
    this.chestProgressLabel.title = 'Vitórias até o próximo baú';

    const upgradeCount = countUpgradeItems(state);
    const flags = state.featureFlags;
    const atCamp = state.canEditParty;
    const heroPointsCount = state.heroes.filter((hero) => hero.hasUnspentPoints).length;

    this.openHeroesBtn.classList.toggle('hidden', !atCamp);
    this.openHeroesBtn.title =
      heroPointsCount > 0
        ? `Heróis (${heroPointsCount} com Aprimoramento)`
        : 'Heróis';
    updateBadge(this.heroesBadgeEl, atCamp ? heroPointsCount : 0);

    this.openFormationBtn.classList.toggle('hidden', !atCamp);
    this.openFormationBtn.title = `Formação (${state.activeParty.length}/3)`;

    this.openShopBtn.classList.toggle('hidden', !atCamp);
    this.openShopBtn.title = 'Loja';

    this.openInventoryBtn.classList.toggle('hidden', !atCamp);
    this.openInventoryBtn.title = `Inventário (${state.storageCapacity.inventoryUsed}/${state.storageCapacity.inventoryLimit})`;
    updateBadge(
      this.inventoryBadgeEl,
      atCamp
        ? upgradeCount > 0
          ? upgradeCount
          : state.storageCapacity.inventoryUsed >= state.storageCapacity.inventoryLimit
            ? 1
            : 0
        : 0,
    );

    if (atCamp && state.storageCapacity.stashUnlocked) {
      this.openStashBtn.classList.remove('hidden');
      this.openStashBtn.title = `Cofre (${state.storageCapacity.stashUsed}/${state.storageCapacity.stashLimit})`;
      updateBadge(this.stashBadgeEl, state.storageCapacity.stashUsed);
    } else {
      this.openStashBtn.classList.add('hidden');
      updateBadge(this.stashBadgeEl, 0);
    }

    if (flags.divineForge) {
      this.openForgeBtn.classList.remove('hidden');
      this.openForgeBtn.title = 'Forja Divina';
    } else {
      this.openForgeBtn.classList.add('hidden');
    }

    const canOptimize = atCamp && flags.optimizeLoadout;
    this.optimizeLoadoutBtn.classList.toggle('hidden', !canOptimize);
    this.optimizeLoadoutBtn.disabled = !canOptimize || upgradeCount === 0;
    this.optimizeLoadoutBtn.title =
      upgradeCount > 0 ? `Otimizar equipe (↑${upgradeCount})` : 'Otimizar equipe';
    updateBadge(this.optimizeBadgeEl, canOptimize ? upgradeCount : 0);

    this.openAllChestsBtn.classList.toggle(
      'hidden',
      !flags.openAllChests || state.pendingChestCount < 2,
    );

    this.openUpgradesBtn.title = 'Runas do acampamento';
    updateBadge(this.upgradesBadgeEl, state.purchasableUpgradeCount);

    const hasChests = state.pendingChestCount > 0;
    this.openChestBtn.disabled = !hasChests || options.openingChests;
    this.openAllChestsBtn.disabled =
      !flags.openAllChests || state.pendingChestCount < 2 || options.openingChests;
    this.openChestBtn.classList.toggle('chest-available', hasChests);
    updateBadge(this.chestBadgeEl, hasChests ? state.pendingChestCount : 0);
    updateBadge(
      this.openAllChestsBadgeEl,
      flags.openAllChests && state.pendingChestCount >= 2 ? state.pendingChestCount : 0,
    );
    this.openChestBtn.title = hasChests
      ? `Abrir baú (${state.pendingChestCount})`
      : 'Nenhum baú disponível';

    const canPause =
      Boolean(state.phaseRun) &&
      !options.loadoutPauseActive;
    this.pauseLoadoutBtn.disabled = !canPause;
    this.pauseLoadoutBtn.classList.toggle('hidden', options.loadoutPauseActive);

    this.continueLoadoutBtn.classList.toggle('hidden', !options.loadoutPauseActive);
  }
}
