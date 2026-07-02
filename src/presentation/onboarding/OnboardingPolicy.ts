import { GameStateDto } from '../../application/dto/GameStateDto';

export type OnboardingStepId =
  | 'first-chest'
  | 'pause-loadout'
  | 'hero-points'
  | 'first-upgrade';

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
];

const STEPS: Record<OnboardingStepId, Omit<OnboardingStep, 'id'>> = {
  'first-chest': {
    title: 'Seu primeiro baú',
    message:
      'Derrotar inimigos enche a barra de baús. Toque no ícone do baú para abrir e ganhar equipamento.',
    anchorSelector: '#open-chest-btn',
  },
  'pause-loadout': {
    title: 'Acampamento',
    message:
      'Use Acampamento para editar equipe, inventário e skills com calma. A fase reinicia ao partir.',
    anchorSelector: '#pause-loadout-btn',
  },
  'hero-points': {
    title: 'Pontos de herói',
    message:
      'Um herói tem pontos para gastar. Toque em Heróis, abra o card e vá em Progressão para distribuir atributos.',
    anchorSelector: '#open-heroes-btn',
  },
  'first-upgrade': {
    title: 'Melhorias do acampamento',
    message:
      'Há uma melhoria disponível com o ouro acumulado. Toque na estrela ★ para abrir a árvore.',
    anchorSelector: '#open-upgrades-btn',
  },
};

export function isOnboardingStepTriggered(stepId: OnboardingStepId, state: GameStateDto): boolean {
  switch (stepId) {
    case 'first-chest':
      return state.pendingChestCount > 0;
    case 'pause-loadout':
      return Boolean(state.phaseRun) || !state.canEditParty;
    case 'hero-points':
      return state.heroes.some((hero) => hero.hasUnspentPoints);
    case 'first-upgrade':
      return state.purchasableUpgradeCount > 0;
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
