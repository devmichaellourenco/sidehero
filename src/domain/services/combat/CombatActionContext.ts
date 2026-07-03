import { CombatProfile } from '../../combat/CombatProfile';
import { ElementalDamageProfile } from '../../combat/ElementalDamageProfile';
import { ElementalDamageFlatProfile } from '../../combat/ElementalDamageFlatProfile';
import { DamageRollOptions } from './CombatDamageResolver';

export interface CombatActionContext {
  attackerProfile: CombatProfile;
  stageLevel: number;
  attackerElementalBonus?: ElementalDamageProfile;
  attackerElementalFlat?: ElementalDamageFlatProfile;
  attackerPhysicalDamagePercent?: number;
  rng?: DamageRollOptions['rng'];
}
