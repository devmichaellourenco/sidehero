import { HeroDto } from '../../../application/dto/GameStateDto';

export function renderHeroClassTab(hero: HeroDto): string {
  const ascension = hero.ascensionId ?? 'Nenhuma';

  return `
    <section class="hero-class-tab">
      <p class="hero-detail-hint">Especialização irreversível (em breve).</p>
      <div class="hero-class-status">
        <p><strong>Classe base:</strong> ${hero.heroClass}</p>
        <p><strong>Ascensão:</strong> ${ascension}</p>
        <p><strong>Pontos de ascensão:</strong> ${hero.unspentAscensionPoints}</p>
      </div>
      <p class="hero-detail-hint">Disponível a partir do level 10 com requisitos de atributos.</p>
    </section>
  `;
}
