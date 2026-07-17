import { CampaignMapDto, CampaignOverviewDto } from '../../application/dto/CampaignDto';
import { CampaignViewMode } from '../campaign/CampaignViewStorage';
import {
  escapeHtml,
  getCampaignMapTheme,
  getMapBiomeKind,
  mapProgress,
  parseMapIndex,
  renderCampaignPath,
  renderCampaignWorldMap,
  renderLockedMapPanel,
  renderMapProgressBar,
  renderMapRegionTooltipContent,
  renderMapTabBiomeIcon,
  renderMapTabRing,
  renderMapUnlockBanner,
  renderPhasePreviewFooter,
  tierRangeForMap,
} from './CampaignMapPresentation';

export function isMapUnlocked(map: CampaignMapDto): boolean {
  return map.unlocked;
}

export function resolveInitialMapId(campaign: CampaignOverviewDto): string {
  const selectedMap = campaign.maps.find((map) => map.phases.some((phase) => phase.selected));
  if (selectedMap && isMapUnlocked(selectedMap)) return selectedMap.id;

  const progressMap = campaign.maps.find(
    (map) => isMapUnlocked(map) && map.phases.some((phase) => phase.unlocked && !phase.cleared),
  );
  if (progressMap) return progressMap.id;

  const firstUnlocked = campaign.maps.find((map) => isMapUnlocked(map));
  return firstUnlocked?.id ?? campaign.maps[0]?.id ?? 'stendra';
}

export class CampaignModalRenderer {
  renderTabs(campaign: CampaignOverviewDto, activeMapId: string): string {
    return campaign.maps
      .map((map) => {
        const active = map.id === activeMapId ? ' campaign-map-tab--active' : '';
        const progress = mapProgress(map);
        const locked = !isMapUnlocked(map);
        const tabState = locked ? ' campaign-map-tab--locked' : '';
        const disabled = locked ? ' aria-disabled="true"' : '';
        const theme = getCampaignMapTheme(map.id);
        const mapIndex = parseMapIndex(map);
        const regionTooltip = renderMapRegionTooltipContent(map, mapIndex);

        return `
          <button
            type="button"
            class="campaign-map-tab${active}${tabState}"
            data-campaign-map-tab="${escapeHtml(map.id)}"
            data-campaign-theme="${escapeHtml(map.id)}"
            data-campaign-tooltip
            data-map-unlocked="${map.unlocked}"
            aria-selected="${map.id === activeMapId}"
            ${disabled}
          >
            <span class="campaign-map-tab-visual">
              ${locked ? '<span class="campaign-map-tab-lock" aria-hidden="true"></span>' : renderMapTabRing(progress.cleared, progress.total)}
              ${renderMapTabBiomeIcon(map.id)}
              ${locked ? '<span class="campaign-map-tab-fog" aria-hidden="true"></span>' : ''}
            </span>
            <span class="campaign-map-tab-copy">
              <span class="campaign-map-tab-name">${escapeHtml(map.name)}</span>
              <span class="campaign-map-tab-meta">${escapeHtml(theme.biomeLabel)} · ${progress.cleared}/${progress.total}</span>
            </span>
            <span class="campaign-tooltip-content hidden">${regionTooltip}</span>
          </button>
        `;
      })
      .join('');
  }

  renderMapPanel(
    map: CampaignMapDto,
    pendingPhaseId: string | null,
    options: { showUnlockBanner?: boolean } = {},
  ): string {
    const biomeKind = getMapBiomeKind(map.id);

    if (!isMapUnlocked(map)) {
      return `
        <div class="campaign-map-body" data-campaign-biome="${biomeKind}">
          ${renderLockedMapPanel(map)}
        </div>
      `;
    }

    const mapIndex = parseMapIndex(map);
    const unlockBanner = options.showUnlockBanner ? renderMapUnlockBanner(map) : '';

    return `
      <div class="campaign-map-body" data-campaign-biome="${biomeKind}">
        ${unlockBanner}
        <header class="campaign-map-header">
          ${renderMapProgressBar(map, mapIndex)}
        </header>
        <div class="campaign-path-scroll game-scroll">
          ${renderCampaignPath(map, mapIndex, pendingPhaseId)}
        </div>
        ${renderPhasePreviewFooter(map, mapIndex, pendingPhaseId)}
      </div>
    `;
  }

  renderWorldPanel(campaign: CampaignOverviewDto, activeMapId: string): string {
    return `
      <div class="campaign-map-body campaign-map-body--world" data-campaign-biome="world">
        ${renderCampaignWorldMap(campaign, activeMapId)}
      </div>
    `;
  }

  render(
    campaign: CampaignOverviewDto,
    activeMapId: string,
    pendingPhaseId: string | null,
    viewMode: CampaignViewMode,
    options: { showUnlockBanner?: boolean } = {},
  ): string {
    const activeMap = campaign.maps.find((map) => map.id === activeMapId) ?? campaign.maps[0];
    const regionPanel = activeMap
      ? this.renderMapPanel(activeMap, pendingPhaseId, options)
      : '<p class="empty-state">Nenhum mapa disponível.</p>';

    return `
      <div class="campaign-modal" data-campaign-theme="${escapeHtml(activeMapId)}" data-campaign-view="${viewMode}">
        <p class="campaign-modal-hint">
          ${
            viewMode === 'world'
              ? 'Toque em uma região para abrir a trilha de fases.'
              : 'Toque em uma fase desbloqueada para voltar a jogá-la.'
          }
        </p>
        ${
          viewMode === 'region'
            ? `
          <div class="campaign-map-tabs" data-campaign-map-tabs role="tablist" aria-label="Mapas">
            ${this.renderTabs(campaign, activeMapId)}
          </div>
        `
            : ''
        }
        <section
          class="campaign-map-panel${viewMode === 'world' ? ' campaign-map-panel--world' : ''}"
          data-campaign-map-panel
          data-campaign-theme="${escapeHtml(activeMapId)}"
          role="tabpanel"
          aria-label="${viewMode === 'world' ? 'Mapa-mundo' : escapeHtml(activeMap?.name ?? 'Mapa')}"
        >
          ${viewMode === 'world' ? this.renderWorldPanel(campaign, activeMapId) : regionPanel}
        </section>
      </div>
    `;
  }
}
