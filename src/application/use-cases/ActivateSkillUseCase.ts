import { assertLoadoutEditable } from '../policies/assertLoadoutEditable';
import { getUnlockedBattleSkillSlotCount } from '../../domain/progression/SkillBattleSlots';
import { IGameStateRepository } from '../../domain/repositories/IGameStateRepository';
import { ISkillService } from '../../domain/progression/ISkillService';
import { GameStatePresenter } from '../presenters/GameStatePresenter';
import { GameStateDto } from '../dto/GameStateDto';

export class ActivateSkillUseCase {
  constructor(
    private readonly repository: IGameStateRepository,
    private readonly presenter: GameStatePresenter,
    private readonly skillService: ISkillService,
  ) {}

  async execute(heroId: string, skillId: string): Promise<GameStateDto> {
    const state = await this.repository.load();
    assertLoadoutEditable(state);
    const hero = state.heroes.find((entry) => entry.id === heroId);

    if (!hero) {
      throw new Error('Herói não encontrado');
    }

    const cost = this.skillService.getActivationCost(hero, skillId);
    if (!state.gold.canAfford(cost)) {
      throw new Error('Ouro insuficiente para ativar skill');
    }

    const unlockedSlots = getUnlockedBattleSkillSlotCount(state.upgradeLevels);
    const updatedHero = this.skillService.activate(hero, skillId, unlockedSlots);
    const heroes = state.heroes.map((entry) => (entry.id === heroId ? updatedHero : entry));
    const nextState = state
      .withHeroes(heroes)
      .withGold(state.gold.spend(cost))
      .addLog(`Skill ativada (-${cost} ouro)`);

    await this.repository.save(nextState);
    return this.presenter.present(nextState);
  }
}
