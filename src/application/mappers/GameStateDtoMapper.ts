import { GameState } from '../../domain/entities/GameState';
import { UpgradeService } from '../../domain/upgrades/UpgradeService';
import { GameStateDto, mapGameStateToDto } from '../dto/GameStateDto';

export function mapPersistedGameState(
  state: GameState,
  upgradeService: UpgradeService,
): GameStateDto {
  return mapGameStateToDto(state, {
    purchasableUpgradeCount: upgradeService.countAvailable(state),
  });
}
