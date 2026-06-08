import { SkillNodeDto } from '../../application/dto/SkillNodeDto';
import { renderSkillTooltipContent } from './SkillTooltipPresentation';

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

export function renderSkillCard(node: SkillNodeDto, options: SkillCardOptions): string {
  const rankLabel = `${node.currentRank}/${node.maxRank}`;
  const equipLabel = node.isEquipped ? 'Ativa' : 'Inativa';

  return `
    <article class="skill-card skill-card-${node.status} skill-card--${node.branch}" data-skill-tooltip>
      <header class="skill-card-header">
        <h4>${escapeHtml(node.name)}</h4>
        <span class="skill-rank">${rankLabel}</span>
      </header>
      <p class="skill-desc">${escapeHtml(node.description)}</p>
      <p class="skill-meta">${escapeHtml(node.scopeLabel)} · ${escapeHtml(node.scalingLabel)}</p>
      <ul class="skill-reqs">
        ${node.requirements.map((req) => `<li class="${req.met ? 'met' : 'unmet'}">${escapeHtml(req.label)}</li>`).join('')}
      </ul>
      <div class="skill-actions">
        <button type="button" ${options.allocateAttr}="${node.id}" ${options.canAllocate ? '' : 'disabled'}>${options.allocateLabel ?? '+1 rank'}</button>
        <button type="button" ${options.activateAttr}="${node.id}" ${node.canActivate ? '' : 'disabled'}>Ativar (${node.activationCost} ouro)</button>
        <button type="button" ${options.deactivateAttr}="${node.id}" ${node.canDeactivate ? '' : 'disabled'}>Desativar</button>
        <span class="skill-equip-status">${equipLabel}</span>
      </div>
      ${renderSkillTooltipContent(node)}
    </article>
  `;
}
