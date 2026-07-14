import { describe, expect, it } from 'vitest';
import { EncounterResolver } from '../campaign/EncounterResolver';
import { buildPhaseId } from '../campaign/CampaignIds';
import { Experience } from '../value-objects/Experience';
import { expRequiredToAdvanceFromLevel } from '../progression/HeroLevelXpCatalog';
import {
  campaignHeroXpRequired,
  campaignKillXpScale,
  CAMPAIGN_REPLAY_XP_MULTIPLIER,
  earlyMapKillXpBoost,
  resolveCampaignKillXp,
} from './CampaignXpScaling';

describe('CampaignXpScaling', () => {
  it('desacopla XP de kill da curva de combate', () => {
    expect(campaignKillXpScale(1)).toBeGreaterThan(0);
    expect(campaignKillXpScale(50)).toBeLessThan(campaignKillXpScale(150));
    expect(resolveCampaignKillXp(2, 200, 1)).toBeGreaterThan(resolveCampaignKillXp(2, 16, 1));
  });

  it('aplica boost tutorial só nas primeiras fases de Stendra', () => {
    expect(earlyMapKillXpBoost(1)).toBeGreaterThan(earlyMapKillXpBoost(12));
    expect(earlyMapKillXpBoost(16)).toBe(1);
    expect(earlyMapKillXpBoost(50)).toBe(1);
  });

  it('usa curva piecewise para requisitos de nível', () => {
    expect(expRequiredToAdvanceFromLevel(1)).toBe(campaignHeroXpRequired(1));
    expect(expRequiredToAdvanceFromLevel(12)).toBe(campaignHeroXpRequired(12));
    expect(expRequiredToAdvanceFromLevel(13)).toBe(campaignHeroXpRequired(13));
    expect(campaignHeroXpRequired(13)).toBe(Math.floor(115 * Math.pow(1.27, 1)));
    expect(campaignHeroXpRequired(20)).toBeGreaterThan(campaignHeroXpRequired(13));
  });

  it('primeira run até 1-16 não passa do nível 6', () => {
    const resolver = new EncounterResolver();
    let xp = 0;

    for (let phase = 1; phase <= 16; phase += 1) {
      for (let waveIndex = 0; ; waveIndex += 1) {
        const encounter = resolver.resolve(buildPhaseId(1, phase), waveIndex);
        if (!encounter) break;
        for (const enemy of encounter.enemies) {
          xp += enemy.xpReward;
        }
      }
    }

    const level = Experience.initial().gain(xp).experience.level;
    expect(level).toBeGreaterThanOrEqual(4);
    expect(level).toBeLessThanOrEqual(6);
  });

  it('primeira clear de Stendra e replays levam ao nível 10–12', () => {
    const resolver = new EncounterResolver();
    const sumMap = (replay = false) => {
      let xp = 0;
      for (let phase = 1; phase <= 50; phase += 1) {
        for (let waveIndex = 0; ; waveIndex += 1) {
          const encounter = resolver.resolve(buildPhaseId(1, phase), waveIndex);
          if (!encounter) break;
          for (const enemy of encounter.enemies) {
            xp += replay
              ? Math.floor(enemy.xpReward * CAMPAIGN_REPLAY_XP_MULTIPLIER)
              : enemy.xpReward;
          }
        }
      }
      return xp;
    };

    const firstClear = sumMap();
    const replay = sumMap(true);
    const afterFarms = firstClear + replay * 3;
    const level = Experience.initial().gain(afterFarms).experience.level;

    expect(Experience.initial().gain(firstClear).experience.level).toBeLessThanOrEqual(10);
    expect(level).toBeGreaterThanOrEqual(10);
    expect(level).toBeLessThanOrEqual(13);
  });
});
