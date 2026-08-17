/**
 * Varredor de win rate por mapa — roda o simulador headless em cada fase com a
 * party de referência no nível projetado de chegada e classifica o resultado
 * contra a faixa-alvo de flow (Core: 60–85%).
 *
 * Transforma a auditoria de dificuldade (BAL-019 e mapas futuros) em relatório
 * automático: em vez de simular fase a fase à mão, aponta direto os outliers.
 */
import { Experience } from '../value-objects/Experience';
import { listPhasesForMap } from '../campaign/CampaignCatalog';
import type { MapId } from '../campaign/CampaignIds';
import { simulateEncounterBatch, type SimPartyMember } from './CombatEncounterSimulator';
import { effectivePhaseXpTotal } from './PhaseXpBudget';
import type { SimReferenceProfile } from './SimReferenceProfiles';

export interface WinRateBand {
  /** Piso da faixa-alvo (Core = 0.60). Abaixo disso a fase é muito difícil. */
  min: number;
  /** Teto da faixa-alvo (Core = 0.85). Acima disso a fase é fácil demais. */
  max: number;
}

export const DEFAULT_WIN_RATE_BAND: WinRateBand = { min: 0.6, max: 0.85 };

export type WinRateVerdict = 'too_hard' | 'in_band' | 'too_easy';

export interface PhaseSweepRow {
  phaseId: string;
  displayName: string;
  difficultyTier: number;
  waveCount: number;
  /** Nível projetado de chegada (XP acumulado até a fase anterior). */
  partyLevel: number;
  winRate: number;
  wipeRate: number;
  timeoutRate: number;
  avgCombatTime: number;
  avgHpPercent: number;
  verdict: WinRateVerdict;
}

export interface MapSweepSummary {
  mapId: MapId;
  profile: SimReferenceProfile;
  runsPerPhase: number;
  band: WinRateBand;
  phases: PhaseSweepRow[];
  tooHard: number;
  inBand: number;
  tooEasy: number;
  /** Fases fora da faixa, para ação direta. */
  outliers: PhaseSweepRow[];
}

export interface SweepOptions {
  /** Classes da party de referência (o nível vem da projeção). Default: knight+sorcerer+priest. */
  partyClasses?: string[];
  profile?: SimReferenceProfile;
  runsPerPhase?: number;
  band?: WinRateBand;
  seed?: number;
  /** Nível mínimo de chegada — evita testar 1-1 com herói nível 1 puro. */
  minLevel?: number;
}

const DEFAULT_PARTY_CLASSES = ['knight', 'sorcerer', 'priest'];

function classifyWinRate(winRate: number, band: WinRateBand): WinRateVerdict {
  if (winRate < band.min) return 'too_hard';
  if (winRate > band.max) return 'too_easy';
  return 'in_band';
}

function levelFromCumulativeXp(cumulativeXp: number, minLevel: number): number {
  const level = Experience.initial().gain(cumulativeXp).experience.level;
  return Math.max(minLevel, level);
}

/**
 * Varre um mapa e devolve win rate por fase + classificação.
 *
 * O nível testado em cada fase é o que o jogador teria ao **chegar** nela (XP
 * acumulado das fases anteriores), então o veredito reflete a experiência real de
 * quem progride linearmente — não um nível arbitrário.
 */
export function sweepMapWinRate(mapId: MapId, options: SweepOptions = {}): MapSweepSummary {
  const partyClasses = options.partyClasses?.length ? options.partyClasses : DEFAULT_PARTY_CLASSES;
  const profile: SimReferenceProfile = options.profile ?? 'geared';
  const runsPerPhase = Math.max(1, Math.floor(options.runsPerPhase ?? 10));
  const band = options.band ?? DEFAULT_WIN_RATE_BAND;
  const minLevel = Math.max(1, Math.floor(options.minLevel ?? 2));

  const phases = listPhasesForMap(mapId);
  const rows: PhaseSweepRow[] = [];
  let cumulativeXp = 0;

  for (const phase of phases) {
    const partyLevel = levelFromCumulativeXp(cumulativeXp, minLevel);
    const party: SimPartyMember[] = partyClasses.map((heroClass) => ({ heroClass, level: partyLevel }));

    const batch = simulateEncounterBatch(
      { party, profile, phaseId: phase.id, seed: options.seed ?? 1 },
      runsPerPhase,
    );

    rows.push({
      phaseId: phase.id,
      displayName: phase.displayName,
      difficultyTier: phase.difficultyTier,
      waveCount: phase.waves.length,
      partyLevel,
      winRate: batch.winRate,
      wipeRate: batch.wipeRate,
      timeoutRate: batch.timeoutRate,
      avgCombatTime: batch.avgCombatTime,
      avgHpPercent: batch.avgHpPercent,
      verdict: classifyWinRate(batch.winRate, band),
    });

    cumulativeXp += effectivePhaseXpTotal(phase.id);
  }

  const outliers = rows.filter((row) => row.verdict !== 'in_band');

  return {
    mapId,
    profile,
    runsPerPhase,
    band,
    phases: rows,
    tooHard: rows.filter((row) => row.verdict === 'too_hard').length,
    inBand: rows.filter((row) => row.verdict === 'in_band').length,
    tooEasy: rows.filter((row) => row.verdict === 'too_easy').length,
    outliers,
  };
}
