import { IGameClient } from '../../application/ports/IGameClient';
import { GameMessage, GameResponse } from '../../application/ports/GameClientTypes';
import { isExtensionContextValid, isContextInvalidatedError } from './ExtensionContext';

export class ChromeGameClient implements IGameClient {
  isContextValid(): boolean {
    return isExtensionContextValid();
  }

  async send(message: GameMessage): Promise<GameResponse> {
    if (!this.isContextValid()) {
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
}
