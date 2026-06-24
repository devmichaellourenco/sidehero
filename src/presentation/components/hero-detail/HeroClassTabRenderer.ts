import { AscensionOptionDto } from '../../../application/dto/AscensionOptionDto';
import { HeroDto } from '../../../application/dto/GameStateDto';
import { SkillNodeDto } from '../../../application/dto/SkillNodeDto';
import { getHeroEvolutionDisplayName } from '../../../domain/progression/getHeroEvolutionDisplayName';
import { getHeroSprite, imgTag } from '../../assets/AssetCatalog';
import { renderSkillCard } from '../SkillCardPresentation';

export interface HeroClassTabData {
  hero: HeroDto;
  options: AscensionOptionDto[];
  ascensionName: string | null;
  ascensionSkillNodes: SkillNodeDto[];
}

export function renderHeroClassTab(data: HeroClassTabData): string {
  const { hero, options, ascensionName, ascensionSkillNodes } = data;
  const evolutionLabel =
    hero.ascensionId && (hero.heroClass === 'knight' || hero.heroClass === 'sorcerer' || hero.heroClass === 'priest')
      ? getHeroEvolutionDisplayName(hero.heroClass, hero.ascensionId)
      : ascensionName;

  const statusSection = hero.ascensionId
    ? renderEvolutionStatus(hero, evolutionLabel)
    : renderAprendizStatus(hero);

  const choiceSection =
    options.length > 0 ? renderEvolutionChoiceView(hero, options, Boolean(hero.ascensionId)) : '';

  const skillSection =
    hero.ascensionId && ascensionSkillNodes.length > 0
      ? renderAscensionSkillNodes(
          ascensionSkillNodes,
          hero.unspentAscensionPoints,
          hero.activeSkills.length,
          hero.maxActiveSkills,
        )
      : hero.ascensionId
        ? '<p class="empty-state">Nenhuma skill de evolução disponível.</p>'
        : '';

  return `
    <section class="hero-class-tab">
      ${statusSection}
      ${choiceSection}
      ${hero.ascensionId ? '<h4 class="hero-class-subtitle">Skills de evolução</h4>' : ''}
      ${skillSection}
    </section>
  `;
}

function renderAprendizStatus(hero: HeroDto): string {
  return `
    <p class="hero-detail-hint">
      Classe base: <strong>${hero.heroClass}</strong> · Level ${hero.level} · <strong>Aprendiz</strong>
    </p>
    <div class="hero-class-status">
      <div class="hero-class-portrait" aria-hidden="true">
        ${imgTag(getHeroSprite(hero), hero.name, 'hero-class-sprite')}
      </div>
    </div>
  `;
}

function renderEvolutionStatus(hero: HeroDto, evolutionLabel: string | null): string {
  return `
    <div class="hero-class-status">
      <div class="hero-class-portrait" aria-hidden="true">
        ${imgTag(getHeroSprite(hero), hero.name, 'hero-class-sprite')}
      </div>
      <div class="hero-class-status-text">
        <p><strong>Classe base:</strong> ${hero.heroClass}</p>
        <p><strong>Evolução:</strong> ${evolutionLabel ?? hero.ascensionId}</p>
        <p><strong>Level:</strong> ${hero.level}</p>
        <p><strong>Pontos de ascensão:</strong> ${hero.unspentAscensionPoints}</p>
      </div>
    </div>
  `;
}

function renderEvolutionChoiceView(
  hero: HeroDto,
  options: AscensionOptionDto[],
  isUpgrade: boolean,
): string {
  const cards = options
    .map((option) => {
      const reqs = option.requirements
        .map((req) => `<li class="${req.met ? 'met' : 'unmet'}">${req.label}</li>`)
        .join('');

      const pathLabel = option.pathLabel
        ? `<span class="ascension-path-label">${option.pathLabel}</span>`
        : '';

      return `
        <article class="ascension-card">
          <div class="ascension-card-preview" aria-hidden="true">
            ${imgTag(
              getHeroSprite({ id: hero.id, heroClass: hero.heroClass, ascensionId: option.id }),
              option.name,
              'ascension-card-sprite',
            )}
          </div>
          <header class="ascension-card-header">
            ${pathLabel}
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
            ${isUpgrade ? 'Evoluir' : 'Escolher caminho'}
          </button>
        </article>
      `;
    })
    .join('');

  const hint = isUpgrade
    ? 'Atenda os requisitos para desbloquear a próxima evolução do seu caminho.'
    : 'Escolha um caminho permanente. Ambos começam como Aprendiz.';

  return `
    <h4 class="hero-class-subtitle">${isUpgrade ? 'Próxima evolução' : 'Escolha o caminho'}</h4>
    <p class="hero-detail-warning">${hint}</p>
    <div class="ascension-list">${cards}</div>
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
