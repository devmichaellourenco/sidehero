import { describe, expect, it } from 'vitest';
import type { MissionBoardDto } from '../../application/dto/MissionBoardDto';
import {
  placeMissionsOnLayout,
  STENDRA_MISSION_MAP_LAYOUT,
} from '../campaign/MissionMapLayoutCatalog';
import {
  findMissionOnBoard,
  kindLabel,
  renderMissionLocalesMap,
  resolveInitialPendingMissionId,
} from './CampaignMissionMapPresentation';

function boardFixture(): MissionBoardDto {
  return {
    mapId: 'stendra',
    main: {
      id: 'main:1-1',
      kind: 'main',
      name: 'Quest principal',
      mapId: 'stendra',
      phaseTemplateId: '1-1',
      stars: null,
      waveCount: 2,
      difficultyTier: 1,
      featuredEnemyTypes: ['goblin_raider'],
      featuredEnemies: [],
      rewards: null,
      selected: false,
    },
    sides: [
      {
        id: 'side:stendra_wayward_patrol',
        kind: 'side',
        name: 'Patrulha Desgarrada',
        mapId: 'stendra',
        phaseTemplateId: '1-3',
        stars: 1,
        waveCount: 2,
        difficultyTier: 3,
        featuredEnemyTypes: [],
        featuredEnemies: [],
        rewards: null,
        selected: false,
      },
    ],
    normals: [
      {
        id: 'normal:1-2',
        kind: 'normal',
        name: 'Patrulha',
        mapId: 'stendra',
        phaseTemplateId: '1-2',
        stars: 1,
        waveCount: 2,
        difficultyTier: 2,
        featuredEnemyTypes: [],
        featuredEnemies: [],
        rewards: { gold: 10 },
        selected: false,
      },
      {
        id: 'normal:1-4',
        kind: 'normal',
        name: 'Emboscada',
        mapId: 'stendra',
        phaseTemplateId: '1-4',
        stars: 2,
        waveCount: 2,
        difficultyTier: 4,
        featuredEnemyTypes: [],
        featuredEnemies: [],
        rewards: null,
        selected: false,
      },
    ],
  };
}

describe('MissionMapLayoutCatalog — Stendra', () => {
  it('ancora main/side em slots fixos e pins sem colisão', () => {
    const placed = placeMissionsOnLayout({
      layout: STENDRA_MISSION_MAP_LAYOUT,
      mainId: 'main:1-1',
      sideIds: ['side:a', 'side:b'],
      normalIds: ['normal:1', 'normal:2', 'normal:3'],
    });

    expect(placed.find((p) => p.kind === 'main')?.point).toEqual(
      STENDRA_MISSION_MAP_LAYOUT.mainSlot,
    );
    expect(placed.find((p) => p.missionId === 'side:a')?.point).toEqual(
      STENDRA_MISSION_MAP_LAYOUT.sideSlots[0],
    );

    const normalPoints = placed.filter((p) => p.kind === 'normal').map((p) => `${p.point.x},${p.point.y}`);
    expect(new Set(normalPoints).size).toBe(3);
  });

  it('posições de pin são determinísticas para o mesmo conjunto', () => {
    const a = placeMissionsOnLayout({
      layout: STENDRA_MISSION_MAP_LAYOUT,
      mainId: null,
      sideIds: [],
      normalIds: ['normal:1-4', 'normal:1-2'],
    });
    const b = placeMissionsOnLayout({
      layout: STENDRA_MISSION_MAP_LAYOUT,
      mainId: null,
      sideIds: [],
      normalIds: ['normal:1-2', 'normal:1-4'],
    });
    expect(a).toEqual(b);
  });
});

describe('CampaignMissionMapPresentation', () => {
  it('Stendra renderiza stage com pins por tipo em %', () => {
    const board = boardFixture();
    expect(resolveInitialPendingMissionId(board)).toBe('main:1-1');
    const html = renderMissionLocalesMap(board, 'main:1-1');
    expect(html).toContain('data-mission-map="stendra"');
    expect(html).toContain('campaign-mission-stage');
    expect(html).toContain('data-mission-id="main:1-1"');
    expect(html).toContain('campaign-mission-pin--main');
    expect(html).toContain('campaign-mission-pin--side');
    expect(html).toContain('campaign-mission-pin--normal');
    expect(html).toContain(`left:${STENDRA_MISSION_MAP_LAYOUT.mainSlot.x}%`);
    expect(html).toContain('data-mission-id="normal:1-2"');
    expect(html).toContain('campaign-mission-popover');
    expect(html).toContain('data-campaign-start-mission="main:1-1"');
    expect(html).toContain('campaign-mission-board--has-popover');
    expect(html).not.toContain('campaign-mission-node--map');
    expect(html).not.toContain('campaign-path-act-track');
  });

  it('sem seleção não renderiza popover de missão', () => {
    const board = boardFixture();
    const html = renderMissionLocalesMap(board, null);
    expect(html).toContain('campaign-mission-pin--main');
    expect(html).not.toContain('campaign-mission-popover');
    expect(html).not.toContain('data-campaign-start-mission');
  });

  it('preview no pin mostra tipo, estrelas, CTA e tooltip de stats do inimigo', () => {
    const board = boardFixture();
    board.main!.featuredEnemies = [
      {
        id: 'preview-goblin',
        name: 'Goblin Saqueador',
        enemyType: 'goblin_raider',
        role: 'trash',
        level: 1,
        attributes: { str: 5, dex: 5, int: 1 },
        health: 40,
        maxHealth: 40,
        attack: 8,
        defense: 3,
        attackSpeed: 1,
        castSpeed: 1,
        goldReward: 5,
        xpReward: 2,
        signatureSkills: [],
        combatIntent: null,
        combatSkills: [],
        actionTimeRatio: 0,
        actionTimeRemaining: 0,
        actionTimeTotal: 1,
        statusEffects: [],
        combatResists: { fire: 0, cold: 0, lightning: 0, air: 0 },
        passiveIds: [],
        combatStatSheet: [
          {
            id: 'offense',
            title: 'Ofensiva',
            lines: [{ id: 'attack', label: 'Ataque', value: '8', tooltipLines: [] }],
          },
        ],
      },
    ];
    board.main!.featuredEnemyTypes = ['goblin_raider'];

    const html = renderMissionLocalesMap(board, 'main:1-1');
    expect(html).toContain(kindLabel('main'));
    expect(html).toContain('data-campaign-start-mission="main:1-1"');
    expect(html).toContain('data-enemy-tooltip');
    expect(html).toContain('enemy-tooltip-content');
    expect(html).toContain('Goblin Saqueador');
    expect(html).toContain('enemy-tooltip-chip');
    expect(html).toContain('ui/stats/attack.png');
    expect(html).not.toContain('Ofensiva');
  });

  it('preview no pin mostra tipo, estrelas e CTA de missão', () => {
    const board = boardFixture();
    const html = renderMissionLocalesMap(board, 'normal:1-2');
    expect(html).toContain(kindLabel('normal'));
    expect(html).toContain('1★');
    expect(html).toContain('data-campaign-start-mission="normal:1-2"');
    expect(findMissionOnBoard(board, 'normal:1-2')?.stars).toBe(1);
  });
});
