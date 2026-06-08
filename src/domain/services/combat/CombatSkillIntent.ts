export interface CombatSkillIntent {
  nextSkillName: string;
  nextSkillId: string;
  status: 'ready' | 'cooldown';
  turnsRemaining: number;
  chargingSkills: Array<{ skillName: string; turnsRemaining: number }>;
}
