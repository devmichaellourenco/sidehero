import { HeroActiveSkillStatDto } from '../../application/dto/GameStateDto';
import { SkillBranchDto } from '../../application/dto/SkillNodeDto';

export interface SkillTooltipData {
  name: string;
  branch: SkillBranchDto;
  branchLabel: string;
  scopeLabel: string;
  scalingLabel: string;
  description: string;
  currentRank: number;
  maxRank: number;
  battleStats: HeroActiveSkillStatDto[];
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderBattleStats(battleStats: HeroActiveSkillStatDto[]): string {
  if (battleStats.length === 0) return '';

  const rows = battleStats
    .map(
      (stat) => `
        <div class="hero-skill-chip-tooltip-stat">
          <span class="hero-skill-chip-tooltip-stat-label">${escapeHtml(stat.label)}</span>
          <span class="hero-skill-chip-tooltip-stat-value">${escapeHtml(stat.value)}</span>
        </div>
      `,
    )
    .join('');

  return `
    <div class="hero-skill-chip-tooltip-section">
      <span class="hero-skill-chip-tooltip-section-title">Na batalha</span>
      <div class="hero-skill-chip-tooltip-stats">${rows}</div>
    </div>
  `;
}

export function renderSkillRankLabel(currentRank: number, maxRank: number): string {
  if (maxRank <= 1) return 'Rank único';
  if (currentRank <= 0) return `Não desbloqueada (máx. ${maxRank})`;
  return `Rank ${currentRank}/${maxRank}`;
}

export function renderSkillTooltipContent(skill: SkillTooltipData): string {
  const rankLabel = renderSkillRankLabel(skill.currentRank, skill.maxRank);

  return `
    <span class="hero-skill-chip-tooltip" role="tooltip">
      <strong class="hero-skill-chip-tooltip-name">${escapeHtml(skill.name)}</strong>
      <span class="hero-skill-chip-tooltip-meta">
        ${escapeHtml(skill.branchLabel)} · ${escapeHtml(skill.scopeLabel)} · ${escapeHtml(skill.scalingLabel)}
      </span>
      <p class="hero-skill-chip-tooltip-desc">${escapeHtml(skill.description)}</p>
      ${renderBattleStats(skill.battleStats)}
      <span class="hero-skill-chip-tooltip-rank">${escapeHtml(rankLabel)}</span>
    </span>
  `;
}
