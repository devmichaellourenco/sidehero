import { CampaignMapDto, CampaignOverviewDto } from '../../application/dto/CampaignDto';
import { CampaignViewMode } from '../campaign/CampaignViewStorage';
import {
  escapeHtml,
  getMapBiomeKind,
  parseMapIndex,
  renderCampaignWorldMap,
  renderLockedMapPanel,
  renderMapProgressBar,
  renderMapUnlockBanner,
} from './CampaignMapPresentation';
import {
  renderMissionLocalesMap,
  renderMissionSelectHint,
  resolveInitialPendingMissionId,
} from './CampaignMissionMapPresentation';

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
  renderMapPanel(
    map: CampaignMapDto,
    pendingPhaseId: string | null,
    options: { showUnlockBanner?: boolean; pendingMissionId?: string | null } = {},
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
    // `null` explícito = sem seleção (popover só após clique no pin).
    const pendingMissionId =
      options.pendingMissionId !== undefined
        ? options.pendingMissionId
        : (resolveInitialPendingMissionId(map.missionBoard) ?? pendingPhaseId);

    const boardHtml = map.missionBoard
      ? renderMissionLocalesMap(map.missionBoard, pendingMissionId)
      : '<p class="empty-state">Board de missões indisponível.</p>';
    const hintHtml = pendingMissionId ? '' : renderMissionSelectHint();

    return `
      <div class="campaign-map-body" data-campaign-biome="${biomeKind}">
        ${unlockBanner}
        <header class="campaign-map-header">
          ${renderMapProgressBar(map, mapIndex)}
        </header>
        <div class="campaign-path-scroll game-scroll">
          ${boardHtml}
        </div>
        ${hintHtml}
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
    options: { showUnlockBanner?: boolean; pendingMissionId?: string | null } = {},
  ): string {
    const activeMap = campaign.maps.find((map) => map.id === activeMapId) ?? campaign.maps[0];
    const regionPanel = activeMap
      ? this.renderMapPanel(activeMap, pendingPhaseId, options)
      : '<p class="empty-state">Nenhum mapa disponível.</p>';

    return `
      <div class="campaign-modal" data-campaign-theme="${escapeHtml(activeMapId)}" data-campaign-view="${viewMode}">
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
