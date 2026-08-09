import { MissionBoardDto, MissionPreviewDto } from '../../application/dto/MissionBoardDto';
import { ASSETS, getAssetUrl, getEnemySpriteUrl, imgTag } from '../assets/AssetCatalog';
import {
  placeMissionsOnLayout,
  resolveMissionMapLayout,
  type MapPercentPoint,
} from '../campaign/MissionMapLayoutCatalog';

export function escapeMissionHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function kindLabel(kind: MissionPreviewDto['kind']): string {
  if (kind === 'main') return 'Principal';
  if (kind === 'side') return 'Secundária';
  return 'Normal';
}

export function resolveInitialPendingMissionId(board: MissionBoardDto | null | undefined): string | null {
  if (!board) return null;
  const selected =
    (board.main?.selected ? board.main : null) ??
    board.sides.find((mission) => mission.selected) ??
    board.normals.find((mission) => mission.selected);
  if (selected) return selected.id;
  if (board.main) return board.main.id;
  if (board.sides[0]) return board.sides[0].id;
  return board.normals[0]?.id ?? null;
}

export function findMissionOnBoard(
  board: MissionBoardDto | null | undefined,
  missionId: string | null,
): MissionPreviewDto | null {
  if (!board || !missionId) return null;
  if (board.main?.id === missionId) return board.main;
  return (
    board.sides.find((mission) => mission.id === missionId) ??
    board.normals.find((mission) => mission.id === missionId) ??
    null
  );
}

function styleForPoint(point: MapPercentPoint): string {
  return `left:${point.x}%;top:${point.y}%`;
}

function renderMissionPin(
  mission: MissionPreviewDto,
  pendingMissionId: string | null,
  point: MapPercentPoint,
): string {
  const pending = mission.id === pendingMissionId;
  const stateClass = [
    pending ? ' campaign-mission-pin--pending' : '',
    ` campaign-mission-pin--${mission.kind}`,
  ].join('');
  const stars = mission.stars ?? 0;
  const label = `${kindLabel(mission.kind)}: ${mission.name}`;

  return `
    <button
      type="button"
      class="campaign-mission-pin${stateClass}"
      style="${styleForPoint(point)}"
      data-mission-id="${escapeMissionHtml(mission.id)}"
      data-mission-kind="${escapeMissionHtml(mission.kind)}"
      title="${escapeMissionHtml(label)}"
      aria-label="${escapeMissionHtml(label)}"
      aria-pressed="${pending ? 'true' : 'false'}"
    >
      <span class="campaign-mission-pin-glyph" aria-hidden="true"></span>
      ${
        stars > 0
          ? `<span class="campaign-mission-pin-stars" aria-hidden="true">${'★'.repeat(stars)}</span>`
          : ''
      }
    </button>
  `;
}

function renderLegacyListBoard(
  board: MissionBoardDto,
  pendingMissionId: string | null,
): string {
  const missions = [
    ...(board.main ? [board.main] : []),
    ...board.sides,
    ...board.normals,
  ];

  if (missions.length === 0) {
    return `
      <div class="campaign-mission-board campaign-mission-board--empty">
        <p class="empty-state">Nenhuma missão disponível neste mapa nesta visita.</p>
      </div>
    `;
  }

  const nodes = missions
    .map((mission, index) => {
      const point = { x: index % 2 === 0 ? 28 : 72, y: 20 + index * 18 };
      return renderMissionPin(mission, pendingMissionId, point);
    })
    .join('');

  return `
    <div class="campaign-mission-board campaign-mission-board--list" data-campaign-mission-board>
      <div class="campaign-mission-board-track campaign-mission-board-track--pins">${nodes}</div>
    </div>
  `;
}

