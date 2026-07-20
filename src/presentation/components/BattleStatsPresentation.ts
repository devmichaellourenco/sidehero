import { BattleSessionStatsDto, GameStateDto } from '../../application/dto/GameStateDto';
import { DAMAGE_ELEMENT_LABELS } from '../../domain/combat/DamageElement';

function formatStat(value: number): string {
  return String(Math.max(0, Math.floor(value)));
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderGeneralRows(stats: BattleSessionStatsDto): string {
  const elements = (
    Object.entries(stats.damageByElement) as Array<[keyof typeof DAMAGE_ELEMENT_LABELS, number]>
  )
    .filter(([, amount]) => amount > 0)
    .map(
      ([element, amount]) => `
        <li class="battle-stats-row battle-stats-row--sub">
          <span class="battle-stats-label">${DAMAGE_ELEMENT_LABELS[element]}</span>
          <strong class="battle-stats-value">${formatStat(amount)}</strong>
        </li>`,
    )
    .join('');

  return `
    <ul class="battle-stats-list">
      <li class="battle-stats-row">
        <span class="battle-stats-label">Dano causado</span>
        <strong class="battle-stats-value">${formatStat(stats.damageDealt)}</strong>
      </li>
      <li class="battle-stats-row">
        <span class="battle-stats-label">Cura realizada</span>
        <strong class="battle-stats-value">${formatStat(stats.healingDone)}</strong>
      </li>
      <li class="battle-stats-row">
        <span class="battle-stats-label">Dano sofrido</span>
        <strong class="battle-stats-value">${formatStat(stats.damageTaken)}</strong>
      </li>
      <li class="battle-stats-row">
        <span class="battle-stats-label">Dano mitigado</span>
        <strong class="battle-stats-value">${formatStat(stats.damageMitigated)}</strong>
      </li>
      <li class="battle-stats-row">
        <span class="battle-stats-label">Críticos</span>
        <strong class="battle-stats-value">${formatStat(stats.critCount)}</strong>
      </li>
    </ul>
    ${
      elements
        ? `<h3 class="battle-stats-subtitle">Dano por elemento</h3><ul class="battle-stats-list">${elements}</ul>`
        : ''
    }
  `;
}

function renderHeroSection(stats: BattleSessionStatsDto): string {
  if (stats.heroes.length === 0) {
    return '<p class="battle-stats-empty">Ainda sem dados por herói nesta tentativa.</p>';
  }

  return stats.heroes
    .map((hero) => {
      const elementRows = (
        Object.entries(hero.damageByElement) as Array<[keyof typeof DAMAGE_ELEMENT_LABELS, number]>
      )
        .filter(([, amount]) => amount > 0)
        .map(
          ([element, amount]) => `
            <li class="battle-stats-row battle-stats-row--sub">
              <span class="battle-stats-label">${DAMAGE_ELEMENT_LABELS[element]}</span>
              <strong class="battle-stats-value">${formatStat(amount)}</strong>
            </li>`,
        )
        .join('');

      return `
        <article class="battle-stats-hero-card">
          <header class="battle-stats-hero-header">
            <strong>${escapeHtml(hero.name)}</strong>
            <span class="battle-stats-hero-uses">${formatStat(hero.basicAttackUses)} atk · ${formatStat(hero.skillUses)} skills</span>
          </header>
          <ul class="battle-stats-list battle-stats-list--compact">
            <li class="battle-stats-row battle-stats-row--sub">
              <span class="battle-stats-label">Dano</span>
              <strong class="battle-stats-value">${formatStat(hero.damageDealt)}</strong>
            </li>
            <li class="battle-stats-row battle-stats-row--sub">
              <span class="battle-stats-label">Cura</span>
              <strong class="battle-stats-value">${formatStat(hero.healingDone)}</strong>
            </li>
            <li class="battle-stats-row battle-stats-row--sub">
              <span class="battle-stats-label">Sofrido</span>
              <strong class="battle-stats-value">${formatStat(hero.damageTaken)}</strong>
            </li>
            <li class="battle-stats-row battle-stats-row--sub">
              <span class="battle-stats-label">Mitigado</span>
              <strong class="battle-stats-value">${formatStat(hero.damageMitigated)}</strong>
            </li>
            ${elementRows}
          </ul>
        </article>`;
    })
    .join('');
}

function renderSkillSection(stats: BattleSessionStatsDto): string {
  if (stats.skills.length === 0) {
    return '<p class="battle-stats-empty">Ainda sem usos de skill nesta tentativa.</p>';
  }

  return `
    <ul class="battle-stats-list">
      ${stats.skills
        .map(
          (skill) => `
        <li class="battle-stats-skill-row">
          <div class="battle-stats-skill-main">
            <strong class="battle-stats-skill-name">${escapeHtml(skill.skillName)}</strong>
            <span class="battle-stats-skill-meta">${escapeHtml(skill.heroName)} · ${formatStat(skill.uses)}x</span>
          </div>
          <div class="battle-stats-skill-nums">
            <span title="Dano">${formatStat(skill.damageDealt)} dmg</span>
            <span title="Cura">${formatStat(skill.healingDone)} cura</span>
          </div>
        </li>`,
        )
        .join('')}
    </ul>
  `;
}

export function renderBattleStatsPanel(
  stats: BattleSessionStatsDto,
  options: { live?: boolean; paused?: boolean } = {},
): string {
  const lead = options.live
    ? options.paused
      ? 'Totais da tentativa atual · batalha pausada (atualiza ao continuar).'
      : 'Totais da tentativa atual · atualizando em tempo real.'
    : 'Totais da tentativa atual de fase.';

  return `
    <section class="battle-stats-panel" aria-label="Estatísticas da batalha">
      <p class="battle-stats-lead">${lead}</p>

      <h3 class="battle-stats-subtitle">Geral</h3>
      ${renderGeneralRows(stats)}

      <h3 class="battle-stats-subtitle">Por herói</h3>
      <div class="battle-stats-heroes">${renderHeroSection(stats)}</div>

      <h3 class="battle-stats-subtitle">Por skill</h3>
      ${renderSkillSection(stats)}
    </section>
  `;
}

export function renderBattleStatsBody(state: GameStateDto): string {
  return renderBattleStatsPanel(state.battleSessionStats, {
    live: true,
    paused: state.battlePaused,
  });
}
