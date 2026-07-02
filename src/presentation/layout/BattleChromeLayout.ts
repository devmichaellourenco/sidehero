const PANEL_SHEET_TOP_VAR = '--panel-sheet-top';

export function formatPanelSheetTop(boundaryTop: number): string {
  return `${Math.max(0, Math.ceil(boundaryTop))}px`;
}

/** Sincroniza o topo da área de painéis com o limite da zona de batalha visível. */
export function syncBattleChromeLayout(boundaryEl: HTMLElement): void {
  document.documentElement.style.setProperty(
    PANEL_SHEET_TOP_VAR,
    formatPanelSheetTop(boundaryEl.getBoundingClientRect().top),
  );
}

/** Observa mudanças de layout e mantém `--panel-sheet-top` alinhado ao botão de acampamento. */
export function bindBattleChromeLayout(
  boundaryEl: HTMLElement,
  layoutRoot?: HTMLElement | null,
): () => void {
  const sync = () => syncBattleChromeLayout(boundaryEl);

  sync();

  const observer = new ResizeObserver(sync);
  observer.observe(boundaryEl);
  if (layoutRoot) {
    observer.observe(layoutRoot);
  }

  window.addEventListener('resize', sync);

  return () => {
    observer.disconnect();
    window.removeEventListener('resize', sync);
  };
}