/** Stage de mapa (Stendra+) ou lista legado. Posições em % — independentes da arte. */
export function renderMissionLocalesMap(
  board: MissionBoardDto,
  pendingMissionId: string | null,
): string {
  const layout = resolveMissionMapLayout(board.mapId);
  if (!layout) {
    return renderLegacyListBoard(board, pendingMissionId);
  }

  const byId = new Map<string, MissionPreviewDto>();
  if (board.main) byId.set(board.main.id, board.main);
  for (const side of board.sides) byId.set(side.id, side);
  for (const normal of board.normals) byId.set(normal.id, normal);

  if (byId.size === 0) {
    return `
      <div class="campaign-mission-board campaign-mission-board--empty">
        <p class="empty-state">Nenhuma missão disponível neste mapa nesta visita.</p>
      </div>
    `;
  }

  const placed = placeMissionsOnLayout({
    layout,
    mainId: board.main?.id ?? null,
    sideIds: board.sides.map((mission) => mission.id),
    normalIds: board.normals.map((mission) => mission.id),
  });

  const markers = placed
    .map((entry) => {
      const mission = byId.get(entry.missionId);
      if (!mission) return '';
      return renderMissionPin(mission, pendingMissionId, entry.point);
    })
    .join('');

  const bgUrl = layout.backgroundAssetPath ? getAssetUrl(layout.backgroundAssetPath) : '';
  const stageStyle = [
    `aspect-ratio:${layout.aspectRatio}`,
    bgUrl ? `--mission-map-bg:url('${escapeMissionHtml(bgUrl)}')` : '',
  ]
    .filter(Boolean)
    .join(';');

  return `
    <div
      class="campaign-mission-board campaign-mission-board--stage"
      data-campaign-mission-board
      data-mission-map="${escapeMissionHtml(layout.mapId)}"
      data-mission-map-aspect="${layout.aspectRatio}"
    >
      <div
        class="campaign-mission-stage${bgUrl ? ' campaign-mission-stage--has-bg' : ''}"
        style="${stageStyle}"
      >
        <div class="campaign-mission-stage-art" aria-hidden="true"></div>
        <div class="campaign-mission-stage-markers">${markers}</div>
      </div>
    </div>
  `;
}

function renderFeaturedEnemies(mission: MissionPreviewDto): string {
  if (mission.featuredEnemyTypes.length === 0) return '';
  const items = mission.featuredEnemyTypes
    .map((enemyType) => {
      const url = getEnemySpriteUrl(enemyType, enemyType);
      return `
        <li class="campaign-mission-enemy">
          ${imgTag(url, enemyType, 'campaign-mission-enemy-sprite')}
        </li>
      `;
    })
    .join('');
  return `<ul class="campaign-mission-enemies" aria-label="Inimigos em destaque">${items}</ul>`;
}

export function renderMissionPreviewFooter(
  board: MissionBoardDto | null | undefined,
  pendingMissionId: string | null,
): string {
  const mission = findMissionOnBoard(board, pendingMissionId);
  if (!mission) {
    return `
      <footer class="campaign-phase-preview campaign-phase-preview--empty">
        <p class="campaign-phase-preview-empty">Selecione uma missão no mapa de locais.</p>
      </footer>
    `;
  }

  const rewardBits: string[] = [];
  if (mission.rewards?.gold) rewardBits.push(`${mission.rewards.gold} ouro`);
  if (mission.rewards?.xp) rewardBits.push(`${mission.rewards.xp} XP`);
  if (mission.rewards?.itemId) rewardBits.push('item exclusivo');
  if (mission.rewards?.sceneId) rewardBits.push('cena');

  return `
    <footer class="campaign-phase-preview" data-campaign-mission-preview>
      <div class="campaign-phase-preview-main">
        <div class="campaign-phase-preview-copy">
          <p class="campaign-phase-preview-eyebrow">${escapeMissionHtml(kindLabel(mission.kind))}${
            mission.stars ? ` · ${mission.stars}★` : ''
          }</p>
          <h4 class="campaign-phase-preview-title">${escapeMissionHtml(mission.name)}</h4>
          <p class="campaign-phase-preview-meta">${mission.waveCount} waves · Tier ${mission.difficultyTier}</p>
          ${
            mission.challengeHint
              ? `<p class="campaign-phase-preview-challenge">${escapeMissionHtml(mission.challengeHint)}</p>`
              : ''
          }
          ${rewardBits.length > 0 ? `<p class="campaign-mission-rewards">${escapeMissionHtml(rewardBits.join(' · '))}</p>` : ''}
          ${renderFeaturedEnemies(mission)}
        </div>
      </div>
      <button
        type="button"
        class="campaign-phase-preview-start"
        data-campaign-start-mission="${escapeMissionHtml(mission.id)}"
      >
        Iniciar missão
      </button>
    </footer>
  `;
}

export function renderMissionBoardChromeHint(): string {
  return imgTag(getAssetUrl(ASSETS.ui.campaign), 'Missões', 'campaign-mission-hint-icon');
}
