import { describe, expect, it } from 'vitest';
import { CampaignOverviewDto } from '../../application/dto/CampaignDto';
import {
  resolveInitialPendingPhaseId,
} from './CampaignMapPresentation';
import { CampaignModalRenderer, resolveInitialMapId } from './CampaignModalRenderer';

function phase(
  id: string,
  options: Partial<{
    unlocked: boolean;
    cleared: boolean;
    selected: boolean;
    playable: boolean;
    displayName: string;
  }> = {},
) {
  const phaseNumber = Number.parseInt(id.split('-')[1] ?? '1', 10);
  return {
    id,
    displayName: options.displayName ?? id,
    waveCount: 4,
    difficultyTier: 1,
    unlocked: options.unlocked ?? false,
    cleared: options.cleared ?? false,
    selected: options.selected ?? false,
    playable: options.playable ?? false,
    milestoneBoss: id.endsWith('-50'),
    seasonFinale: id === '10-50',
    actNumber: Math.min(5, Math.max(1, Math.ceil(phaseNumber / 10))),
    featuredEnemyTypes: ['goblin_raider'],
  };
}

function buildOverview(): CampaignOverviewDto {
  return {
    id: 'apprentice',
    name: 'Campanha do Aprendiz',
    maps: [
      {
        id: 'stendra',
        name: 'Estrenda',
        unlocked: true,
        phases: [
          phase('1-1', { unlocked: true, playable: true, cleared: true }),
          phase('1-50', {
            displayName: 'Guardião das Esgotos',
            unlocked: true,
            playable: true,
            selected: true,
          }),
        ],
      },
      {
        id: 'gondonor',
        name: 'Gondonor',
        unlocked: false,
        phases: [phase('2-1')],
      },
    ],
  };
}

describe('CampaignModalRenderer', () => {
  const renderer = new CampaignModalRenderer();

  it('resolveInitialMapId prioriza mapa desbloqueado da fase selecionada', () => {
    expect(resolveInitialMapId(buildOverview())).toBe('stendra');
  });

  it('resolveInitialPendingPhaseId prioriza fase selecionada jogável', () => {
    const map = buildOverview().maps[0];
    expect(resolveInitialPendingPhaseId(map)).toBe('1-50');
  });

  it('renderiza trilha, preview e abas bloqueadas', () => {
    const overview = buildOverview();
    const pendingId = resolveInitialPendingPhaseId(overview.maps[0]);
    const html = renderer.render(overview, 'stendra', pendingId);

    expect(html).toContain('campaign-hero-banner');
    expect(html).toContain('campaign-path');
    expect(html).toContain('campaign-phase-preview');
    expect(html).toContain('data-campaign-start-phase="1-50"');
    expect(html).toContain('campaign-map-tabs');
    expect(html).toContain('data-campaign-map-tab="gondonor"');
    expect(html).toContain('disabled');
    expect(html).toContain('campaign-map-tab--locked');
    expect(html).toContain('Guardião das Esgotos');
    expect(html).toContain('campaign-path-node--pending');
    expect(html).not.toContain('data-phase-id="2-1"');
  });

  it('mostra mensagem de mapa bloqueado no painel', () => {
    const overview = buildOverview();
    const lockedMap = overview.maps[1];
    const html = renderer.renderMapPanel(lockedMap, null);

    expect(html).toContain('campaign-map-locked');
    expect(html).toContain('Gondonor');
    expect(html).toContain('Guardião Elemental');
  });
});
