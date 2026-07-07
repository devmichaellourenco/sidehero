import { HeroDto } from '../../../application/dto/GameStateDto';
import { SkillNodeDto } from '../../../application/dto/SkillNodeDto';
import { renderSkillCard } from '../SkillCardPresentation';

export function renderHeroSkillsTab(_hero: HeroDto, nodes: SkillNodeDto[]): string {
  if (nodes.length === 0) {
    return '<p class="empty-state">Carregando árvore de skills...</p>';
  }

  const cards = nodes
    .map((node) =>
      renderSkillCard(node, {
        allocateAttr: 'data-skill-allocate',
        canAllocate: node.canAllocateRank,
      }),
    )
    .join('');

  return `
    <section class="hero-skills-tab">
      <div class="hero-skills-tab-scroll game-scroll">
        <div class="skill-list">${cards}</div>
      </div>
    </section>
  `;
}
