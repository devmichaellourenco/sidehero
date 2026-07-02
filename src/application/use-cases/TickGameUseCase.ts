import { PhaseCombatHandlers } from '../../domain/campaign/PhaseCombatHandlers';
import { PhaseRun } from '../../domain/campaign/PhaseRun';
import { MetaBonusScope } from '../../domain/meta/MetaBonusScope';
import { MetaService } from '../../domain/meta/MetaService';
import { ICombatService } from '../../domain/services/ICombatService';
import { IGameStateRepository } from '../../domain/repositories/IGameStateRepository';
import { IMetaProgressRepository } from '../../domain/repositories/IMetaProgressRepository';
import { GameStatePresenter } from '../presenters/GameStatePresenter';
import { mapMetaSummary } from '../mappers/MetaMapper';
import { CombatFloatingEventDto } from '../dto/CombatFloatingEventDto';
import { GameStateDto } from '../dto/GameStateDto';

export interface TickGameResult {
  state: GameStateDto;
  combatFloats: CombatFloatingEventDto[];
  sigilsAwarded: number;
}

export class TickGameUseCase {
  private readonly phaseHandlers = new PhaseCombatHandlers();

  constructor(
    private readonly repository: IGameStateRepository,
    private readonly metaRepository: IMetaProgressRepository,
    private readonly metaService: MetaService,
    private readonly combatService: ICombatService,
    private readonly presenter: GameStatePresenter,
  ) {}

  async execute(
    ticks = 1,
    options: { restartCurrentPhase?: boolean } = {},
  ): Promise<TickGameResult> {
    let state = await this.repository.load();
    const wasSeasonCompleted = state.campaignProgress.seasonCompleted;
    const combatFloats: CombatFloatingEventDto[] = [];

    if (options.restartCurrentPhase) {
      if (!state.loadoutEditOpen || !state.phaseRestartOnResume) {
        throw new Error('Não há missão pausada no acampamento');
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
      const meta = await this.metaRepository.load();

      return {
        state: {
          ...this.presenter.present(nextState),
          meta: mapMetaSummary(meta, this.metaService),
        },
        combatFloats: [],
        sigilsAwarded: 0,
      };
    }

    const metaBeforeTick = await this.metaRepository.load();
    MetaBonusScope.set(this.metaService.resolveBonuses(metaBeforeTick));

    try {
      for (let i = 0; i < ticks; i++) {
        const result = this.combatService.executeTick(state);
        state = result.state;
        combatFloats.push(...result.floatingEvents);
      }
    } finally {
      MetaBonusScope.clear();
    }

    let sigilsAwarded = 0;
    if (!wasSeasonCompleted && state.campaignProgress.seasonCompleted) {
      const awarded = this.metaService.awardSeasonCompletion(
        metaBeforeTick,
        state.campaignProgress.highestTierReached,
      );
      await this.metaRepository.save(awarded.progress);
      sigilsAwarded = awarded.sigilsAwarded;
    }

    await this.repository.save(state);
    const meta = await this.metaRepository.load();

    return {
      state: {
        ...this.presenter.present(state),
        meta: mapMetaSummary(meta, this.metaService),
      },
      combatFloats,
      sigilsAwarded,
    };
  }
}
