import { CampaignMapDto, CampaignOverviewDto } from '../../application/dto/CampaignDto';
import {
  escapeHtml,
  getCampaignMapTheme,
  mapProgress,
  parseMapIndex,
  renderCampaignHeroBanner,
  renderLockedMapPanel,
  renderMapProgressBar,
  renderMapTabRing,
  renderPhaseButton,
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
        const mapIndex = parseMapIndex(map);
        const locked = !isMapUnlocked(map);
        const tabState = locked ? ' campaign-map-tab--locked' : '';
        const disabled = locked ? ' disabled' : '';
        const theme = getCampaignMapTheme(map.id);

        return `
          <button
            type="button"
            class="campaign-map-tab${active}${tabState}"
            data-campaign-map-tab="${escapeHtml(map.id)}"
            data-campaign-theme="${escapeHtml(map.id)}"
            data-map-unlocked="${map.unlocked}"
            aria-selected="${map.id === activeMapId}"
            ${disabled}
            title="${locked ? 'Conclua o boss do mapa anterior para desbloquear' : escapeHtml(map.name)}"
          >
            <span class="campaign-map-tab-visual">
              ${locked ? '<span class="campaign-map-tab-lock" aria-hidden="true"></span>' : renderMapTabRing(progress.cleared, progress.total)}
            </span>
            <span class="campaign-map-tab-copy">
              <span class="campaign-map-tab-name">${escapeHtml(map.name)}</span>
              <span class="campaign-map-tab-meta">${escapeHtml(theme.biomeLabel)} · ${progress.cleared}/${progress.total}</span>
            </span>
          </button>
        `;
      })
      .join('');
  }

  renderMapPanel(map: CampaignMapDto): string {
    if (!isMapUnlocked(map)) {
      return renderLockedMapPanel(map);
    }

    const mapIndex = parseMapIndex(map);
    const theme = getCampaignMapTheme(map.id);
    const phases = map.phases.map((phase) => renderPhaseButton(phase, mapIndex)).join('');

    return `
      <header class="campaign-map-header">
        <div class="campaign-map-header-main">
          <h3 class="campaign-map-title">${escapeHtml(map.name)}</h3>
          <p class="campaign-map-biome">${escapeHtml(theme.biomeLabel)} · ${tierRangeForMap(mapIndex)}</p>
        </div>
        ${renderMapProgressBar(map, mapIndex)}
      </header>
      <div class="campaign-phase-grid">${phases}</div>
    `;
  }

  render(campaign: CampaignOverviewDto, activeMapId: string): string {
    const activeMap = campaign.maps.find((map) => map.id === activeMapId) ?? campaign.maps[0];

    return `
      <div class="campaign-modal" data-campaign-theme="${escapeHtml(activeMapId)}">
        ${renderCampaignHeroBanner(campaign)}
        <p class="campaign-modal-hint">Toque em uma fase desbloqueada. Bosses aparecem a cada 50 fases.</p>
        <div class="campaign-map-tabs" data-campaign-map-tabs role="tablist" aria-label="Mapas">
          ${this.renderTabs(campaign, activeMapId)}
        </div>
        <section
          class="campaign-map-panel"
          data-campaign-map-panel
          data-campaign-theme="${escapeHtml(activeMapId)}"
          role="tabpanel"
          aria-label="${escapeHtml(activeMap?.name ?? 'Mapa')}"
        >
          ${activeMap ? this.renderMapPanel(activeMap) : '<p class="empty-state">Nenhum mapa disponível.</p>'}
        </section>
      </div>
    `;
  }
}
