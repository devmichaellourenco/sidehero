import { SkillNodeDto } from '../../application/dto/SkillNodeDto';
import { imgTag } from '../assets/AssetCatalog';
import { getSkillBranchFrameUrl, getSkillIconUrl } from '../assets/SkillIconCatalog';
import { renderSkillLockIcon, renderSkillRankDisplay, renderSkillRankLabel, renderSkillTooltipContent } from './SkillTooltipPresentation';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export interface SkillCardOptions {
  allocateAttr: string;
  canAllocate: boolean;
}

const SKILL_STATUS_LABELS: Record<SkillNodeDto['status'], string> = {
  locked: 'Bloqueada',
  ready: 'Disponível',
  owned: 'Desbloqueada',
  maxed: 'Rank máximo',
};

function renderSkillBadge(label: string, modifier: string): string {
  return `<span class="skill-card-badge skill-card-badge--${modifier}">${escapeHtml(label)}</span>`;
}

function renderEssentialBadges(node: SkillNodeDto): string {
  const equipLabel = node.isEquipped ? 'Ativa' : 'Inativa';
  const badges = [
    renderSkillBadge(node.branchLabel, node.branch),
    renderSkillBadge(equipLabel, node.isEquipped ? 'equipped' : 'unequipped'),
  ];

  if (node.status === 'ready') {
    badges.push(renderSkillBadge(SKILL_STATUS_LABELS[node.status], node.status));
  }

  return badges.join('');
}

function renderSkillRankUpButton(node: SkillNodeDto, options: SkillCardOptions): string {
  if (node.status === 'maxed' || node.currentRank >= node.maxRank) return '';

  const canAllocate = options.canAllocate && node.canAllocateRank;
  const nextRank = Math.min(node.currentRank + 1, node.maxRank);
  const tooltip = canAllocate
    ? `Subir para rank ${nextRank}/${node.maxRank} · Gasta 1 Aprimoramento`
    : node.currentRank <= 0
      ? 'Desbloqueie a skill para subir rank'
      : 'Requisitos não atendidos ou sem Aprimoramento';

  return `
    <button
      type="button"
      class="skill-card-rank-up${canAllocate ? ' skill-card-rank-up--available' : ''}"
      ${options.allocateAttr}="${node.id}"
      title="${escapeHtml(tooltip)}"
      aria-label="${escapeHtml(tooltip)}"
      ${canAllocate ? '' : 'disabled'}
    >+</button>
  `;
}

export function renderSkillCard(node: SkillNodeDto, options: SkillCardOptions): string {
  const frameUrl = getSkillBranchFrameUrl(node.branch);
  const iconUrl = getSkillIconUrl(node.id);
  const isLocked = node.status === 'locked';
  const iconWrapClass = `skill-card-icon-wrap skill-card-icon-wrap--${node.branch}${isLocked ? ' skill-card-icon-wrap--locked' : ''}`;
  const lockOverlay = isLocked ? renderSkillLockIcon() : '';
  const equipAttrs = node.canEquip
    ? `data-skill-equip="${node.id}" draggable="true"`
    : '';
  const equipClass = node.canEquip ? ' skill-card--equippable' : '';

  return `
    <article class="skill-card skill-card-${node.status} skill-card--${node.branch} skill-card--compact${equipClass}" data-skill-tooltip tabindex="0" ${equipAttrs} aria-label="${escapeHtml(node.name)} — ${escapeHtml(renderSkillRankLabel(node.currentRank, node.maxRank, node.status))}">
      <div class="skill-card-compact">
        <div class="skill-card-visual">
          <span
            class="${iconWrapClass}"
            style="--slot-frame: url('${frameUrl}')"
          >
            ${imgTag(iconUrl, node.name, 'skill-card-icon')}
            ${lockOverlay}
          </span>
        </div>
        <div class="skill-card-body">
          <header class="skill-card-header">
            <h4>${escapeHtml(node.name)}</h4>
            ${renderSkillRankDisplay(node.currentRank, node.maxRank, node.status)}
          </header>
          <div class="skill-card-essentials-row">
            <div class="skill-card-essentials">${renderEssentialBadges(node)}</div>
            ${renderSkillRankUpButton(node, options)}
          </div>
        </div>
      </div>
      ${renderSkillTooltipContent({
        ...node,
        status: node.status,
        statusLabel: SKILL_STATUS_LABELS[node.status],
      })}
    </article>
  `;
}
