import { getCooldownSeconds } from '../../combat/SkillCooldownTiming';
import { resolveCombatSkillName } from '../../progression/combat/CombatSkillNaming';
import { CombatSkillDefinition } from '../../progression/combat/CombatSkillDefinition';
import { listEnemyCombatSkills } from '../../progression/combat/EnemyCombatSkillCatalog';
import { listHeroCombatSkills } from '../../progression/combat/HeroCombatSkillCatalog';
import { Hero } from '../../entities/Hero';
import { Enemy } from '../../entities/Enemy';
import { CombatSkillBarEntry, CombatSkillHighlight } from './CombatSkillBar';
import { CombatSkillSelector } from './CombatSkillSelector';
import { CombatStatusEffectTracker } from './CombatStatusEffectTracker';
import { PendingSkillAction } from './PendingSkillAction';
import { SkillCooldownTracker, combatantKey } from './SkillCooldownTracker';

export class CombatSkillBarResolver {
  constructor(private readonly selector = new CombatSkillSelector()) {}

  resolveForHero(
    hero: Hero,
    party: Hero[],
    enemies: Enemy[],
    cooldowns: SkillCooldownTracker,
    options: {
      isActiveTurn: boolean;
      pendingActions: PendingSkillAction[];
      combatTime: number;
    },
    statusEffects: CombatStatusEffectTracker = CombatStatusEffectTracker.fromMap({}),
  ): CombatSkillBarEntry[] {
    if (!hero.isAlive()) return [];

    const key = combatantKey('hero', hero.id);
    const skills = listHeroCombatSkills(hero);
    const highlights = this.resolveHighlights(
      hero,
      null,
      key,
      hero.id,
      'hero',
      skills,
      party,
      enemies,
      cooldowns,
      options,
      statusEffects,
    );

    return this.mapSkills(key, skills, cooldowns, highlights);
  }

  resolveForEnemy(
    enemy: Enemy,
    party: Hero[],
    enemies: Enemy[],
    cooldowns: SkillCooldownTracker,
    options: {
      isActiveTurn: boolean;
      pendingActions: PendingSkillAction[];
      combatTime: number;
    },
  ): CombatSkillBarEntry[] {
    if (!enemy.isAlive()) return [];

    const key = combatantKey('enemy', enemy.id);
    const skills = listEnemyCombatSkills(enemy);
    const highlights = this.resolveHighlights(
      null,
      enemy,
      key,
      enemy.id,
      'enemy',
      skills,
      party,
      enemies,
      cooldowns,
      options,
    );

    return this.mapSkills(key, skills, cooldowns, highlights);
  }

  private resolveHighlights(
    hero: Hero | null,
    enemy: Enemy | null,
    key: string,
    combatantId: string,
    side: 'hero' | 'enemy',
    skills: CombatSkillDefinition[],
    party: Hero[],
    enemies: Enemy[],
    cooldowns: SkillCooldownTracker,
    options: {
      isActiveTurn: boolean;
      pendingActions: PendingSkillAction[];
      combatTime: number;
    },
    statusEffects: CombatStatusEffectTracker = CombatStatusEffectTracker.fromMap({}),
  ): Map<string, CombatSkillHighlight> {
    const highlights = new Map<string, CombatSkillHighlight>();

    const pendingForActor = options.pendingActions
      .filter((entry) => entry.side === side && entry.combatantId === combatantId)
      .sort((left, right) => left.executeAt - right.executeAt);

    if (pendingForActor.length > 0) {
      highlights.set(pendingForActor[0].skillId, 'next');
      if (pendingForActor.length > 1) {
        highlights.set(pendingForActor[1].skillId, 'queued');
      }
      return highlights;
    }

    if (!options.isActiveTurn) {
      return highlights;
    }

    const readyActions =
      side === 'hero' && hero
        ? this.selector.selectAllReadyHeroActions(hero, party, enemies, cooldowns, statusEffects)
        : enemy
          ? this.selector.selectAllReadyEnemyActions(enemy, party, enemies, cooldowns)
          : [];

    if (readyActions[0]) highlights.set(readyActions[0].skillId, 'next');
    if (readyActions[1]) highlights.set(readyActions[1].skillId, 'queued');

    return highlights;
  }

  private mapSkills(
    key: string,
    skills: CombatSkillDefinition[],
    cooldowns: SkillCooldownTracker,
    highlights: Map<string, CombatSkillHighlight>,
  ): CombatSkillBarEntry[] {
    return skills.map((skill) => {
      const secondsRemaining = cooldowns.getRemaining(key, skill.skillId);
      const baseCooldown = getCooldownSeconds(skill);
      const cooldownTotal = Math.max(baseCooldown, secondsRemaining, 0);
      const ready = secondsRemaining <= 0 || baseCooldown <= 0;

      return {
        skillId: skill.skillId,
        skillName: resolveCombatSkillName(skill),
        secondsRemaining,
        cooldownTotal,
        ready,
        highlight: highlights.get(skill.skillId) ?? 'none',
      };
    });
  }
}
