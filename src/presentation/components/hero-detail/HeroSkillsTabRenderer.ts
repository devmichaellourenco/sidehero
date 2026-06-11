import { SkillNodeDto } from '../../../application/dto/SkillNodeDto';
import { renderSkillCard } from '../SkillCardPresentation';

export function renderHeroSkillsTab(
  nodes: SkillNodeDto[],
  unspentPoints: number,
  activeSkillCount = 0,
  maxActiveSkills = 3,
): string {
  if (nodes.length === 0) {
    return '<p class="empty-state">Carregando árvore de skills...</p>';
  }

  const cards = nodes
    .map((node) =>
      renderSkillCard(node, {
        allocateAttr: 'data-skill-allocate',
        activateAttr: 'data-skill-activate',
        deactivateAttr: 'data-skill-deactivate',
        canAllocate: node.canAllocateRank,
      }),
    )
    .join('');

  return `
    <section class="hero-skills-tab">
      <p class="hero-detail-hint">
        Pontos disponíveis: <strong>${unspentPoints}</strong>
        · Slots de batalha: <strong>${activeSkillCount}/${maxActiveSkills}</strong>
        · Passe o mouse sobre uma skill para ver detalhes de combate
      </p>
      <div class="skill-list">${cards}</div>
    </section>
  `;
}
