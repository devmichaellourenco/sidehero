import { Experience } from '../value-objects/Experience';
import { Gear, GearSlot } from './Gear';

export type HeroClass = 'knight' | 'sorcerer' | 'priest';

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

  private constructor(props: HeroProps) {
    this.id = props.id;
    this.name = props.name;
    this.heroClass = props.heroClass;
    this.baseAttack = props.baseAttack;
    this.baseDefense = props.baseDefense;
    this.baseMaxHealth = props.baseMaxHealth;
    this.experience = props.experience;
    this.equipment = { ...(props.equipment ?? {}) };
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
    });
  }

  static restore(props: HeroProps): Hero {
    return new Hero(props);
  }

  get emoji(): string {
    return HERO_EMOJI[this.heroClass];
  }

  get level(): number {
    return this.experience.level;
  }

  get attack(): number {
    const gearBonus = this.sumGear((g) => g.attackBonus);
    const levelBonus = (this.level - 1) * 2;
    return this.baseAttack + gearBonus + levelBonus;
  }

  get defense(): number {
    const gearBonus = this.sumGear((g) => g.defenseBonus);
    const levelBonus = (this.level - 1) * 2;
    return this.baseDefense + gearBonus + levelBonus;
  }

  get maxHealth(): number {
    const gearBonus = this.sumGear((g) => g.healthBonus);
    const levelBonus = (this.level - 1) * 10;
    return this.baseMaxHealth + gearBonus + levelBonus;
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
      });
    }

    return hero;
  }

  takeDamage(rawDamage: number): Hero {
    const mitigated = Math.max(1, rawDamage - this.defense);
    return new Hero({
      ...this.toProps(),
      currentHealth: Math.max(0, this.currentHealth - mitigated),
    });
  }

  healFull(): Hero {
    return new Hero({ ...this.toProps(), currentHealth: this.maxHealth });
  }

  equip(gear: Gear): Hero {
    const updated = new Hero({
      ...this.toProps(),
      equipment: { ...this.equipment, [gear.slot]: gear },
    });
    return new Hero({ ...updated.toProps(), currentHealth: updated.maxHealth });
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
    };
  }

  private sumGear(selector: (gear: Gear) => number): number {
    return Object.values(this.equipment ?? {}).reduce((sum, gear) => {
      if (!gear) return sum;
      return sum + selector(gear);
    }, 0);
  }
}
