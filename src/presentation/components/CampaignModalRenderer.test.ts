import { describe, expect, it } from 'vitest';
import { CampaignOverviewDto } from '../../application/dto/CampaignDto';
import { CampaignModalRenderer, resolveInitialMapId } from './CampaignModalRenderer';

function buildOverview(): CampaignOverviewDto {
  return {
    id: 'apprentice',
    name: 'Campanha do Aprendiz',
    maps: [
      {
        id: 'stendra',
        name: 'Estrenda',
        phases: [
          {
            id: '1-1',
            displayName: 'Estrenda 1',
            waveCount: 2,
            difficultyTier: 1,
            unlocked: true,
            cleared: true,
            selected: false,
            playable: true,
            milestoneBoss: false,
            seasonFinale: false,
          },
          {
            id: '1-2',
            displayName: 'Estrenda 2',
            waveCount: 2,
            difficultyTier: 2,
            unlocked: true,
            cleared: false,
            selected: true,
            playable: true,
            milestoneBoss: false,
            seasonFinale: false,
          },
        ],
      },
      {
        id: 'gondonor',
        name: 'Gondonor',
        phases: [
          {
            id: '2-1',
            displayName: 'Gondonor 1',
            waveCount: 2,
            difficultyTier: 51,
            unlocked: false,
            cleared: false,
            selected: false,
            playable: false,
            milestoneBoss: false,
            seasonFinale: false,
          },
        ],
      },
    ],
  };
}

describe('CampaignModalRenderer', () => {
  const renderer = new CampaignModalRenderer();

  it('resolveInitialMapId prioriza mapa da fase selecionada', () => {
    expect(resolveInitialMapId(buildOverview())).toBe('stendra');
  });

  it('renderiza abas e painel de um mapa por vez', () => {
    const html = renderer.render(buildOverview(), 'stendra');

    expect(html).toContain('campaign-map-tabs');
    expect(html).toContain('data-campaign-map-tab="stendra"');
    expect(html).toContain('data-campaign-map-tab="gondonor"');
    expect(html).toContain('campaign-map-tab--active');
    expect(html).toContain('data-phase-id="1-2"');
    expect(html).not.toContain('data-phase-id="2-1"');
  });
});
