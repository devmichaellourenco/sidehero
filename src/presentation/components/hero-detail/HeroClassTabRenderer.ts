import { AscensionOptionDto } from '../../../application/dto/AscensionOptionDto';
import { HeroDto } from '../../../application/dto/GameStateDto';
import { SkillNodeDto } from '../../../application/dto/SkillNodeDto';
import { renderSkillCard } from '../SkillCardPresentation';
import {
  renderAscensionMomentBanner,
  renderAscensionPathGrid,
} from './HeroClassAscensionPresentation';

export interface HeroClassTabData {
  hero: HeroDto;
  options: AscensionOptionDto[];
  ascensionName: string | null;
  ascensionSkillNodes: SkillNodeDto[];
}

export function renderHeroClassTab(data: HeroClassTabData): string {
  const { hero, options, ascensionSkillNodes } = data;

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
      ${choiceSection}
      ${hero.ascensionId ? '<h4 class="hero-class-subtitle hero-class-subtitle--skills">Skills de evolução</h4>' : ''}
      ${skillSection}
    </section>
  `;
}

function renderEvolutionChoiceView(
  hero: HeroDto,
  options: AscensionOptionDto[],
  isUpgrade: boolean,
): string {
  return `
    ${renderAscensionMomentBanner(isUpgrade, hero.name)}
    ${renderAscensionPathGrid(hero, options, isUpgrade)}
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
