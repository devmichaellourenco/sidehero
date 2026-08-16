/**
 * Wrapper fino para o simulador de combate headless.
 * Compilado pelo esbuild para Node.js (combatSimCatalog.mjs) e usado pelo servidor.
 */
export {
  simulateEncounter,
  simulateEncounterBatch,
} from '../../src/domain/balance/CombatEncounterSimulator';

export type {
  SimRequest,
  SimPartyMember,
  SimAdHocSlot,
  SimOutcome,
  HeroSimResult,
  EncounterSimulationResult,
  BatchSimulationResult,
} from '../../src/domain/balance/CombatEncounterSimulator';
