import { ClassAscensionService } from '../../domain/progression/ClassAscensionService';
import { getAscensionById } from '../../domain/progression/ClassAscensionCatalog';
import { SkillService } from '../../domain/progression/SkillService';
import { IGameStateRepository } from '../../domain/repositories/IGameStateRepository';
import { mapAscensionOptions } from '../mappers/AscensionMapper';
import { mapSkillTree } from '../mappers/HeroProgressionMapper';
import { GameStatePresenter } from '../presenters/GameStatePresenter';
import { AscensionOptionDto } from '../dto/AscensionOptionDto';
import { GameStateDto } from '../dto/GameStateDto';
import { SkillNodeDto } from '../dto/SkillNodeDto';

export interface GetHeroAscensionTreeResult {
  state: GameStateDto;
  options: AscensionOptionDto[];
  ascensionName: string | null;
  ascensionSkillNodes: SkillNodeDto[];
}

export class GetHeroAscensionTreeUseCase {
  constructor(
    private readonly repository: IGameStateRepository,
    private readonly presenter: GameStatePresenter,
    private readonly ascensionService: ClassAscensionService,
    private readonly skillService: SkillService,
  ) {}

  async execute(heroId: string): Promise<GetHeroAscensionTreeResult> {
    const state = await this.repository.load();
    const hero = state.heroes.find((entry) => entry.id === heroId);

    if (!hero) {
      throw new Error('Herói não encontrado');
    }

    const props = hero.toProps();
    const ascension = props.ascensionId ? getAscensionById(props.ascensionId) : null;

    return {
      state: this.presenter.present(state),
      options: mapAscensionOptions(this.ascensionService.listOptions(hero)),
      ascensionName: ascension?.name ?? null,
      ascensionSkillNodes: mapSkillTree(this.skillService.buildAscensionTree(hero)),
    };
  }
}
