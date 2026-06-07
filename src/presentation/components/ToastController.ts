export type ToastType = 'chest' | 'level' | 'victory' | 'loot' | 'info' | 'idle';

export interface ToastOptions {
  onClick?: () => void;
  hint?: string;
  durationMs?: number;
}

const TOAST_DURATION_MS = 4200;
const IDLE_TOAST_DURATION_MS = 6500;
const MAX_VISIBLE_TOASTS = 4;

export class ToastController {
  constructor(private readonly root: HTMLElement) {}

  show(message: string, type: ToastType = 'info', options: ToastOptions = {}): void {
    while (this.root.children.length >= MAX_VISIBLE_TOASTS) {
      this.root.firstElementChild?.remove();
    }

    const toast = document.createElement('div');
    const clickable = Boolean(options.onClick);
    toast.className = `game-toast game-toast-${type}${clickable ? ' game-toast-clickable' : ''}`;

    const messageEl = document.createElement('span');
    messageEl.className = 'game-toast-message';
    messageEl.textContent = message;
    toast.appendChild(messageEl);

    if (options.hint) {
      const hintEl = document.createElement('span');
      hintEl.className = 'game-toast-hint';
      hintEl.textContent = options.hint;
      toast.appendChild(hintEl);
    }

    if (clickable && options.onClick) {
      toast.addEventListener('click', () => {
        options.onClick?.();
        toast.classList.remove('visible');
        window.setTimeout(() => toast.remove(), 280);
      });
    }

    this.root.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.add('visible');
    });

    const duration = options.durationMs ?? (type === 'idle' ? IDLE_TOAST_DURATION_MS : TOAST_DURATION_MS);

    if (!clickable) {
      window.setTimeout(() => {
        toast.classList.remove('visible');
        window.setTimeout(() => toast.remove(), 280);
      }, duration);
    } else {
      window.setTimeout(() => {
        if (!toast.isConnected) return;
        toast.classList.remove('visible');
        window.setTimeout(() => toast.remove(), 280);
      }, duration);
    }
  }
}
