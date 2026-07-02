import { describe, expect, it } from 'vitest';
import { SkillNodeDto } from '../../application/dto/SkillNodeDto';
import { renderSkillCard } from './SkillCardPresentation';

function skillNode(overrides: Partial<SkillNodeDto> = {}): SkillNodeDto {
  return {
    id: 'fireball',
    name: 'Bola de Fogo',
    description: 'Lança uma esfera flamejante que queima inimigos.',
    branch: 'offense',
    branchLabel: 'Ofensivo',
    scope: 'class',
    scopeLabel: 'Classe',
    maxRank: 3,
    currentRank: 1,
    status: 'owned',
    isEquipped: true,
    canAllocateRank: true,
    canEquip: true,
    scaling: 'int',
    scalingLabel: 'INT',
    battleStats: [{ label: 'Dano', value: '24' }],
    requirements: [{ label: 'Lv.5', met: true }],
    ...overrides,
  };
}

const cardOptions = {
  allocateAttr: 'data-skill-allocate',
  canAllocate: true,
};

describe('SkillCardPresentation', () => {
  it('mostra apenas resumo compacto no card', () => {
    const html = renderSkillCard(skillNode(), cardOptions);

    expect(html).toContain('skill-card--compact');
    expect(html).toContain('Bola de Fogo');
    expect(html).toContain('skill-card-essentials');
    expect(html).not.toContain('skill-card-desc');
    expect(html).not.toContain('skill-card-combat');
    expect(html).not.toContain('skill-card-reqs');
    expect(html).not.toContain('Ativar');
    expect(html).not.toContain('Desativar');
    expect(html).toContain('Toque para equipar');
  });

  it('mantém detalhes no tooltip oculto', () => {
    const html = renderSkillCard(skillNode(), cardOptions);

    expect(html).toContain('hero-skill-chip-tooltip');
    expect(html).toContain('Lança uma esfera flamejante');
    expect(html).toContain('hero-skill-chip-tooltip-stat-label');
    expect(html).toContain('hero-skill-chip-tooltip-reqs');
  });

  it('exibe cadeado no ícone quando a skill está bloqueada', () => {
    const html = renderSkillCard(
      skillNode({ status: 'locked', currentRank: 0, canAllocateRank: false, canEquip: false }),
      { ...cardOptions, canAllocate: false },
    );

    expect(html).toContain('skill-card-icon-wrap--locked');
    expect(html).toContain('skill-card-lock');
    expect(html).toContain('🔒');
    expect(html).not.toContain('Não desbloqueada');
    expect(html).not.toContain('skill-card-badge--locked');
  });

  it('permite arrastar skills desbloqueadas para os slots', () => {
    const html = renderSkillCard(skillNode({ canEquip: true }), cardOptions);

    expect(html).toContain('data-skill-equip="fireball"');
    expect(html).toContain('draggable="true"');
  });
});
