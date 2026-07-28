import { ASSETS, getAssetUrl } from '../assets/AssetCatalog';
import type { SystemsMenuId } from '../flows/SystemsMenuNavigation';

/** `undock` = no painel (Desafixar); `dock` = janela solta (Fixar). */
export type SurfacePinMode = 'dock' | 'undock';

export function surfacePinIconUrl(mode: SurfacePinMode): string {
  return getAssetUrl(mode === 'dock' ? ASSETS.ui.pin : ASSETS.ui.unpin);
}

export function surfacePinTooltip(mode: SurfacePinMode): string {
  return mode === 'dock' ? 'Fixar' : 'Desafixar';
}

export function surfacePinAriaLabel(mode: SurfacePinMode, surfaceLabel: string): string {
  return mode === 'dock'
    ? `Fixar ${surfaceLabel} no painel lateral`
    : `Desafixar ${surfaceLabel} para janela`;
}

export function applySurfacePinButton(
  button: HTMLButtonElement,
  mode: SurfacePinMode,
  surfaceLabel: string,
): void {
  const pressed = mode === 'undock';
  button.classList.remove('hidden');
  button.hidden = false;
  button.setAttribute('aria-pressed', pressed ? 'true' : 'false');
  button.title = surfacePinTooltip(mode);
  button.setAttribute('aria-label', surfacePinAriaLabel(mode, surfaceLabel));

  const icon = button.querySelector<HTMLImageElement>('.stats-pin-btn__icon');
  if (icon) {
    icon.src = surfacePinIconUrl(mode);
  }
}

export function hideSurfacePinButton(button: HTMLButtonElement | null): void {
  if (!button) return;
  button.classList.add('hidden');
  button.hidden = true;
}

const SURFACE_LABELS: Record<SystemsMenuId, string> = {
  heroes: 'Heróis',
  formation: 'Formação',
  log: 'Log',
  stats: 'Estatísticas',
  campaign: 'Campanha',
  shop: 'Loja',
  inventory: 'Inventário',
  stash: 'Baú',
  forge: 'Forja',
  upgrades: 'Runas',
  achievements: 'Conquistas',
  settings: 'Configurações',
};

export function systemsMenuLabel(id: SystemsMenuId): string {
  return SURFACE_LABELS[id];
}
