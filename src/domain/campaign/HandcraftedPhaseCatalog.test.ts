import { describe, expect, it } from 'vitest';
import { getSeasonFinalePhase, resolvePhase } from './CampaignCatalog';
import { buildPhaseId } from './CampaignIds';
import { HANDCRAFTED_PHASES } from './HandcraftedPhaseCatalog';
import { TOTAL_CAMPAIGN_PHASES } from './CampaignMaps';

describe('HandcraftedPhaseCatalog', () => {
  it('contém 500 fases handcrafted', () => {
    expect(HANDCRAFTED_PHASES.length).toBe(TOTAL_CAMPAIGN_PHASES);
    expect(HANDCRAFTED_PHASES.length).toBe(500);
  });

  it('marca boss de capítulo a cada 50 fases', () => {
    for (let mapIndex = 1; mapIndex <= 10; mapIndex++) {
      const phase = resolvePhase(buildPhaseId(mapIndex, 50));
      expect(phase?.milestoneBoss).toBe(true);
      expect(phase?.waves.at(-1)?.slots.some((slot) => slot.role === 'boss')).toBe(true);
    }
  });

  it('define finale da temporada em 4-50 sem desbloqueios no perfil base', () => {
    const finale = getSeasonFinalePhase();
    expect(finale?.id).toBe('4-50');
    expect(finale?.seasonFinale).toBe(true);
    expect(finale?.unlocks).toEqual([]);
    expect(finale?.difficultyTier).toBe(200);
  });

  it('não desbloqueia mapa DLC ao concluir Morthaven', () => {
    const morthavenFinale = resolvePhase('4-50');
    expect(morthavenFinale?.unlocks).toEqual([]);
    expect(resolvePhase('5-1')).not.toBeNull();
  });

  it('não usa gerador procedural no catálogo', () => {
    expect(resolvePhase('5-25')).not.toBeNull();
    expect(resolvePhase('99-99')).toBeNull();
  });
});
