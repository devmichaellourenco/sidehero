import { CampaignMapDto, CampaignOverviewDto, CampaignPhaseDto } from '../../application/dto/CampaignDto';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function mapProgress(map: CampaignMapDto): { cleared: number; unlocked: number; total: number } {
  const cleared = map.phases.filter((phase) => phase.cleared).length;
  const unlocked = map.phases.filter((phase) => phase.unlocked || phase.cleared).length;
  return { cleared, unlocked, total: map.phases.length };
}

function tierRangeForMap(mapIndex: number): string {
  const min = (mapIndex - 1) * 50 + 1;
  const max = mapIndex * 50;
  return `T${min}–${max}`;
}

function parseMapIndex(mapId: string, phases: CampaignPhaseDto[]): number {
  const phaseId = phases[0]?.id;
  if (!phaseId) return 1;
  const mapPart = phaseId.split('-')[0];
  return Number.parseInt(mapPart, 10) || 1;
}

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

function renderPhaseButton(phase: CampaignPhaseDto): string {
  const status = phase.cleared ? '✓' : phase.unlocked ? '○' : '🔒';
  const selected = phase.selected ? ' campaign-phase--selected' : '';
  const disabled = phase.playable ? '' : ' disabled';
  const milestoneClass = phase.milestoneBoss ? ' campaign-phase--milestone' : '';
  const finaleClass = phase.seasonFinale ? ' campaign-phase--finale' : '';
  const badge = phase.seasonFinale ? ' · 🏆' : phase.milestoneBoss ? ' · 👑' : '';
  const phaseNumber = phase.id.split('-')[1] ?? phase.displayName;

  return `
    <button
      type="button"
      class="campaign-phase${selected}${milestoneClass}${finaleClass}"
      data-phase-id="${escapeHtml(phase.id)}"
      ${disabled}
    >
      <span class="campaign-phase-status">${status}</span>
      <span class="campaign-phase-name">${escapeHtml(phase.displayName)}</span>
      <span class="campaign-phase-meta">Fase ${escapeHtml(phaseNumber)} · ${phase.waveCount} waves · T${phase.difficultyTier}${badge}</span>
    </button>
  `;
}

export class CampaignModalRenderer {
  renderTabs(campaign: CampaignOverviewDto, activeMapId: string): string {
    return campaign.maps
      .map((map) => {
        const active = map.id === activeMapId ? ' campaign-map-tab--active' : '';
        const progress = mapProgress(map);
        const mapIndex = parseMapIndex(map.id, map.phases);
        const locked = !isMapUnlocked(map);
        const tabState = locked ? ' campaign-map-tab--locked' : '';
        const disabled = locked ? ' disabled' : '';

        return `
          <button
            type="button"
            class="campaign-map-tab${active}${tabState}"
            data-campaign-map-tab="${escapeHtml(map.id)}"
            data-map-unlocked="${map.unlocked}"
            aria-selected="${map.id === activeMapId}"
            ${disabled}
            title="${locked ? 'Conclua o boss do mapa anterior para desbloquear' : escapeHtml(map.name)}"
          >
            <span class="campaign-map-tab-name">${locked ? '🔒 ' : ''}${escapeHtml(map.name)}</span>
            <span class="campaign-map-tab-meta">${tierRangeForMap(mapIndex)} · ${progress.cleared}/${progress.total}</span>
          </button>
        `;
      })
      .join('');
  }

  renderMapPanel(map: CampaignMapDto): string {
    if (!isMapUnlocked(map)) {
      return `
        <div class="campaign-map-locked">
          <p class="campaign-map-locked-title">Mapa bloqueado</p>
          <p class="campaign-map-locked-hint">Derrote o boss da fase 50 do mapa anterior para desbloquear ${escapeHtml(map.name)}.</p>
        </div>
      `;
    }

    const progress = mapProgress(map);
    const mapIndex = parseMapIndex(map.id, map.phases);
    const phases = map.phases.map(renderPhaseButton).join('');

    return `
      <header class="campaign-map-header">
        <h3 class="campaign-map-title">${escapeHtml(map.name)}</h3>
        <p class="campaign-map-summary">
          ${progress.cleared} concluídas · ${progress.unlocked} desbloqueadas · ${tierRangeForMap(mapIndex)}
        </p>
      </header>
      <div class="campaign-phase-grid">${phases}</div>
    `;
  }

  render(campaign: CampaignOverviewDto, activeMapId: string): string {
    const activeMap = campaign.maps.find((map) => map.id === activeMapId) ?? campaign.maps[0];

    return `
      <div class="campaign-modal">
        <p class="campaign-modal-hint">Selecione uma fase desbloqueada ou concluída. Marcos 👑 a cada 50 fases.</p>
        <div class="campaign-map-tabs" data-campaign-map-tabs role="tablist" aria-label="Mapas">
          ${this.renderTabs(campaign, activeMapId)}
        </div>
        <section
          class="campaign-map-panel"
          data-campaign-map-panel
          role="tabpanel"
          aria-label="${escapeHtml(activeMap?.name ?? 'Mapa')}"
        >
          ${activeMap ? this.renderMapPanel(activeMap) : '<p class="empty-state">Nenhum mapa disponível.</p>'}
        </section>
      </div>
    `;
  }
}
