import { CampaignMapDto, CampaignOverviewDto, CampaignPhaseDto } from '../../application/dto/CampaignDto';
import { CAMPAIGN_MAPS, TOTAL_CAMPAIGN_PHASES } from '../../domain/campaign/CampaignMaps';
import { ASSETS, getAssetUrl, getEnemySpriteUrl, imgTag } from '../assets/AssetCatalog';

export type CampaignMapThemeId = (typeof CAMPAIGN_MAPS)[number]['id'];

export interface CampaignMapTheme {
  id: CampaignMapThemeId;
  biomeLabel: string;
}

const MAP_THEMES: Record<CampaignMapThemeId, CampaignMapTheme> = {
  stendra: { id: 'stendra', biomeLabel: 'Planícies verdes' },
  gondonor: { id: 'gondonor', biomeLabel: 'Minas profundas' },
  valdris: { id: 'valdris', biomeLabel: 'Ruínas espectrais' },
  morthaven: { id: 'morthaven', biomeLabel: 'Castelo sombrio' },
  broken_sky: { id: 'broken_sky', biomeLabel: 'Céu fragmentado' },
  crimson_abyss: { id: 'crimson_abyss', biomeLabel: 'Abismo ardente' },
  eternal_forge: { id: 'eternal_forge', biomeLabel: 'Forja ancestral' },
  ancient_grove: { id: 'ancient_grove', biomeLabel: 'Bosque antigo' },
  twilight_tower: { id: 'twilight_tower', biomeLabel: 'Torre crepuscular' },
  void_throne: { id: 'void_throne', biomeLabel: 'Trono do vazio' },
};

const MILESTONE_BOSS_BY_MAP_INDEX: Record<
  number,
  { enemyType: string; displayName: string; bossLabel: string }
> = {
  1: { enemyType: 'saci', displayName: 'Saci', bossLabel: 'Guardião Elemental' },
  2: { enemyType: 'gonodor', displayName: 'Gonodor', bossLabel: 'Capitão da Mina' },
  3: { enemyType: 'bloody_orc_chief', displayName: 'Chefe Orc', bossLabel: 'Espectro de Valdris' },
  4: { enemyType: 'mountain_troll', displayName: 'Troll', bossLabel: 'Duque de Morthaven' },
  5: { enemyType: 'three_head_hydra', displayName: 'Hidra', bossLabel: 'Colosso do Céu Quebrado' },
  6: { enemyType: 'young_green_dragon', displayName: 'Dragão', bossLabel: 'Senhor do Abismo' },
  7: { enemyType: 'lesser_lich', displayName: 'Lich', bossLabel: 'Forjador Eterno' },
  8: { enemyType: 'awakened_titan', displayName: 'Titã', bossLabel: 'Guardião do Bosque' },
  9: { enemyType: 'demon_prince', displayName: 'Príncipe Demônio', bossLabel: 'Sentinela do Crepúsculo' },
  10: { enemyType: 'vorax', displayName: 'Vorax', bossLabel: 'Soberano do Vazio' },
};

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function getCampaignMapTheme(mapId: string): CampaignMapTheme {
  return MAP_THEMES[mapId as CampaignMapThemeId] ?? MAP_THEMES.stendra;
}

export function mapProgress(map: CampaignMapDto): { cleared: number; unlocked: number; total: number } {
  const cleared = map.phases.filter((phase) => phase.cleared).length;
  const unlocked = map.phases.filter((phase) => phase.unlocked || phase.cleared).length;
  return { cleared, unlocked, total: map.phases.length };
}

export function campaignGlobalProgress(campaign: CampaignOverviewDto): {
  cleared: number;
  total: number;
} {
  const cleared = campaign.maps.reduce(
    (sum, map) => sum + map.phases.filter((phase) => phase.cleared).length,
    0,
  );
  return { cleared, total: TOTAL_CAMPAIGN_PHASES };
}

export function parseMapIndex(map: CampaignMapDto): number {
  const fromCatalog = CAMPAIGN_MAPS.find((entry) => entry.id === map.id)?.mapIndex;
  if (fromCatalog) return fromCatalog;

  const phaseId = map.phases[0]?.id;
  if (!phaseId) return 1;
  return Number.parseInt(phaseId.split('-')[0], 10) || 1;
}

export function tierRangeForMap(mapIndex: number): string {
  const min = (mapIndex - 1) * 50 + 1;
  const max = mapIndex * 50;
  return `T${min}–${max}`;
}

