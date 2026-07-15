import { HeroDto } from '../../../application/dto/GameStateDto';
import { SkillNodeDto } from '../../../application/dto/SkillNodeDto';
import { renderSkillCard } from '../SkillCardPresentation';

export function renderHeroSkillsTab(
  hero: HeroDto,
  nodes: SkillNodeDto[],
  ascensionSkillNodes: SkillNodeDto[] = [],
): string {
  if (nodes.length === 0 && ascensionSkillNodes.length === 0) {
    return '<p class="empty-state">Carregando árvore de skills...</p>';
  }

  const classCards = nodes
    .map((node) =>
      renderSkillCard(node, {
        allocateAttr: 'data-skill-allocate',
        canAllocate: node.canAllocateRank,
      }),
    )
    .join('');

  const evolutionSection =
    hero.ascensionId && ascensionSkillNodes.length > 0
      ? renderEvolutionSkillSection(ascensionSkillNodes)
      : '';

  return `
    <section class="hero-skills-tab">
      <div class="hero-skills-tab-scroll game-scroll">
        ${classCards ? `<div class="skill-list">${classCards}</div>` : ''}
        ${evolutionSection}
      </div>
    </section>
  `;
}

function renderEvolutionSkillSection(nodes: SkillNodeDto[]): string {
  const cards = nodes
    .map((node) =>
      renderSkillCard(node, {
        allocateAttr: 'data-ascension-allocate',
        canAllocate: node.canAllocateRank,
      }),
    )
    .join('');

  return `
    <h4 class="hero-skills-subtitle hero-skills-subtitle--evolution">Skills de evolução</h4>
    <div class="skill-list skill-list--evolution">${cards}</div>
  `;
}
