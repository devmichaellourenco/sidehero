import { describe, expect, it } from 'vitest';
import { parseMissionBattleStartRequest } from './MissionBattleStartRelay';

describe('MissionBattleStartRelay', () => {
  it('parseia pedido válido', () => {
    expect(parseMissionBattleStartRequest({ at: 42 })).toEqual({ at: 42 });
  });

  it('rejeita payload inválido', () => {
    expect(parseMissionBattleStartRequest(null)).toBeNull();
    expect(parseMissionBattleStartRequest({})).toBeNull();
    expect(parseMissionBattleStartRequest({ at: 'now' })).toBeNull();
  });
});
