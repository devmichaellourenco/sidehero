import { AscensionOptionDto } from '../../../application/dto/AscensionOptionDto';
import { HeroDto } from '../../../application/dto/GameStateDto';
import { SkillNodeDto } from '../../../application/dto/SkillNodeDto';
import { renderSkillCard } from '../SkillCardPresentation';

export interface HeroClassTabData {
  hero: HeroDto;
  options: AscensionOptionDto[];
  ascensionName: string | null;
  ascensionSkillNodes: SkillNodeDto[];
}

export function renderHeroClassTab(data: HeroClassTabData): string {
  const { hero, options, ascensionName, ascensionSkillNodes } = data;

  if (hero.ascensionId) {
    return renderAscendedView(hero, ascensionName, ascensionSkillNodes);
  }

  return renderAscensionChoiceView(hero, options);
}

function renderAscensionChoiceView(hero: HeroDto, options: AscensionOptionDto[]): string {
  const cards = options
    .map((option) => {
      const reqs = option.requirements
        .map((req) => `<li class="${req.met ? 'met' : 'unmet'}">${req.label}</li>`)
        .join('');

      return `
        <article class="ascension-card">
          <header class="ascension-card-header">
            <h4>${option.name}</h4>
            <span class="ascension-points-badge">+${option.pointsGranted} pts</span>
          </header>
          <p class="ascension-desc">${option.description}</p>
          <ul class="skill-reqs">${reqs}</ul>
          <button
            type="button"
            class="ascension-btn"
            data-ascend="${option.id}"
            ${option.canAscend ? '' : 'disabled'}
          >
            Ascender (irreversível)
          </button>
        </article>
      `;
    })
    .join('');

  return `
    <section class="hero-class-tab">
      <p class="hero-detail-hint">
        Classe base: <strong>${hero.heroClass}</strong> · Level ${hero.level}
      </p>
      <p class="hero-detail-warning">A ascensão é permanente. Escolha com cuidado.</p>
      <div class="ascension-list">${cards}</div>
    </section>
  `;
}

function renderAscendedView(
  hero: HeroDto,
  ascensionName: string | null,
  nodes: SkillNodeDto[],
): string {
  const label = ascensionName ?? hero.ascensionId ?? 'Ascendido';
  const skillSection =
    nodes.length > 0
      ? renderAscensionSkillNodes(
          nodes,
          hero.unspentAscensionPoints,
          hero.activeSkills.length,
          hero.maxActiveSkills,
        )
      : '<p class="empty-state">Nenhuma skill de ascensão disponível.</p>';

  return `
    <section class="hero-class-tab">
      <div class="hero-class-status">
        <p><strong>Classe base:</strong> ${hero.heroClass}</p>
        <p><strong>Ascensão:</strong> ${label}</p>
        <p><strong>Pontos de ascensão:</strong> ${hero.unspentAscensionPoints}</p>
      </div>
      <h4 class="hero-class-subtitle">Sub-árvore de ascensão</h4>
      ${skillSection}
    </section>
  `;
}

function renderAscensionSkillNodes(
  nodes: SkillNodeDto[],
  unspentPoints: number,
  activeSkillCount: number,
  maxActiveSkills: number,
): string {
  const cards = nodes
    .map((node) =>
      renderSkillCard(node, {
        allocateAttr: 'data-ascension-allocate',
        activateAttr: 'data-skill-activate',
        deactivateAttr: 'data-skill-deactivate',
        canAllocate: node.canAllocateRank,
      }),
    )
    .join('');

  return `
    <p class="hero-detail-hint">
      Pontos de ascensão: <strong>${unspentPoints}</strong>
      · Slots de batalha: <strong>${activeSkillCount}/${maxActiveSkills}</strong>
      · Passe o mouse sobre uma skill para ver detalhes de combate
    </p>
    <div class="skill-list">${cards}</div>
  `;
}
