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
  it('mostra tile com título, arte full-bleed, level e meta rápida', () => {
    const html = renderSkillCard(skillNode(), cardOptions);

    expect(html).toContain('skill-card--tile');
    expect(html).toContain('skill-card-tile');
    expect(html).toContain('skill-card-header');
    expect(html).toContain('skill-card-visual__glow');
    expect(html).toContain('skill-card-visual__spark');
    expect(html).toContain('skill-card-level');
    expect(html).toContain('skill-card-level-shape');
    expect(html).toContain('skill-card-level-value');
    expect(html).toContain('>1<');
    expect(html).toContain('skill-card-meta');
    expect(html).toContain('skill-card-meta-row');
    expect(html).toContain('Ofensivo');
    expect(html).toContain('INT');
    expect(html).toContain('Fogo');
    expect(html).toContain('skill-card--equipped-active');
    expect(html).toContain('Bola de Fogo');
    expect(html).not.toContain('skill-card-body');
    expect(html).not.toContain('skill-card-essentials-row');
    expect(html).not.toContain('skill-card-desc');
    expect(html).not.toContain('skill-card-combat');
    expect(html).not.toContain('skill-card-reqs');
    expect(html).not.toContain('Ativar');
    expect(html).not.toContain('Desativar');
    expect(html).not.toContain('Ativa');
    expect(html).not.toContain('Inativa');
    expect(html).not.toContain('+1 rank');
    expect(html).not.toContain('Rank ');
    expect(html).toContain('skill-card-rank-up');
    expect(html).toContain('skill-card-rank-up--available');
    expect(html).not.toContain('Toque para equipar');
    expect(html).not.toContain('arraste até um slot');
    expect(html).not.toContain('skill-card-equip-hint');
  });

  it('não exibe badge Disponível quando level pode subir', () => {
    const html = renderSkillCard(
      skillNode({ status: 'ready', currentRank: 0, isEquipped: false, canAllocateRank: true }),
      cardOptions,
    );

    expect(html).toContain('skill-card-rank-up--available');
    expect(html).not.toContain('skill-card-badge--ready');
    expect(html).not.toContain('>Disponível<');
  });

  it('não aplica fundo verde quando a skill não está equipada', () => {
    const html = renderSkillCard(skillNode({ isEquipped: false }), cardOptions);

    expect(html).not.toContain('skill-card--equipped-active');
    expect(html).not.toContain('Inativa');
  });

  it('mantém detalhes no tooltip oculto', () => {
    const html = renderSkillCard(skillNode(), cardOptions);

    expect(html).toContain('hero-skill-chip-tooltip');
    expect(html).toContain('tooltip-preview-image');
    expect(html).toContain('Lança uma esfera flamejante');
    expect(html).toContain('hero-skill-chip-tooltip-stat-label');
    expect(html).toContain('hero-skill-chip-tooltip-reqs');
    expect(html).toContain('Level 1/3');
  });

  it('exibe cadeado no ícone quando a skill está bloqueada', () => {
    const html = renderSkillCard(
      skillNode({ status: 'locked', currentRank: 0, canAllocateRank: false, canEquip: false }),
      { ...cardOptions, canAllocate: false },
    );

    expect(html).toContain('skill-card-visual--locked');
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
