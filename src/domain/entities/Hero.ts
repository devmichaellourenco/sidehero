import { Experience } from '../value-objects/Experience';
import { addAttributes, Attributes, AttributeKey, createAttributes } from '../progression/Attributes';
import { getBaseAttributes } from '../progression/BaseAttributes';
import { BASIC_ATTACK_SKILL_ID } from '../progression/combat/BasicAttackSkill';
import { MAX_ACTIVE_BATTLE_SKILLS } from '../progression/SkillBattleSlots';
import { AscensionId, SkillId } from '../progression/SkillId';
import { GearRequirementChecker } from '../services/GearRequirementChecker';
import { Gear, GearSlot } from './Gear';
import { HeroClass } from './HeroClass';

export type { HeroClass };

export interface HeroProps {
  id: string;
  name: string;
  heroClass: HeroClass;
  baseAttack: number;
  baseDefense: number;
  baseMaxHealth: number;
  currentHealth: number;
  experience: Experience;
  equipment: Partial<Record<GearSlot, Gear | null>>;
  allocatedAttributes: Attributes;
  unspentImprovementPoints: number;
  unspentAscensionPoints: number;
  skillRanks: Record<SkillId, number>;
  equippedSkillIds: SkillId[];
  ascensionId: AscensionId | null;
}

const BASE_STATS: Record<HeroClass, { attack: number; defense: number; health: number }> = {
  knight: { attack: 12, defense: 8, health: 120 },
  sorcerer: { attack: 18, defense: 3, health: 80 },
  priest: { attack: 8, defense: 5, health: 100 },
};

const HERO_EMOJI: Record<HeroClass, string> = {
  knight: '🛡️',
  sorcerer: '🔮',
  priest: '✨',
};

const STARTER_PROGRESSION = {
  allocatedAttributes: createAttributes(),
  unspentImprovementPoints: 0,
  unspentAscensionPoints: 0,
  skillRanks: { [BASIC_ATTACK_SKILL_ID]: 1 } as Record<SkillId, number>,
  equippedSkillIds: [BASIC_ATTACK_SKILL_ID] as SkillId[],
  ascensionId: null as AscensionId | null,
};

export class Hero {
  readonly id: string;
  readonly name: string;
  readonly heroClass: HeroClass;
  readonly baseAttack: number;
  readonly baseDefense: number;
  readonly baseMaxHealth: number;
  readonly currentHealth: number;
  private readonly experience: Experience;
  private readonly equipment: Partial<Record<GearSlot, Gear | null>>;
  private readonly allocatedAttributes: Attributes;
  private readonly unspentImprovementPoints: number;
  private readonly unspentAscensionPoints: number;
  private readonly skillRanks: Record<SkillId, number>;
  private readonly equippedSkillIds: SkillId[];
  private readonly ascensionId: AscensionId | null;

  private constructor(props: HeroProps) {
    this.id = props.id;
    this.name = props.name;
    this.heroClass = props.heroClass;
    this.baseAttack = props.baseAttack;
    this.baseDefense = props.baseDefense;
    this.baseMaxHealth = props.baseMaxHealth;
    this.experience = props.experience;
    this.equipment = { ...(props.equipment ?? {}) };
    this.allocatedAttributes = { ...props.allocatedAttributes };
    this.unspentImprovementPoints = Math.max(0, props.unspentImprovementPoints);
    this.unspentAscensionPoints = Math.max(0, props.unspentAscensionPoints);
    this.skillRanks = { ...props.skillRanks };
    this.equippedSkillIds = [...props.equippedSkillIds];
    this.ascensionId = props.ascensionId;
    this.currentHealth = Math.min(props.currentHealth, this.maxHealth);
  }

  static createStarter(id: string, heroClass: HeroClass, name: string): Hero {
    const base = BASE_STATS[heroClass];
    return new Hero({
      id,
      name,
      heroClass,
      baseAttack: base.attack,
      baseDefense: base.defense,
      baseMaxHealth: base.health,
      currentHealth: base.health,
      experience: Experience.initial(),
      equipment: {},
      ...STARTER_PROGRESSION,
    });
  }

