/**
 * Orquestra overlays exclusivos do painel: só um ativo por vez.
 * Prioridade (maior → menor): tutorial → cena → resultado de batalha → Wow.
 * Pedidos concorrentes entram na fila e sobem quando o ativo libera.
 */

export type UiOverlayKind = 'onboarding' | 'act_scene' | 'battle_result' | 'wow';

export const UI_OVERLAY_PRIORITY: Record<UiOverlayKind, number> = {
  onboarding: 400,
  act_scene: 300,
  battle_result: 200,
  wow: 100,
};

export type UiOverlayRequestId = string;

type QueuedOverlay = {
  kind: UiOverlayKind;
  id: UiOverlayRequestId;
  present: () => void;
};

export class UiOverlayOrchestrator {
  private active: QueuedOverlay | null = null;
  private readonly queue: QueuedOverlay[] = [];
  private readonly idleListeners: Array<() => void> = [];

  getActiveKind(): UiOverlayKind | null {
    return this.active?.kind ?? null;
  }

  getActiveId(): UiOverlayRequestId | null {
    return this.active?.id ?? null;
  }

  isBusy(): boolean {
    return this.active !== null;
  }

  /** True se este kind pode iniciar agora (nada ativo, ou já é o ativo). */
  canPresent(kind: UiOverlayKind): boolean {
    if (!this.active) return true;
    return this.active.kind === kind;
  }

  /**
   * Pede foco para apresentar o overlay.
   * Se livre, chama `present` na hora. Senão enfileira (substitui pedido com o mesmo id).
   */
  request(kind: UiOverlayKind, id: UiOverlayRequestId, present: () => void): void {
    if (this.active?.id === id) {
      return;
    }

    const entry: QueuedOverlay = { kind, id, present };
    const queuedIndex = this.queue.findIndex((item) => item.id === id);
    if (queuedIndex >= 0) {
      this.queue[queuedIndex] = entry;
      return;
    }

    if (!this.active) {
      this.active = entry;
      present();
      return;
    }

    this.queue.push(entry);
    this.sortQueue();
  }

  /** Libera o overlay ativo (ou remove da fila se ainda não subiu). */
  release(kind: UiOverlayKind, id?: UiOverlayRequestId): void {
    if (this.active && this.active.kind === kind && (id == null || this.active.id === id)) {
      this.active = null;
      this.pump();
      this.notifyIdleIfReady();
      return;
    }

    const index = this.queue.findIndex(
      (item) => item.kind === kind && (id == null || item.id === id),
    );
    if (index >= 0) {
      this.queue.splice(index, 1);
    }
  }

  /** Remove todos os pedidos (fila + ativo) de um kind. */
  cancelKind(kind: UiOverlayKind): void {
    for (let i = this.queue.length - 1; i >= 0; i -= 1) {
      if (this.queue[i]?.kind === kind) {
        this.queue.splice(i, 1);
      }
    }
    if (this.active?.kind === kind) {
      this.active = null;
      this.pump();
      this.notifyIdleIfReady();
    }
  }

  onIdle(listener: () => void): void {
    this.idleListeners.push(listener);
  }

  /** Reordena a fila e tenta apresentar o próximo se estiver livre. */
  pump(): void {
    if (this.active) return;
    this.sortQueue();
    const next = this.queue.shift();
    if (!next) return;
    this.active = next;
    next.present();
  }

  private sortQueue(): void {
    this.queue.sort((left, right) => {
      const byPriority = UI_OVERLAY_PRIORITY[right.kind] - UI_OVERLAY_PRIORITY[left.kind];
      if (byPriority !== 0) return byPriority;
      return 0;
    });
  }

  private notifyIdleIfReady(): void {
    if (this.active || this.queue.length > 0) return;
    for (const listener of this.idleListeners) {
      listener();
    }
  }
}