export function getMilestoneBossForMapIndex(mapIndex: number) {
  return MILESTONE_BOSS_BY_MAP_INDEX[mapIndex] ?? null;
}

function renderPhaseStatus(phase: CampaignPhaseDto): string {
  if (phase.cleared) {
    return `
      <span class="campaign-phase-status campaign-phase-status--cleared" aria-label="Concluída">
        ${imgTag(getAssetUrl(ASSETS.ui.stage), 'Concluída', 'campaign-phase-status-icon')}
      </span>
    `;
  }

  if (phase.unlocked || phase.playable) {
    return `<span class="campaign-phase-status campaign-phase-status--unlocked" aria-label="Disponível"></span>`;
  }

  return `
    <span class="campaign-phase-status campaign-phase-status--locked" aria-label="Bloqueada">
      <span class="campaign-phase-status-lock" aria-hidden="true"></span>
    </span>
  `;
}

function renderBossVisual(mapIndex: number, phase: CampaignPhaseDto): string {
  if (!phase.milestoneBoss && !phase.seasonFinale) return '';

  const boss = getMilestoneBossForMapIndex(mapIndex);
  if (!boss) return '';

  const spriteUrl = getEnemySpriteUrl(boss.enemyType, boss.displayName);
  const frameClass = phase.seasonFinale
    ? 'campaign-phase-boss-frame campaign-phase-boss-frame--finale'
    : 'campaign-phase-boss-frame';

  return `
    <div class="${frameClass}">
      ${imgTag(spriteUrl, boss.bossLabel, 'campaign-phase-boss-sprite')}
      ${
        phase.seasonFinale
          ? imgTag(getAssetUrl(ASSETS.ui.victoryWings), '', 'campaign-phase-finale-wings')
          : ''
      }
    </div>
  `;
}

export function renderCampaignHeroBanner(campaign: CampaignOverviewDto): string {
  const { cleared, total } = campaignGlobalProgress(campaign);
  const fillPct = total > 0 ? Math.round((cleared / total) * 100) : 0;
  const campaignIcon = getAssetUrl(ASSETS.ui.campaign);
  const frameIcon = getAssetUrl(ASSETS.ui.victoryFrame);

  return `
    <header class="campaign-hero-banner">
      <div class="campaign-hero-banner-frame" aria-hidden="true">
        ${imgTag(frameIcon, '', 'campaign-hero-banner-frame-img')}
      </div>
      <div class="campaign-hero-banner-main">
        ${imgTag(campaignIcon, 'Campanha', 'campaign-hero-banner-icon')}
        <div class="campaign-hero-banner-copy">
          <h2 class="campaign-hero-banner-title">${escapeHtml(campaign.name)}</h2>
          <p class="campaign-hero-banner-subtitle">Escolha uma fase e avance pela jornada</p>
        </div>
      </div>
      <div class="campaign-global-progress">
        <div class="campaign-global-progress-labels">
          <span class="campaign-global-progress-title">Progresso total</span>
          <span class="campaign-global-progress-value">${cleared}/${total}</span>
        </div>
        <div
          class="campaign-global-progress-track"
          role="progressbar"
          aria-valuenow="${cleared}"
          aria-valuemin="0"
          aria-valuemax="${total}"
          aria-label="Progresso da campanha"
        >
          <div class="campaign-global-progress-fill" style="width: ${fillPct}%"></div>
        </div>
      </div>
    </header>
  `;
}

export function renderMapProgressBar(map: CampaignMapDto, mapIndex: number): string {
  const progress = mapProgress(map);
  const blocks = Array.from({ length: 5 }, (_, blockIndex) => {
    const blockStart = blockIndex * 10;
    const blockEnd = blockStart + 10;
    const clearedInBlock = map.phases.filter((phase) => {
      const phaseNumber = Number.parseInt(phase.id.split('-')[1] ?? '0', 10);
      return phaseNumber > blockStart && phaseNumber <= blockEnd && phase.cleared;
    }).length;
    const fillPct = Math.round((clearedInBlock / 10) * 100);
    const isCurrentBlock =
      progress.cleared >= blockStart && progress.cleared < blockEnd && progress.cleared < progress.total;

    return `
      <div
        class="campaign-map-progress-block${isCurrentBlock ? ' campaign-map-progress-block--current' : ''}"
        title="Fases ${blockStart + 1}–${blockEnd}: ${clearedInBlock}/10"
      >
        <div class="campaign-map-progress-block-fill" style="width: ${fillPct}%"></div>
        <span class="campaign-map-progress-block-label">${blockIndex + 1}</span>
      </div>
    `;
  }).join('');

  const selectedPhase = map.phases.find((phase) => phase.selected);
  const selectedNumber = selectedPhase
    ? Number.parseInt(selectedPhase.id.split('-')[1] ?? '0', 10)
    : progress.cleared || 1;
  const tooltip = `Fase ${selectedNumber}/${progress.total} · ${tierRangeForMap(mapIndex)}`;

  return `
    <div class="campaign-map-progress" title="${escapeHtml(tooltip)}">
      <div class="campaign-map-progress-track">${blocks}</div>
      <p class="campaign-map-progress-meta">
        <span>${progress.cleared}/${progress.total} concluídas</span>
        <span>${progress.unlocked} desbloqueadas</span>
        <span>${tierRangeForMap(mapIndex)}</span>
      </p>
    </div>
  `;
}