  static restore(props: HeroProps): Hero {
    return new Hero({
      ...props,
      allocatedAttributes: props.allocatedAttributes ?? createAttributes(),
      unspentImprovementPoints: props.unspentImprovementPoints ?? 0,
      unspentAscensionPoints: props.unspentAscensionPoints ?? 0,
      skillRanks: props.skillRanks ?? {},
      equippedSkillIds: props.equippedSkillIds ?? [],
      ascensionId: props.ascensionId ?? null,
    });
  }

  get emoji(): string {
    return HERO_EMOJI[this.heroClass];
  }

  get level(): number {
    return this.experience.level;
  }

  get baseAttributes(): Attributes {
    return getBaseAttributes(this.heroClass);
  }

  get totalAttributes(): Attributes {
    return addAttributes(this.baseAttributes, this.allocatedAttributes);
  }

  get hasUnspentPoints(): boolean {
    return this.unspentImprovementPoints > 0 || this.unspentAscensionPoints > 0;
  }

  get attack(): number {
    const gearBonus = this.sumGear((g) => g.attackBonus);
    const levelBonus = (this.level - 1) * 2;
    const attrBonus = Math.floor(this.totalAttributes.str * 0.5 + this.totalAttributes.dex * 0.3);
    return this.baseAttack + gearBonus + levelBonus + attrBonus;
  }

  get defense(): number {
    const gearBonus = this.sumGear((g) => g.defenseBonus);
    const levelBonus = (this.level - 1) * 2;
    const attrBonus = Math.floor(this.totalAttributes.dex * 0.5 + this.totalAttributes.str * 0.2);
    return this.baseDefense + gearBonus + levelBonus + attrBonus;
  }

  get maxHealth(): number {
    const gearBonus = this.sumGear((g) => g.healthBonus);
    const levelBonus = (this.level - 1) * 10;
    const attrBonus = this.totalAttributes.str * 2;
    return this.baseMaxHealth + gearBonus + levelBonus + attrBonus;
  }

  isAlive(): boolean {
    return this.currentHealth > 0;
  }

  gainExperience(amount: number): Hero {
    const { experience, leveledUp } = this.experience.gain(amount);
    let hero = new Hero({ ...this.toProps(), experience });

    if (leveledUp) {
      hero = new Hero({
        ...hero.toProps(),
        baseAttack: hero.baseAttack + 2,
        baseDefense: hero.baseDefense + 2,
        baseMaxHealth: hero.baseMaxHealth + 10,
        currentHealth: hero.maxHealth,
        unspentImprovementPoints: hero.unspentImprovementPoints + 1,
      });
    }

    return hero;
  }

  spendImprovementPointOnAttribute(key: AttributeKey): Hero {
    if (this.unspentImprovementPoints < 1) {
      throw new Error('Sem pontos de aprimoramento disponíveis');
    }

    const allocated = { ...this.allocatedAttributes, [key]: this.allocatedAttributes[key] + 1 };

    return new Hero({
      ...this.toProps(),
      allocatedAttributes: allocated,
      unspentImprovementPoints: this.unspentImprovementPoints - 1,
    });
  }

  spendImprovementPointOnSkill(skillId: SkillId): Hero {
    if (this.unspentImprovementPoints < 1) {
      throw new Error('Sem pontos de aprimoramento disponíveis');
    }

    const currentRank = this.skillRanks[skillId] ?? 0;

    return new Hero({
      ...this.toProps(),
      skillRanks: { ...this.skillRanks, [skillId]: currentRank + 1 },
      unspentImprovementPoints: this.unspentImprovementPoints - 1,
    });
  }

