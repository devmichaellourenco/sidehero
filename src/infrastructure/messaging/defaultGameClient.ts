import { IGameClient } from '../../application/ports/IGameClient';
import { ChromeGameClient } from './ChromeGameClient';

let client: IGameClient | null = null;

export function getDefaultGameClient(): IGameClient {
  if (!client) {
    client = new ChromeGameClient();
  }
  return client;
}

export function setDefaultGameClient(next: IGameClient): void {
  client = next;
}
