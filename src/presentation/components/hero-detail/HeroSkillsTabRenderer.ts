import { HeroDto } from '../../../application/dto/GameStateDto';
import { SkillNodeDto } from '../../../application/dto/SkillNodeDto';
import { renderSkillCard } from '../SkillCardPresentation';

export function renderHeroSkillsTab(hero: HeroDto, nodes: SkillNodeDto[], unspentPoints: number): string {
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

  const equippedCount = hero.activeSkills.filter(Boolean).length;

  return `
    <section class="hero-skills-tab">
      <p class="hero-detail-hint hero-skills-tab-meta">
        Pontos disponíveis: <strong>${unspentPoints}</strong>
        · Skills equipadas: <strong>${equippedCount}/${hero.unlockedActiveSkillSlots}</strong>
        · Passe o mouse sobre uma skill para ver descrição, combate e requisitos
      </p>
      <div class="hero-skills-tab-scroll game-scroll">
        <div class="skill-list">${cards}</div>
      </div>
    </section>
  `;
}
