import { GameStateDto } from '../../application/dto/GameStateDto';
import { ASSETS, getAssetUrl } from '../assets/AssetCatalog';

export type OnboardingStepId =
  | 'first-chest'
  | 'pause-loadout'
  | 'hero-points'
  | 'first-upgrade'
  | 'open-campaign';

export interface OnboardingStep {
  id: OnboardingStepId;
  title: string;
  message: string;
  anchorSelector: string;
}

export const ONBOARDING_STEP_ORDER: OnboardingStepId[] = [
  'first-chest',
  'pause-loadout',
  'hero-points',
  'first-upgrade',
  'open-campaign',
];

function runeInlineIcon(): string {
  return `<img class="onboarding-inline-icon" src="${getAssetUrl(ASSETS.ui.rune)}" alt="" aria-hidden="true" />`;
}

function chestInlineIcon(): string {
  return `<img class="onboarding-inline-icon" src="${getAssetUrl(ASSETS.ui.chest)}" alt="" aria-hidden="true" />`;
}

const STEPS: Record<OnboardingStepId, Omit<OnboardingStep, 'id'>> = {
  'first-chest': {
    title: 'Seu primeiro baú',
    message: `Derrotar inimigos enche a barra de baús. Toque no ícone ${chestInlineIcon()} Abrir baú para abrir e ganhar equipamento.`,
    anchorSelector: '#open-chest-btn',
  },
  'pause-loadout': {
    title: 'Acampamento',
    message:
      'Use Acampamento para editar equipe, inventário e skills com calma. A fase reinicia ao batalhar.',
    anchorSelector: '#pause-loadout-btn',
  },
  'hero-points': {
    title: 'Aprimoramento',
    message:
      'Você ganhou Aprimoramento ao subir de nível. Abra Heróis e gaste em Status (atributos) ou Skills (rank).',
    anchorSelector: '#open-heroes-btn',
  },
  'first-upgrade': {
    title: 'Runas do acampamento',
    message: `Há uma runa disponível com o ouro acumulado. Toque em ${runeInlineIcon()} Runas para abrir a árvore.`,
    anchorSelector: '#open-upgrades-btn',
  },
  'open-campaign': {
    title: 'Mapa da campanha',
    message:
      'Toque em Campanha para ver a trilha, escolher a próxima fase e acompanhar os atos da jornada.',
    anchorSelector: '#open-campaign-btn',
  },
};

export function isOnboardingStepTriggered(stepId: OnboardingStepId, state: GameStateDto): boolean {
  switch (stepId) {
    case 'first-chest':
      return state.pendingChestCount > 0;
    case 'pause-loadout':
      return Boolean(state.phaseRun) || !state.canEditParty;
    case 'hero-points':
      return (
        state.canEditParty && state.heroes.some((hero) => hero.hasUnspentPoints)
      );
    case 'first-upgrade':
      return state.purchasableUpgradeCount > 0;
    case 'open-campaign':
      return (state.campaignProgress?.clearedPhaseIds?.length ?? 0) > 0;
    default:
      return false;
  }
}

export function resolveOnboardingStep(
  state: GameStateDto,
  dismissed: ReadonlySet<OnboardingStepId>,
): OnboardingStep | null {
  for (const stepId of ONBOARDING_STEP_ORDER) {
    if (dismissed.has(stepId)) continue;
    if (!isOnboardingStepTriggered(stepId, state)) continue;

    const config = STEPS[stepId];
    return { id: stepId, ...config };
  }

  return null;
}

export function isOnboardingComplete(dismissed: ReadonlySet<OnboardingStepId>): boolean {
  return ONBOARDING_STEP_ORDER.every((stepId) => dismissed.has(stepId));
}
