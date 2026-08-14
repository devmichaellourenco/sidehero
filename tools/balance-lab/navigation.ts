export const OPEN_HERO_IN_SIMULATOR_EVENT = 'balance-lab:open-hero-in-simulator';

export function openHeroInSimulator(heroClass: string): void {
  window.dispatchEvent(
    new CustomEvent<{ heroClass: string }>(OPEN_HERO_IN_SIMULATOR_EVENT, {
      detail: { heroClass },
    }),
  );
}

