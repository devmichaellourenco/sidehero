import { IGameStateRepository } from '../../domain/repositories/IGameStateRepository';
import { SkillService } from '../../domain/progression/SkillService';
import { GameStatePresenter } from '../presenters/GameStatePresenter';
import { GameStateDto } from '../dto/GameStateDto';

export class ActivateSkillUseCase {
  constructor(
    private readonly repository: IGameStateRepository,
    private readonly presenter: GameStatePresenter,
    private readonly skillService: SkillService,
  ) {}

  async execute(heroId: string, skillId: string): Promise<GameStateDto> {
    const state = await this.repository.load();
    const hero = state.heroes.find((entry) => entry.id === heroId);

    if (!hero) {
      throw new Error('Herói não encontrado');
    }

    const cost = this.skillService.getActivationCost(hero, skillId);
    if (!state.gold.canAfford(cost)) {
      throw new Error('Ouro insuficiente para ativar skill');
    }

    const updatedHero = this.skillService.activate(hero, skillId);
    const heroes = state.heroes.map((entry) => (entry.id === heroId ? updatedHero : entry));
    const nextState = state
      .withHeroes(heroes)
      .withGold(state.gold.spend(cost))
      .addLog(`Skill ativada (-${cost} ouro)`);

    await this.repository.save(nextState);
    return this.presenter.present(nextState);
  }
}
