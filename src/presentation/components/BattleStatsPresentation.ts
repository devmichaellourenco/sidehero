import { BattleSessionStatsDto, GameStateDto } from '../../application/dto/GameStateDto';
import { DAMAGE_ELEMENT_LABELS, DamageElement, DAMAGE_ELEMENTS } from '../../domain/combat/DamageElement';

export type BattleStatsTabId =
  | 'general'
  | 'damage'
  | 'healing'
  | 'taken'
  | 'mitigated'
  | 'crits';

const BATTLE_STATS_TABS: Array<{ id: BattleStatsTabId; label: string }> = [
  { id: 'general', label: 'Geral' },
  { id: 'damage', label: 'Dano causado' },
  { id: 'healing', label: 'Cura realizada' },
  { id: 'taken', label: 'Dano sofrido' },
  { id: 'mitigated', label: 'Dano mitigado' },
  { id: 'crits', label: 'Críticos' },
];

type HeroStatRow = BattleSessionStatsDto['heroes'][number];

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

function barPercent(value: number, max: number): number {
  if (max <= 0 || value <= 0) return 0;
  return Math.max(4, Math.min(100, Math.round((value / max) * 100)));
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
            <li class="battle-stats-row battle-stats-row--sub">
              <span class="battle-stats-label">Críticos</span>
              <strong class="battle-stats-value">${formatStat(hero.critCount)}</strong>
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

function renderHeroBarRow(name: string, value: number, max: number): string {
  const pct = barPercent(value, max);
  return `
    <div class="battle-stats-bar-row">
      <span class="battle-stats-bar-name">${escapeHtml(name)}</span>
      <div class="battle-stats-bar-track" aria-hidden="true">
        <span class="battle-stats-bar-fill" style="width: ${pct}%"></span>
      </div>
      <strong class="battle-stats-bar-value">${formatStat(value)}</strong>
    </div>
  `;
}

function renderRankingGroup(
  title: string,
  rows: Array<{ name: string; value: number }>,
): string {
  const withValues = rows.filter((row) => row.value > 0);
  if (withValues.length === 0) return '';

  const sorted = [...withValues].sort((a, b) => b.value - a.value || a.name.localeCompare(b.name));
  const max = sorted[0]?.value ?? 0;

  return `
    <section class="battle-stats-rank-group">
      <h3 class="battle-stats-subtitle">${escapeHtml(title)}</h3>
      <div class="battle-stats-rank-list">
        ${sorted.map((row) => renderHeroBarRow(row.name, row.value, max)).join('')}
      </div>
    </section>
  `;
}

function heroMetricRows(
  heroes: readonly HeroStatRow[],
  pick: (hero: HeroStatRow) => number,
): Array<{ name: string; value: number }> {
  return heroes.map((hero) => ({ name: hero.name, value: pick(hero) }));
}

function renderElementMetricTab(
  stats: BattleSessionStatsDto,
  totalPick: (hero: HeroStatRow) => number,
  elementPick: (hero: HeroStatRow, element: DamageElement) => number,
  emptyLabel: string,
): string {
  if (stats.heroes.length === 0) {
    return `<p class="battle-stats-empty">${escapeHtml(emptyLabel)}</p>`;
  }

  const totalGroup = renderRankingGroup('Total', heroMetricRows(stats.heroes, totalPick));
  const elementGroups = DAMAGE_ELEMENTS.map((element: DamageElement) =>
    renderRankingGroup(
      DAMAGE_ELEMENT_LABELS[element],
      heroMetricRows(stats.heroes, (hero) => elementPick(hero, element)),
    ),
  ).join('');

  const content = `${totalGroup}${elementGroups}`;
  return content.trim()
    ? content
    : `<p class="battle-stats-empty">${escapeHtml(emptyLabel)}</p>`;
}

function renderDamageTab(stats: BattleSessionStatsDto): string {
  return renderElementMetricTab(
    stats,
    (hero) => hero.damageDealt,
    (hero, element) => hero.damageByElement[element],
    'Ainda sem dano causado nesta tentativa.',
  );
}

function renderTakenTab(stats: BattleSessionStatsDto): string {
  return renderElementMetricTab(
    stats,
    (hero) => hero.damageTaken,
    (hero, element) => hero.damageTakenByElement[element],
    'Ainda sem dano sofrido nesta tentativa.',
  );
}

function renderMitigatedTab(stats: BattleSessionStatsDto): string {
  return renderElementMetricTab(
    stats,
    (hero) => hero.damageMitigated,
    (hero, element) => hero.damageMitigatedByElement[element],
    'Ainda sem dano mitigado nesta tentativa.',
  );
}

function renderMetricTab(
  stats: BattleSessionStatsDto,
  title: string,
  pick: (hero: HeroStatRow) => number,
  emptyLabel: string,
): string {
  if (stats.heroes.length === 0) {
    return `<p class="battle-stats-empty">${escapeHtml(emptyLabel)}</p>`;
  }

  const group = renderRankingGroup(title, heroMetricRows(stats.heroes, pick));
  return group || `<p class="battle-stats-empty">${escapeHtml(emptyLabel)}</p>`;
}

function renderTabsNav(activeTab: BattleStatsTabId): string {
  return `
    <nav class="battle-stats-tabs" role="tablist" aria-label="Categorias de estatísticas">
      ${BATTLE_STATS_TABS.map(
        (tab) => `
        <button
          type="button"
          class="battle-stats-tab${tab.id === activeTab ? ' battle-stats-tab--active' : ''}"
          role="tab"
          data-battle-stats-tab="${tab.id}"
          aria-selected="${tab.id === activeTab ? 'true' : 'false'}"
        >${escapeHtml(tab.label)}</button>`,
      ).join('')}
    </nav>
  `;
}

function renderTabPanel(id: BattleStatsTabId, activeTab: BattleStatsTabId, content: string): string {
  const hidden = id === activeTab ? '' : ' hidden';
  return `
    <div
      class="battle-stats-tab-panel${hidden}"
      role="tabpanel"
      data-battle-stats-tab-panel="${id}"
      ${id === activeTab ? '' : 'hidden'}
    >${content}</div>
  `;
}

export function renderBattleStatsPanel(
  stats: BattleSessionStatsDto,
  options: { live?: boolean; paused?: boolean; activeTab?: BattleStatsTabId } = {},
): string {
  const activeTab = options.activeTab ?? 'general';
  const lead = options.live
    ? options.paused
      ? 'Totais da tentativa atual · batalha pausada (atualiza ao continuar).'
      : 'Totais da tentativa atual · atualizando em tempo real.'
    : 'Totais da tentativa atual de fase.';

  const generalContent = `
    ${renderGeneralRows(stats)}
    <h3 class="battle-stats-subtitle">Por herói</h3>
    <div class="battle-stats-heroes">${renderHeroSection(stats)}</div>
    <h3 class="battle-stats-subtitle">Por skill</h3>
    ${renderSkillSection(stats)}
  `;

  return `
    <section class="battle-stats-panel" aria-label="Estatísticas da batalha">
      <p class="battle-stats-lead">${lead}</p>
      ${renderTabsNav(activeTab)}
      ${renderTabPanel('general', activeTab, generalContent)}
      ${renderTabPanel('damage', activeTab, renderDamageTab(stats))}
      ${renderTabPanel(
        'healing',
        activeTab,
        renderMetricTab(
          stats,
          'Total',
          (hero) => hero.healingDone,
          'Ainda sem cura realizada nesta tentativa.',
        ),
      )}
      ${renderTabPanel('taken', activeTab, renderTakenTab(stats))}
      ${renderTabPanel('mitigated', activeTab, renderMitigatedTab(stats))}
      ${renderTabPanel(
        'crits',
        activeTab,
        renderMetricTab(
          stats,
          'Total',
          (hero) => hero.critCount,
          'Ainda sem críticos nesta tentativa.',
        ),
      )}
    </section>
  `;
}

export function renderBattleStatsBody(
  state: GameStateDto,
  activeTab: BattleStatsTabId = 'general',
): string {
  return renderBattleStatsPanel(state.battleSessionStats, {
    live: true,
    paused: state.battlePaused,
    activeTab,
  });
}

export { BATTLE_STATS_TABS };
