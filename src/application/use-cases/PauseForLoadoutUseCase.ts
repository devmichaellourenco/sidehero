import { IGameStateRepository } from '../../domain/repositories/IGameStateRepository';
import { GameStatePresenter } from '../presenters/GameStatePresenter';
import { GameStateDto } from '../dto/GameStateDto';

export class PauseForLoadoutUseCase {
  constructor(
    private readonly repository: IGameStateRepository,
    private readonly presenter: GameStatePresenter,
  ) {}

  async execute(): Promise<GameStateDto> {
    const state = await this.repository.load();

    if (state.loadoutEditOpen) {
      return this.presenter.present(state);
    }

    if (!state.phaseRun) {
      throw new Error('Não há fase em andamento para pausar');
    }

    if (state.campaignProgress.seasonCompleted) {
      throw new Error('Temporada concluída — inicie um novo jogo');
    }

    const nextState = state
      .withCombat(null)
      .withLoadoutEditOpen(true)
      .withPhaseRestartOnResume(true)
      .addLog('⏸ Pausa para ajustes — a fase reiniciará ao continuar');

    await this.repository.save(nextState);
    return this.presenter.present(nextState);
  }
}