export function renderPhaseButton(phase: CampaignPhaseDto, mapIndex: number): string {
  const selected = phase.selected ? ' campaign-phase--selected' : '';
  const disabled = phase.playable ? '' : ' disabled';
  const milestoneClass = phase.milestoneBoss ? ' campaign-phase--milestone' : '';
  const finaleClass = phase.seasonFinale ? ' campaign-phase--finale' : '';
  const clearedClass = phase.cleared ? ' campaign-phase--cleared' : '';
  const lockedClass = !phase.unlocked && !phase.cleared ? ' campaign-phase--locked' : '';
  const phaseNumber = phase.id.split('-')[1] ?? phase.displayName;
  const bossVisual = renderBossVisual(mapIndex, phase);
  const hereBadge = phase.selected
    ? '<span class="campaign-phase-here">Aqui</span>'
    : '';
  const roleLabel = phase.seasonFinale
    ? 'Final da temporada'
    : phase.milestoneBoss
      ? 'Boss do mapa'
      : `Fase ${phaseNumber}`;

  return `
    <button
      type="button"
      class="campaign-phase${selected}${milestoneClass}${finaleClass}${clearedClass}${lockedClass}"
      data-phase-id="${escapeHtml(phase.id)}"
      title="${escapeHtml(phase.displayName)} · ${roleLabel} · T${phase.difficultyTier}"
      ${disabled}
    >
      ${hereBadge}
      ${renderPhaseStatus(phase)}
      ${bossVisual}
      <span class="campaign-phase-name">${escapeHtml(phase.displayName)}</span>
      <span class="campaign-phase-meta">
        ${roleLabel} · ${phase.waveCount} waves · T${phase.difficultyTier}
      </span>
    </button>
  `;
}

export function renderLockedMapPanel(map: CampaignMapDto): string {
  const mapIndex = parseMapIndex(map);
  const previousBoss = getMilestoneBossForMapIndex(mapIndex - 1);
  const theme = getCampaignMapTheme(map.id);
  const bossVisual = previousBoss
    ? `
      <div class="campaign-map-locked-boss">
        ${imgTag(
          getEnemySpriteUrl(previousBoss.enemyType, previousBoss.displayName),
          previousBoss.bossLabel,
          'campaign-map-locked-boss-sprite',
        )}
        <p class="campaign-map-locked-boss-name">${escapeHtml(previousBoss.bossLabel)}</p>
      </div>
    `
    : '';

  return `
    <div class="campaign-map-locked">
      ${bossVisual}
      <p class="campaign-map-locked-title">${escapeHtml(map.name)}</p>
      <p class="campaign-map-locked-biome">${escapeHtml(theme.biomeLabel)}</p>
      <p class="campaign-map-locked-hint">
        ${
          previousBoss
            ? `Derrote <strong>${escapeHtml(previousBoss.bossLabel)}</strong> na fase 50 do mapa anterior para desbloquear esta região.`
            : `Conclua o mapa anterior para desbloquear ${escapeHtml(map.name)}.`
        }
      </p>
    </div>
  `;
}

export function renderMapTabRing(cleared: number, total: number): string {
  const pct = total > 0 ? Math.round((cleared / total) * 100) : 0;
  const radius = 10;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return `
    <svg class="campaign-map-tab-ring" viewBox="0 0 28 28" aria-hidden="true">
      <circle class="campaign-map-tab-ring-track" cx="14" cy="14" r="${radius}" />
      <circle
        class="campaign-map-tab-ring-fill"
        cx="14"
        cy="14"
        r="${radius}"
        style="stroke-dasharray: ${circumference}; stroke-dashoffset: ${offset}"
      />
    </svg>
  `;
}
