import { IGameStateRepository } from '../../domain/repositories/IGameStateRepository';
import { mapGameStateToDto, GameStateDto } from '../dto/GameStateDto';

export class EquipGearUseCase {
  constructor(private readonly repository: IGameStateRepository) {}

  async execute(heroId: string, gearId: string): Promise<GameStateDto> {
    const state = await this.repository.load();
    const gear = state.inventory.find((g) => g.id === gearId);

    if (!gear) {
      throw new Error('Item não encontrado no inventário');
    }

    const heroes = state.heroes.map((hero) => {
      if (hero.id !== heroId) return hero;
      return hero.equip(gear);
    });

    const inventory = state.inventory.filter((g) => g.id !== gearId);
    const nextState = state
      .withHeroes(heroes)
      .withInventory(inventory)
      .addLog(`${gear.name} equipado!`);

    await this.repository.save(nextState);
    return mapGameStateToDto(nextState);
  }
}
