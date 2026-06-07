import { GameApplication } from '../../application/GameApplication';
import { ChromeStorageGameRepository } from '../storage/ChromeStorageGameRepository';

let appInstance: GameApplication | null = null;

export function createGameApplication(): GameApplication {
  if (!appInstance) {
    const repository = new ChromeStorageGameRepository();
    appInstance = new GameApplication(repository);
  }
  return appInstance;
}
