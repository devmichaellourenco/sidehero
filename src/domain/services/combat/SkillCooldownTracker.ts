import { Enemy } from '../../entities/Enemy';
import { Hero } from '../../entities/Hero';
import { CombatSkillDefinition } from '../../progression/combat/CombatSkillDefinition';
import { listEnemyCombatSkills } from '../../progression/combat/EnemyCombatSkillCatalog';
import { listHeroCombatSkills } from '../../progression/combat/HeroCombatSkillCatalog';

export type SkillCooldownMap = Record<string, Record<string, number>>;

export class SkillCooldownTracker {
  constructor(private readonly cooldowns: SkillCooldownMap) {}

  static createInitial(heroes: Hero[], enemies: Enemy[]): SkillCooldownMap {
    const cooldowns: SkillCooldownMap = {};

    for (const hero of heroes) {
      const key = combatantKey('hero', hero.id);
      cooldowns[key] = {};
      for (const skill of listHeroCombatSkills(hero)) {
        if (skill.initialCooldown > 0) {
          cooldowns[key][skill.skillId] = skill.initialCooldown;
        }
      }
    }

    for (const enemy of enemies) {
      const key = combatantKey('enemy', enemy.id);
      cooldowns[key] = {};
      for (const skill of listEnemyCombatSkills(enemy)) {
        if (skill.initialCooldown > 0) {
          cooldowns[key][skill.skillId] = skill.initialCooldown;
        }
      }
    }

    return cooldowns;
  }

  static fromMap(cooldowns: SkillCooldownMap | undefined): SkillCooldownTracker {
    return new SkillCooldownTracker(cooldowns ?? {});
  }

  isReady(key: string, skillId: string): boolean {
    return (this.cooldowns[key]?.[skillId] ?? 0) <= 0;
  }

  toMap(): SkillCooldownMap {
    return structuredClone(this.cooldowns);
  }

  onTurnEnd(
    key: string,
    usedSkillId: string | null,
    skills: CombatSkillDefinition[],
  ): SkillCooldownTracker {
    const next = structuredClone(this.cooldowns);
    next[key] ??= {};

    for (const skillId of Object.keys(next[key])) {
      next[key][skillId] = Math.max(0, next[key][skillId] - 1);
    }

    if (usedSkillId) {
      const usedSkill = skills.find((skill) => skill.skillId === usedSkillId);
      if (usedSkill && usedSkill.cooldownTurns > 0) {
        next[key][usedSkillId] = usedSkill.cooldownTurns;
      }
    }

    return new SkillCooldownTracker(next);
  }
}

export function combatantKey(side: 'hero' | 'enemy', id: string): string {
  return `${side}:${id}`;
}
