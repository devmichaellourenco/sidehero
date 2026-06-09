import { HeroActiveSkillStatDto } from '../../application/dto/GameStateDto';
import {
  SkillNodeDto,
  SkillNodeStatusDto,
  SKILL_BRANCH_LABELS,
} from '../../application/dto/SkillNodeDto';
import { imgTag } from '../assets/AssetCatalog';
import { getSkillBranchFrameUrl, getSkillIconUrl } from '../assets/SkillIconCatalog';
import { renderSkillRankLabel, renderSkillTooltipContent } from './SkillTooltipPresentation';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export interface SkillCardOptions {
  allocateAttr: string;
  activateAttr: string;
  deactivateAttr: string;
  allocateLabel?: string;
  canAllocate: boolean;
}

const SKILL_STATUS_LABELS: Record<SkillNodeStatusDto, string> = {
  locked: 'Bloqueada',
  ready: 'Disponível',
  owned: 'Desbloqueada',
  maxed: 'Rank máximo',
};

function renderSkillBadge(label: string, modifier: string): string {
  return `<span class="skill-card-badge skill-card-badge--${modifier}">${escapeHtml(label)}</span>`;
}

function renderBattleStats(stats: HeroActiveSkillStatDto[]): string {
  if (stats.length === 0) return '';

  const rows = stats
    .map(
      (stat) => `
        <span class="skill-card-combat-item">
          <span class="skill-card-combat-label">${escapeHtml(stat.label)}</span>
          <span class="skill-card-combat-value">${escapeHtml(stat.value)}</span>
        </span>
      `,
    )
    .join('<span class="skill-card-combat-sep" aria-hidden="true">·</span>');

  return `
    <p class="skill-card-combat" aria-label="Efeitos em combate">
      <span class="skill-card-combat-title">Combate:</span>
      ${rows}
    </p>
  `;
}

function renderRequirements(node: SkillNodeDto): string {
  if (node.requirements.length === 0) return '';

  const items = node.requirements
    .map(
      (req) =>
        `<li class="skill-card-req skill-card-req--${req.met ? 'met' : 'unmet'}">${escapeHtml(req.label)}</li>`,
    )
    .join('');

  return `<ul class="skill-card-reqs" aria-label="Requisitos">${items}</ul>`;
}

export function renderSkillCard(node: SkillNodeDto, options: SkillCardOptions): string {
  const rankLabel = renderSkillRankLabel(node.currentRank, node.maxRank);
  const equipLabel = node.isEquipped ? 'Ativa' : 'Inativa';
  const frameUrl = getSkillBranchFrameUrl(node.branch);
  const iconUrl = getSkillIconUrl(node.id);
  const branchLabel = SKILL_BRANCH_LABELS[node.branch] ?? node.branchLabel;

  const badges = [
    renderSkillBadge(branchLabel, node.branch),
    renderSkillBadge(node.scopeLabel, 'scope'),
    renderSkillBadge(node.scalingLabel, 'scaling'),
    renderSkillBadge(equipLabel, node.isEquipped ? 'equipped' : 'unequipped'),
  ].join('');

  return `
    <article class="skill-card skill-card-${node.status} skill-card--${node.branch}" data-skill-tooltip>
      <div class="skill-card-top">
        <div class="skill-card-visual">
          <span
            class="skill-card-icon-wrap skill-card-icon-wrap--${node.branch}"
            style="--slot-frame: url('${frameUrl}')"
          >
            ${imgTag(iconUrl, node.name, 'skill-card-icon')}
          </span>
        </div>
        <div class="skill-card-summary">
          <header class="skill-card-header">
            <h4>${escapeHtml(node.name)}</h4>
            <span class="skill-card-rank">${escapeHtml(rankLabel)}</span>
          </header>
          <div class="skill-card-badges">${badges}</div>
        </div>
      </div>
      <div class="skill-card-details">
        <p class="skill-card-desc">${escapeHtml(node.description)}</p>
        ${renderBattleStats(node.battleStats)}
        ${renderRequirements(node)}
        <div class="skill-actions">
          <button type="button" ${options.allocateAttr}="${node.id}" ${options.canAllocate ? '' : 'disabled'}>${options.allocateLabel ?? '+1 rank'}</button>
          <button type="button" ${options.activateAttr}="${node.id}" ${node.canActivate ? '' : 'disabled'}>Ativar (${node.activationCost} ouro)</button>
          <button type="button" ${options.deactivateAttr}="${node.id}" ${node.canDeactivate ? '' : 'disabled'}>Desativar</button>
          <span class="skill-equip-status skill-card-status-hint">${escapeHtml(SKILL_STATUS_LABELS[node.status])}</span>
        </div>
      </div>
      ${renderSkillTooltipContent(node)}
    </article>
  `;
}
