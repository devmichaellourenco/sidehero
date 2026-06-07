import { GameStateDto } from '../../application/dto/GameStateDto';
import { ToastController } from './ToastController';

export class GameStateChangeDetector {
  constructor(private readonly toasts: ToastController) {}

  detect(previous: GameStateDto | null, next: GameStateDto): void {
    if (!previous) return;

    if (next.pendingChestCount > previous.pendingChestCount) {
      const count = next.pendingChestCount - previous.pendingChestCount;
      const label = count === 1 ? 'Baú disponível!' : `${count} baús disponíveis!`;
      this.toasts.show(label, 'chest');
    }

    if (next.stage > previous.stage) {
      this.toasts.show(`Vitória! Stage ${next.stage}`, 'victory');
    }

    for (const hero of next.heroes) {
      const oldHero = previous.heroes.find((entry) => entry.id === hero.id);
      if (oldHero && hero.level > oldHero.level) {
        this.toasts.show(`${hero.name} subiu para Lv.${hero.level}!`, 'level');
      }
    }
  }

  showLootReceived(gearName: string): void {
    this.toasts.show(`Loot: ${gearName}`, 'loot');
  }
}