  activateSkill(skillId: SkillId): Hero {
    if ((this.skillRanks[skillId] ?? 0) < 1) {
      throw new Error('Skill não desbloqueada');
    }
    if (this.equippedSkillIds.includes(skillId)) {
      return this;
    }
    if (this.equippedSkillIds.length >= MAX_ACTIVE_BATTLE_SKILLS) {
      throw new Error(`Limite de ${MAX_ACTIVE_BATTLE_SKILLS} skills ativas na batalha`);
    }

    return new Hero({
      ...this.toProps(),
      equippedSkillIds: [...this.equippedSkillIds, skillId],
    });
  }

  deactivateSkill(skillId: SkillId): Hero {
    if (skillId === BASIC_ATTACK_SKILL_ID) {
      throw new Error('Ataque Básico não pode ser desativado');
    }

    return new Hero({
      ...this.toProps(),
      equippedSkillIds: this.equippedSkillIds.filter((id) => id !== skillId),
    });
  }

  ascend(ascensionId: AscensionId, pointsGranted: number): Hero {
    if (this.ascensionId !== null) {
      throw new Error('Herói já ascendeu — ascensão é irreversível');
    }

    return new Hero({
      ...this.toProps(),
      ascensionId,
      unspentAscensionPoints: this.unspentAscensionPoints + pointsGranted,
    });
  }

  spendAscensionPointOnSkill(skillId: SkillId): Hero {
    if (this.unspentAscensionPoints < 1) {
      throw new Error('Sem pontos de ascensão disponíveis');
    }

    const currentRank = this.skillRanks[skillId] ?? 0;

    return new Hero({
      ...this.toProps(),
      skillRanks: { ...this.skillRanks, [skillId]: currentRank + 1 },
      unspentAscensionPoints: this.unspentAscensionPoints - 1,
    });
  }

  canEquip(gear: Gear): boolean {
    return new GearRequirementChecker().meets(this, gear);
  }

  takeDamage(rawDamage: number): Hero {
    const mitigated = Math.max(1, rawDamage - this.defense);
    return new Hero({
      ...this.toProps(),
      currentHealth: Math.max(0, this.currentHealth - mitigated),
    });
  }

  heal(amount: number): Hero {
    return new Hero({
      ...this.toProps(),
      currentHealth: Math.min(this.maxHealth, this.currentHealth + amount),
    });
  }

  healFull(): Hero {
    return new Hero({ ...this.toProps(), currentHealth: this.maxHealth });
  }

  equip(gear: Gear): Hero {
    if (!this.canEquip(gear)) {
      throw new Error('Requisitos de equipamento não atendidos');
    }

    const updated = new Hero({
      ...this.toProps(),
      equipment: { ...this.equipment, [gear.slot]: gear },
    });
    return new Hero({ ...updated.toProps(), currentHealth: updated.maxHealth });
  }

  unequip(slot: GearSlot): { hero: Hero; removed: Gear | null } {
    const removed = this.equipment[slot] ?? null;
    if (!removed) {
      return { hero: this, removed: null };
    }

    const updated = new Hero({
      ...this.toProps(),
      equipment: { ...this.equipment, [slot]: null },
    });

    return {
      hero: new Hero({
        ...updated.toProps(),
        currentHealth: Math.min(this.currentHealth, updated.maxHealth),
      }),
      removed,
    };
  }

  toProps(): HeroProps {
    return {
      id: this.id,
      name: this.name,
      heroClass: this.heroClass,
      baseAttack: this.baseAttack,
      baseDefense: this.baseDefense,
      baseMaxHealth: this.baseMaxHealth,
      currentHealth: this.currentHealth,
      experience: this.experience,
      equipment: this.equipment,
      allocatedAttributes: this.allocatedAttributes,
      unspentImprovementPoints: this.unspentImprovementPoints,
      unspentAscensionPoints: this.unspentAscensionPoints,
      skillRanks: this.skillRanks,
      equippedSkillIds: this.equippedSkillIds,
      ascensionId: this.ascensionId,
    };
  }

  private sumGear(selector: (gear: Gear) => number): number {
    return Object.values(this.equipment ?? {}).reduce((sum, gear) => {
      if (!gear) return sum;
      return sum + selector(gear);
    }, 0);
  }
}
