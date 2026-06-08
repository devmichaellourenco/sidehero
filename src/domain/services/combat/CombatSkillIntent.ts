export interface CombatSkillIntent {
  nextSkillName: string;
  nextSkillId: string;
  status: 'ready' | 'cooldown';
  turnsRemaining: number;
  chargingSkills: Array<{ skillId: string; skillName: string; turnsRemaining: number }>;
}
