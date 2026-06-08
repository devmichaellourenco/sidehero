import { IGameStateRepository } from '../../domain/repositories/IGameStateRepository';
import { SkillService } from '../../domain/progression/SkillService';
import { mapSkillTree } from '../mappers/HeroProgressionMapper';
import { GameStatePresenter } from '../presenters/GameStatePresenter';
import { GameStateDto } from '../dto/GameStateDto';
import { SkillNodeDto } from '../dto/SkillNodeDto';

export interface GetHeroSkillTreeResult {
  state: GameStateDto;
  nodes: SkillNodeDto[];
}

export class GetHeroSkillTreeUseCase {
  constructor(
    private readonly repository: IGameStateRepository,
    private readonly presenter: GameStatePresenter,
    private readonly skillService: SkillService,
  ) {}

  async execute(heroId: string): Promise<GetHeroSkillTreeResult> {
    const state = await this.repository.load();
    const hero = state.heroes.find((entry) => entry.id === heroId);

    if (!hero) {
      throw new Error('Herói não encontrado');
    }

    return {
      state: this.presenter.present(state),
      nodes: mapSkillTree(hero, this.skillService.buildTree(hero)),
    };
  }
}
