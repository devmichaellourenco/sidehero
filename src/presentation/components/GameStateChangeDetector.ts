import { GameStateDto } from '../../application/dto/GameStateDto';
import { ToastController } from './ToastController';

export interface StateChangeHandlers {
  onChestAvailable?: () => void;
}

export class GameStateChangeDetector {
  constructor(private readonly toasts: ToastController) {}

  detect(
    previous: GameStateDto | null,
    next: GameStateDto,
    handlers: StateChangeHandlers = {},
  ): void {
    if (!previous) return;

    if (next.pendingChestCount > previous.pendingChestCount) {
      const count = next.pendingChestCount - previous.pendingChestCount;
      const label = count === 1 ? 'Baú disponível!' : `${count} baús disponíveis!`;
      this.toasts.show(label, 'chest', {
        hint: 'Clique para abrir',
        onClick: handlers.onChestAvailable,
      });
    }

    if (next.stage > previous.stage) {
      this.toasts.show(`Boss derrotado! Tier ${next.stage}`, 'victory');
    }

    const clearedNow = next.campaignProgress.clearedPhaseIds.filter(
      (phaseId) => !previous.campaignProgress.clearedPhaseIds.includes(phaseId),
    );
    if (!previous.seasonCompleted && next.seasonCompleted) {
      this.toasts.show('🏆 Temporada concluída!', 'victory', {
        hint: 'Inicie um novo jogo quando quiser',
        durationMs: 12000,
      });
    } else if (clearedNow.length > 0) {
      const phase = clearedNow[clearedNow.length - 1];
      this.toasts.show(`Fase ${phase} concluída!`, 'victory');
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

  showIdleSummary(message: string): void {
    this.toasts.show(message, 'idle', { durationMs: 6500 });
  }
}
