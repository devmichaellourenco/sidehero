import { SkillNodeDto } from '../../application/dto/SkillNodeDto';
import { DamageElement } from '../../domain/combat/DamageElement';
import { getSkillElementLabel, getSkillPrimaryElement } from '../../domain/progression/combat/SkillElementResolver';
import { ASSETS, getAssetUrl, imgTag } from '../assets/AssetCatalog';
import { getSkillIconUrl } from '../assets/SkillIconCatalog';
import { StatIconKey, getStatIconUrl, statIconImg } from '../assets/StatIconCatalog';
import { renderSkillLockIcon, renderSkillRankLabel, renderSkillTooltipContent } from './SkillTooltipPresentation';

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
  refundAttr?: string;
  canRefund?: boolean;
  /** Rótulo do ponto gasto no tooltip do [+] (ex.: Aprimoramento). */
  spendPointLabel?: string;
}

const SKILL_STATUS_LABELS: Record<SkillNodeDto['status'], string> = {
  locked: 'Bloqueada',
  ready: 'Disponível',
  owned: 'Desbloqueada',
  maxed: 'Level máximo',
};

const SCALING_STAT_ICON: Record<string, StatIconKey> = {
  str: 'str',
  dex: 'dex',
  int: 'int',
};

const ELEMENT_STAT_ICON: Record<DamageElement, StatIconKey> = {
  physical: 'physicalDamage',
  fire: 'fire',
  cold: 'cold',
  lightning: 'lightning',
  air: 'air',
};

function renderSkillBadge(label: string, modifier: string): string {
  return `<span class="skill-card-badge skill-card-badge--${modifier}">${escapeHtml(label)}</span>`;
}

function renderSkillLevelBadge(node: SkillNodeDto): string {
  const level = Math.max(0, node.currentRank);
  const label = renderSkillRankLabel(node.currentRank, node.maxRank, node.status);
  const maskUrl = getAssetUrl(ASSETS.ui.bookmark);

  return `
    <span class="skill-card-level" title="${escapeHtml(label)}" aria-label="${escapeHtml(label)}" style="--skill-level-mask: url('${maskUrl}')">
      <span class="skill-card-level-shape" aria-hidden="true"></span>
      <span class="skill-card-level-value">${level}</span>
    </span>
  `;
}

function renderSkillMetaIcons(node: SkillNodeDto): string {
  const rows: string[] = [
    `<span class="skill-card-meta-row skill-card-meta-row--branch">${renderSkillBadge(node.branchLabel, node.branch)}</span>`,
  ];

  const scalingKey = SCALING_STAT_ICON[node.scaling];
  if (scalingKey) {
    rows.push(`
      <span class="skill-card-meta-row" title="Escala com ${escapeHtml(node.scalingLabel)}" aria-label="Escala com ${escapeHtml(node.scalingLabel)}">
        ${statIconImg(scalingKey, 'skill-card-meta-icon')}
        <span class="skill-card-meta-label">${escapeHtml(node.scalingLabel)}</span>
      </span>
    `);
  }

  const element = getSkillPrimaryElement(node.id);
  if (element) {
    const elementLabel = getSkillElementLabel(node.id) ?? element;
    const elementIcon = ELEMENT_STAT_ICON[element];
    rows.push(`
      <span class="skill-card-meta-row" title="${escapeHtml(elementLabel)}" aria-label="${escapeHtml(elementLabel)}">
        <img class="skill-card-meta-icon" src="${getStatIconUrl(elementIcon)}" alt="" aria-hidden="true" loading="lazy" draggable="false" />
        <span class="skill-card-meta-label">${escapeHtml(elementLabel)}</span>
      </span>
    `);
  }

  return `<div class="skill-card-meta">${rows.join('')}</div>`;
}

function renderSkillRankDownButton(node: SkillNodeDto, options: SkillCardOptions): string {
  if (!options.refundAttr || !options.canRefund || node.currentRank < 1) return '';

  const tooltip = `Devolver 1 level (${node.currentRank} → ${node.currentRank - 1})`;

  return `
    <button
      type="button"
      class="skill-card-rank-down skill-card-rank-down--available"
      ${options.refundAttr}="${node.id}"
      title="${escapeHtml(tooltip)}"
      aria-label="${escapeHtml(tooltip)}"
    >−</button>
  `;
}

function renderSkillRankUpButton(node: SkillNodeDto, options: SkillCardOptions): string {
  if (node.status === 'maxed' || node.currentRank >= node.maxRank) return '';

  const canAllocate = options.canAllocate && node.canAllocateRank;
  const nextLevel = Math.min(node.currentRank + 1, node.maxRank);
  const spendLabel = options.spendPointLabel ?? 'Aprimoramento';
  const tooltip = canAllocate
    ? `Subir para level ${nextLevel}/${node.maxRank} · Gasta 1 ${spendLabel}`
    : node.currentRank <= 0
      ? 'Desbloqueie a skill para subir level'
      : `Requisitos não atendidos ou sem ${spendLabel}`;

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
  const iconUrl = getSkillIconUrl(node.id);
  const isLocked = node.status === 'locked';
  const visualClass = `skill-card-visual${isLocked ? ' skill-card-visual--locked' : ''}`;
  const lockOverlay = isLocked ? renderSkillLockIcon() : '';
  const equipAttrs = node.canEquip
    ? `data-skill-equip="${node.id}" draggable="true"`
    : '';
  const equipClass = node.canEquip ? ' skill-card--equippable' : '';
  const equippedClass = node.isEquipped ? ' skill-card--equipped-active' : '';
  const ariaEquipped = node.isEquipped ? ', equipada na batalha' : '';

  return `
    <article class="skill-card skill-card-${node.status} skill-card--${node.branch} skill-card--tile${equipClass}${equippedClass}" data-skill-tooltip tabindex="0" ${equipAttrs} aria-label="${escapeHtml(node.name)}${ariaEquipped} — ${escapeHtml(renderSkillRankLabel(node.currentRank, node.maxRank, node.status))}">
      ${renderSkillLevelBadge(node)}
      <div class="skill-card-tile">
        <div class="${visualClass}">
          <div class="skill-card-visual__glow" aria-hidden="true"></div>
          <div class="skill-card-visual__spark" aria-hidden="true"></div>
          ${imgTag(iconUrl, node.name, 'skill-card-icon')}
          ${lockOverlay}
        </div>
        <header class="skill-card-header">
          <h4>${escapeHtml(node.name)}</h4>
        </header>
        <footer class="skill-card-footer">
          ${renderSkillMetaIcons(node)}
        </footer>
        <div class="skill-card-rank-actions">
          ${renderSkillRankDownButton(node, options)}
          ${renderSkillRankUpButton(node, options)}
        </div>
      </div>
      ${renderSkillTooltipContent({
        ...node,
        status: node.status,
        statusLabel:
          node.canAllocateRank && node.status === 'ready'
            ? undefined
            : SKILL_STATUS_LABELS[node.status],
      })}
    </article>
  `;
}
