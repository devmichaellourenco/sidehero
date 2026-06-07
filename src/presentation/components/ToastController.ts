export type ToastType = 'chest' | 'level' | 'victory' | 'loot' | 'info';

const TOAST_DURATION_MS = 4200;
const MAX_VISIBLE_TOASTS = 4;

export class ToastController {
  constructor(private readonly root: HTMLElement) {}

  show(message: string, type: ToastType = 'info'): void {
    while (this.root.children.length >= MAX_VISIBLE_TOASTS) {
      this.root.firstElementChild?.remove();
    }

    const toast = document.createElement('div');
    toast.className = `game-toast game-toast-${type}`;
    toast.textContent = message;
    this.root.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.add('visible');
    });

    window.setTimeout(() => {
      toast.classList.remove('visible');
      window.setTimeout(() => toast.remove(), 280);
    }, TOAST_DURATION_MS);
  }
}
