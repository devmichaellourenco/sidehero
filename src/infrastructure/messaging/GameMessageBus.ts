import { GameStateDto, GearDto } from '../../application/dto/GameStateDto';
import { isExtensionContextValid, isContextInvalidatedError } from './ExtensionContext';

export type GameMessage =
  | { type: 'GET_STATE' }
  | { type: 'TICK'; ticks?: number }
  | { type: 'OPEN_CHEST'; chestId: string }
  | { type: 'OPEN_ALL_CHESTS' }
  | { type: 'EQUIP_GEAR'; heroId: string; gearId: string }
  | { type: 'EQUIP_BEST_LOADOUT'; gearIds?: string[] }
  | { type: 'UNEQUIP_GEAR'; heroId: string; slot: string };

export type GameResponse =
  | { ok: true; state: GameStateDto; openedGear?: GearDto; openedGears?: GearDto[]; equippedCount?: number }
  | { ok: false; error: string };

export async function sendGameMessage(message: GameMessage): Promise<GameResponse> {
  if (!isExtensionContextValid()) {
    return { ok: false, error: 'Extension context invalidated' };
  }

  try {
    const response = (await chrome.runtime.sendMessage(message)) as GameResponse | undefined;
    return response ?? { ok: false, error: 'Sem resposta do service worker' };
  } catch (error) {
    if (isContextInvalidatedError(error)) {
      return { ok: false, error: 'Extension context invalidated' };
    }

    const errorMessage = error instanceof Error ? error.message : 'Erro ao comunicar com a extensão';
    return { ok: false, error: errorMessage };
  }
}
