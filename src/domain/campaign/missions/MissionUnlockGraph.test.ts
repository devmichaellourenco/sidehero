import { describe, expect, it } from 'vitest';
import { mainMissionId, sideMissionId } from './MissionId';
import {
  isSideMissionUnlocked,
  listEligibleSideMissionIds,
  sideMissionsUnlockedByCompleting,
} from './MissionUnlockGraph';

describe('MissionUnlockGraph', () => {
  const main1 = mainMissionId('1-1');
  const main5 = mainMissionId('1-5');
  const main10 = mainMissionId('1-10');
  const ash = sideMissionId('stendra_ash_trail');
  const cache = sideMissionId('stendra_hidden_cache');
  const patrol = sideMissionId('stendra_wayward_patrol');

  it('cadeia: 1-5 libera Trilha de Cinzas; Trilha libera Esconderijo', () => {
    expect(isSideMissionUnlocked(ash, [])).toBe(false);
    expect(isSideMissionUnlocked(ash, [main5])).toBe(true);
    expect(isSideMissionUnlocked(cache, [main5])).toBe(false);
    expect(isSideMissionUnlocked(cache, [main5, ash])).toBe(true);
  });

  it('paralela: Patrulha libera com 1-1 e expira ao concluir 1-5', () => {
    expect(isSideMissionUnlocked(patrol, [main1])).toBe(true);
    expect(isSideMissionUnlocked(patrol, [main1, main5])).toBe(false);
    const eligible = listEligibleSideMissionIds('stendra', [main1, main5]);
    expect(eligible).not.toContain(patrol);
    expect(eligible).toContain(ash);
    expect(eligible).not.toContain(cache);
  });

  it('sides liberadas por 1-5 expiram ao concluir 1-10', () => {
    expect(isSideMissionUnlocked(ash, [main1, main5])).toBe(true);
    expect(isSideMissionUnlocked(ash, [main1, main5, main10])).toBe(false);
    expect(isSideMissionUnlocked(cache, [main1, main5, ash, main10])).toBe(false);
  });

  it('não lista side já concluída', () => {
    expect(isSideMissionUnlocked(ash, [main5, ash])).toBe(false);
    expect(listEligibleSideMissionIds('stendra', [main1, main5, ash])).not.toContain(ash);
  });

  it('sideMissionsUnlockedByCompleting revela o próximo da cadeia', () => {
    expect(sideMissionsUnlockedByCompleting(main5, [main1])).toEqual([ash]);
    expect(sideMissionsUnlockedByCompleting(ash, [main1, main5])).toEqual([cache]);
  });
});
