import { PhaseId } from './CampaignIds';
import { CampaignProgress } from './CampaignProgress';
import { CAMPAIGN_REPLAY_XP_MULTIPLIER } from '../balance/CampaignXpScaling';

export const REPLAY_GOLD_MULTIPLIER = 0.5;
export const REPLAY_XP_MULTIPLIER = CAMPAIGN_REPLAY_XP_MULTIPLIER;

export function isPhaseReplay(progress: CampaignProgress, phaseId: PhaseId): boolean {
  return progress.isCleared(phaseId);
}

/** Baús só na primeira conclusão. */
export function grantsPhaseChests(progress: CampaignProgress, phaseId: PhaseId): boolean {
  return !isPhaseReplay(progress, phaseId);
}

/** @deprecated Use grantsPhaseChests */
export function grantsPhaseLoot(progress: CampaignProgress, phaseId: PhaseId): boolean {
  return grantsPhaseChests(progress, phaseId);
}

export function phaseGoldMultiplier(progress: CampaignProgress, phaseId: PhaseId): number {
  return isPhaseReplay(progress, phaseId) ? REPLAY_GOLD_MULTIPLIER : 1;
}

export function phaseXpMultiplier(progress: CampaignProgress, phaseId: PhaseId): number {
  return isPhaseReplay(progress, phaseId) ? REPLAY_XP_MULTIPLIER : 1;
}

export function scalePhaseGold(
  baseGold: number,
  progress: CampaignProgress,
  phaseId: PhaseId,
): number {
  return Math.floor(baseGold * phaseGoldMultiplier(progress, phaseId));
}

export function scalePhaseXp(
  baseXp: number,
  progress: CampaignProgress,
  phaseId: PhaseId,
): number {
  return Math.floor(baseXp * phaseXpMultiplier(progress, phaseId));
}
