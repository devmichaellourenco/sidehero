import { PhaseCombatHandlers } from '../../domain/campaign/PhaseCombatHandlers';
import { PhaseRun } from '../../domain/campaign/PhaseRun';
import { ICombatService } from '../../domain/services/ICombatService';
import { IGameStateRepository } from '../../domain/repositories/IGameStateRepository';
import { GameStatePresenter } from '../presenters/GameStatePresenter';
import { CombatFloatingEventDto } from '../dto/CombatFloatingEventDto';
import { GameStateDto } from '../dto/GameStateDto';

export interface TickGameResult {
  state: GameStateDto;
  combatFloats: CombatFloatingEventDto[];
}

export class TickGameUseCase {
  private readonly phaseHandlers = new PhaseCombatHandlers();

  constructor(
    private readonly repository: IGameStateRepository,
    private readonly combatService: ICombatService,
    private readonly presenter: GameStatePresenter,
  ) {}

  async execute(
    ticks = 1,
    options: { restartCurrentPhase?: boolean } = {},
  ): Promise<TickGameResult> {
    let state = await this.repository.load();
    const combatFloats: CombatFloatingEventDto[] = [];

    if (options.restartCurrentPhase) {
      if (!state.loadoutEditOpen || !state.phaseRestartOnResume) {
        throw new Error('Não há pausa ativa para reiniciar a fase');
      }

      const restarted = state.phaseRun
        ? this.phaseHandlers.restartPhaseFromPause(state, state.phaseRun)
        : this.phaseHandlers.startSelectedPhaseFromPause(state);

      if (!restarted.state.phaseRun) {
        throw new Error('Não foi possível iniciar a fase selecionada');
      }

      const nextState = restarted.state
        .withLoadoutEditOpen(false)
        .withPhaseRestartOnResume(false);

      await this.repository.save(nextState);
      return {
        state: this.presenter.present(nextState),
        combatFloats: [],
      };
    }

    for (let i = 0; i < ticks; i++) {
      const result = this.combatService.executeTick(state);
      state = result.state;
      combatFloats.push(...result.floatingEvents);
    }

    await this.repository.save(state);
    return {
      state: this.presenter.present(state),
      combatFloats,
    };
  }
}
