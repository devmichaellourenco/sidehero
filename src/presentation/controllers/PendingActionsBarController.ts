import { PendingActionItem, PendingActionKind } from '../policies/PendingActionsPolicy';

export class PendingActionsBarController {
  constructor(
    private readonly root: HTMLElement,
    private readonly onAction: (kind: PendingActionKind) => void,
  ) {
    this.root.addEventListener('click', (event) => {
      const button = (event.target as HTMLElement).closest('[data-pending-action]') as HTMLElement | null;
      if (!button) return;
      const kind = button.getAttribute('data-pending-action') as PendingActionKind | null;
      if (kind) this.onAction(kind);
    });
  }

  render(actions: PendingActionItem[]): void {
    if (actions.length === 0) {
      this.root.classList.add('hidden');
      this.root.innerHTML = '';
      return;
    }

    this.root.classList.remove('hidden');
    this.root.innerHTML = `
      <div class="pending-actions-inner">
        ${actions
          .map(
            (action) => `
              <button type="button" class="pending-action-chip" data-pending-action="${action.kind}">
                ${action.label}
              </button>
            `,
          )
          .join('')}
      </div>
    `;
  }
}
