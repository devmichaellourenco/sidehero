import { CombatProfile } from '../../combat/CombatProfile';
import { DamageRollOptions } from './CombatDamageResolver';

export interface CombatActionContext {
  attackerProfile: CombatProfile;
  stageLevel: number;
  rng?: DamageRollOptions['rng'];
}
