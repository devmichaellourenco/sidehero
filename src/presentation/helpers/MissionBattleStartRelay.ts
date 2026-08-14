/** Pedido da campanha unpin para o side panel principal iniciar a batalha (START → tick). */
export const MISSION_BATTLE_START_REQUEST_KEY = 'sidehero_mission_battle_start_request';

export interface MissionBattleStartRequest {
  at: number;
}

export function parseMissionBattleStartRequest(value: unknown): MissionBattleStartRequest | null {
  if (!value || typeof value !== 'object') return null;
  const record = value as { at?: unknown };
  if (typeof record.at !== 'number') return null;
  return { at: record.at };
}

/** Campanha unpin → side panel principal exibe START e inicia o combate. */
export async function requestMissionBattleStartOnMainPanel(): Promise<void> {
  try {
    await chrome.storage.local.set({
      [MISSION_BATTLE_START_REQUEST_KEY]: {
        at: Date.now(),
      } satisfies MissionBattleStartRequest,
    });
  } catch {
    // storage indisponível
  }
}
