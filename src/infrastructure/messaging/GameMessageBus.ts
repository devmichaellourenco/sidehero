import { GameStateDto } from '../../application/dto/GameStateDto';

export type GameMessage =
  | { type: 'GET_STATE' }
  | { type: 'TICK'; ticks?: number }
  | { type: 'OPEN_CHEST'; chestId: string }
  | { type: 'EQUIP_GEAR'; heroId: string; gearId: string };

export type GameResponse =
  | { ok: true; state: GameStateDto }
  | { ok: false; error: string };

export async function sendGameMessage(message: GameMessage): Promise<GameResponse> {
  return chrome.runtime.sendMessage(message);
}
