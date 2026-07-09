import { ChestType } from '../combat/ChestType';
import { lootPrimaryStatScale } from '../combat/DifficultyCombatScaling';
import { Gear, GearRarity, GearSlot } from '../entities/Gear';
import { ACTIVE_GEAR_SLOTS } from '../gear/GearSlotCatalog';
import {
  getGearTemplate,
  GearElementTheme,
  listGearTemplatesForSlot,
} from '../gear/GearTemplateCatalog';
import { formatUniqueGearName } from '../gear/UniqueGearCatalog';
import { GearRequirementChecker } from './GearRequirementChecker';
import { ILootService } from './ILootService';

const RARITY_MULTIPLIER: Record<GearRarity, number> = {
  common: 1,
  uncommon: 1.25,
  rare: 1.6,
  epic: 2.5,
  legendary: 3.5,
  mythic: 5,
};

const CHEST_RARITY_WEIGHTS: Record<ChestType, Record<GearRarity, number>> = {
  monster: {
    common: 0.55,
    uncommon: 0.25,
    rare: 0.14,
    epic: 0.05,
    legendary: 0.01,
    mythic: 0,
  },
  boss: {
    common: 0.2,
    uncommon: 0.28,
    rare: 0.3,
    epic: 0.15,
    legendary: 0.06,
    mythic: 0.01,
  },
  act_boss: {
    common: 0.05,
    uncommon: 0.1,
    rare: 0.25,
    epic: 0.35,
    legendary: 0.18,
    mythic: 0.07,
  },
};

const RARITY_ORDER: GearRarity[] = [
  'mythic',
  'legendary',
  'epic',
  'rare',
  'uncommon',
  'common',
];

export class LootService implements ILootService {
  generateGear(stage: number): Gear {
    return this.generateGearForChest('monster', stage);
  }

  generateGearForChest(chestType: ChestType, stage: number): Gear {
    const slot = ACTIVE_GEAR_SLOTS[Math.floor(Math.random() * ACTIVE_GEAR_SLOTS.length)];
    const rarity = this.rollRarityForChest(chestType, stage);
    return this.generateGearForSlot(stage, slot, rarity, chestType);
  }

  generateGearForSlot(stage: number, slot: GearSlot, rarity: GearRarity, chestType: ChestType = 'monster'): Gear {
    const multiplier = RARITY_MULTIPLIER[rarity];
    const templates = listGearTemplatesForSlot(slot);
    const template = templates[Math.floor(Math.random() * templates.length)];
    return this.createGear(
      stage,
      slot,
      rarity,
      multiplier,
      `${template.baseName} (${rarity})`,
      template.id,
      undefined,
      0,
      chestType,
    );
  }

  generateDeterministicGearForSlot(
    stage: number,
    slot: GearSlot,
    rarity: GearRarity,
    refreshSeed = 0,
  ): Gear {
    const multiplier = RARITY_MULTIPLIER[rarity];
    const templates = listGearTemplatesForSlot(slot);
    const slotSeed = slot === 'weapon' ? 1 : slot === 'armor' ? 2 : 3;
    const templateIndex = (stage * 3 + slotSeed + refreshSeed * 7) % templates.length;
    const template = templates[templateIndex];
    const statBump = refreshSeed % 3;

    return this.createGear(
      stage,
      slot,
      rarity,
      multiplier,
      `${template.baseName} (${rarity})`,
      template.id,
      `shop-gear-${stage}-${refreshSeed}-${slot}`,
      statBump,
      'monster',
    );
  }

  generateGearFromTemplate(
    templateId: string,
    stage: number,
    rarity: GearRarity,
    id?: string,
    statBump = 0,
  ): Gear {
    const template = getGearTemplate(templateId);
    if (!template) {
      throw new Error(`Template de equipamento inválido: ${templateId}`);
    }

    const multiplier = RARITY_MULTIPLIER[rarity];
    const gear = this.createGear(
      stage,
      template.slot,
      rarity,
      multiplier,
      formatUniqueGearName(template.id, rarity),
      template.id,
      id,
      statBump,
      'monster',
      templateId,
    );

    if (!template.fixedBonuses) {
      return gear;
    }

    return Gear.create({
      ...gear.toProps(),
      ...template.fixedBonuses,
      name: formatUniqueGearName(template.id, rarity),
    });
  }

  private createGear(
    stage: number,
    slot: GearSlot,
    rarity: GearRarity,
    multiplier: number,
    name: string,
    templateId: string,
    id?: string,
    statBump = 0,
    chestType: ChestType = 'monster',
    requirementTemplateId?: string,
  ): Gear {
    const base = Math.floor((2 + Math.floor(stage / 2) + statBump) * lootPrimaryStatScale(stage));
    const template = getGearTemplate(templateId);
    const secondary = this.rollSecondaryStats(slot, rarity, chestType);
    const elemental = template?.elementTheme
      ? this.rollThemedElementalBonuses(template.elementTheme, slot, rarity, chestType)
      : this.mergeElementalRolls(
          this.rollResistanceBonuses(slot, rarity, chestType),
          this.rollElementalDamageBonuses(slot, rarity, chestType),
        );
    const primaryPercents = this.rollPrimaryPercentBonuses(slot, rarity, chestType);
    const defensive = this.rollDefensiveBonuses(slot, rarity);

    return Gear.create({
      id: id ?? `gear-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name,
      templateId,
      slot,
      rarity,
      attackBonus: slot === 'weapon' ? Math.floor(base * multiplier) : Math.floor(base * 0.3),
      defenseBonus: slot === 'armor' ? Math.floor(base * multiplier) : Math.floor(base * 0.2),
      healthBonus: slot === 'accessory' ? Math.floor(base * multiplier * 3) : Math.floor(base),
      ...secondary,
      ...elemental,
      ...primaryPercents,
      ...defensive,
      requirements: requirementTemplateId
        ? GearRequirementChecker.inferRequirementsForTemplate(
            requirementTemplateId,
            stage,
            slot,
            rarity,
          )
        : GearRequirementChecker.inferRequirements(stage, slot, rarity),
    });
  }

  private rollResistanceBonuses(
    slot: GearSlot,
    rarity: GearRarity,
    chestType: ChestType,
  ): {
    fireResistBonus: number;
    coldResistBonus: number;
    lightningResistBonus: number;
    chaosResistBonus: number;
    allElementalResistBonus: number;
  } {
    const empty = {
      fireResistBonus: 0,
      coldResistBonus: 0,
      lightningResistBonus: 0,
      chaosResistBonus: 0,
      allElementalResistBonus: 0,
    };

    if (rarity === 'common') {
      return empty;
    }

    const qualityBoost = chestType === 'act_boss' ? 1.4 : chestType === 'boss' ? 1.15 : 1;
    const rarityCap =
      rarity === 'mythic'
        ? 22
        : rarity === 'legendary'
          ? 16
          : rarity === 'epic'
            ? 12
            : rarity === 'rare'
              ? 8
              : 5;
    const rollValue = () => Math.max(1, Math.floor(Math.random() * rarityCap * qualityBoost));

    if (slot === 'armor') {
      const elementRoll = Math.random();
      if (elementRoll < 0.34) return { ...empty, fireResistBonus: rollValue() };
      if (elementRoll < 0.67) return { ...empty, coldResistBonus: rollValue() };
      return { ...empty, lightningResistBonus: rollValue() };
    }

    if (slot === 'accessory') {
      if (Math.random() < 0.55) {
        return { ...empty, chaosResistBonus: rollValue() };
      }
      return { ...empty, allElementalResistBonus: Math.max(1, Math.floor(rollValue() * 0.6)) };
    }

    return empty;
  }

  private emptyElementalBonuses(): {
    fireResistBonus: number;
    coldResistBonus: number;
    lightningResistBonus: number;
    chaosResistBonus: number;
    allElementalResistBonus: number;
    fireResistFlat: number;
    coldResistFlat: number;
    lightningResistFlat: number;
    chaosResistFlat: number;
    fireDamageBonus: number;
    coldDamageBonus: number;
    lightningDamageBonus: number;
    chaosDamageBonus: number;
    allElementalDamageBonus: number;
    fireDamageFlat: number;
    coldDamageFlat: number;
    lightningDamageFlat: number;
    chaosDamageFlat: number;
  } {
    return {
      fireResistBonus: 0,
      coldResistBonus: 0,
      lightningResistBonus: 0,
      chaosResistBonus: 0,
      allElementalResistBonus: 0,
      fireResistFlat: 0,
      coldResistFlat: 0,
      lightningResistFlat: 0,
      chaosResistFlat: 0,
      fireDamageBonus: 0,
      coldDamageBonus: 0,
      lightningDamageBonus: 0,
      chaosDamageBonus: 0,
      allElementalDamageBonus: 0,
      fireDamageFlat: 0,
      coldDamageFlat: 0,
      lightningDamageFlat: 0,
      chaosDamageFlat: 0,
    };
  }

  private mergeElementalRolls(
    resistances: ReturnType<LootService['rollResistanceBonuses']>,
    damage: ReturnType<LootService['rollElementalDamageBonuses']>,
  ): ReturnType<LootService['emptyElementalBonuses']> {
    return { ...this.emptyElementalBonuses(), ...resistances, ...damage };
  }

  private rarityElementCap(rarity: GearRarity, chestType: ChestType): { damage: number; resist: number } {
    const qualityBoost = chestType === 'act_boss' ? 1.35 : chestType === 'boss' ? 1.12 : 1;
    const damageCap =
      rarity === 'mythic'
        ? 28
        : rarity === 'legendary'
          ? 20
          : rarity === 'epic'
            ? 14
            : rarity === 'rare'
              ? 9
              : rarity === 'uncommon'
                ? 5
                : 0;
    const resistCap =
      rarity === 'mythic'
        ? 24
        : rarity === 'legendary'
          ? 18
          : rarity === 'epic'
            ? 13
            : rarity === 'rare'
              ? 9
              : rarity === 'uncommon'
                ? 6
                : 0;

    return {
      damage: Math.max(0, Math.floor(damageCap * qualityBoost)),
      resist: Math.max(0, Math.floor(resistCap * qualityBoost)),
    };
  }

  private rollThemedElementalBonuses(
    theme: GearElementTheme,
    slot: GearSlot,
    rarity: GearRarity,
    chestType: ChestType,
  ): ReturnType<LootService['emptyElementalBonuses']> {
    const result = this.emptyElementalBonuses();
    const caps = this.rarityElementCap(rarity, chestType);
    if (caps.damage === 0 && caps.resist === 0) {
      return result;
    }

    const rollInRange = (cap: number) =>
      cap <= 0 ? 0 : Math.max(1, Math.floor(Math.random() * cap) + Math.floor(cap * 0.35));
    const applyThemeDamage = (percent: number, flat: number) => {
      if (theme === 'fire') {
        result.fireDamageBonus = percent;
        result.fireDamageFlat = flat;
      }
      if (theme === 'cold') {
        result.coldDamageBonus = percent;
        result.coldDamageFlat = flat;
      }
      if (theme === 'lightning') {
        result.lightningDamageBonus = percent;
        result.lightningDamageFlat = flat;
      }
      if (theme === 'chaos') {
        result.chaosDamageBonus = percent;
        result.chaosDamageFlat = flat;
      }
    };
    const applyThemeResist = (percent: number, flat: number) => {
      if (theme === 'fire') {
        result.fireResistBonus = percent;
        result.fireResistFlat = flat;
      }
      if (theme === 'cold') {
        result.coldResistBonus = percent;
        result.coldResistFlat = flat;
      }
      if (theme === 'lightning') {
        result.lightningResistBonus = percent;
        result.lightningResistFlat = flat;
      }
      if (theme === 'chaos') {
        result.chaosResistBonus = percent;
        result.chaosResistFlat = flat;
      }
    };

    if (slot === 'weapon') {
      const value = rollInRange(caps.damage);
      applyThemeDamage(value, Math.max(0, Math.floor(value * 0.45)));
      return result;
    }

    if (slot === 'armor') {
      const value = rollInRange(caps.resist);
      applyThemeResist(value, Math.max(0, Math.floor(value * 0.4)));
      return result;
    }

    const damageValue = rollInRange(Math.max(1, Math.floor(caps.damage * 0.55)));
    const resistValue = rollInRange(Math.max(1, Math.floor(caps.resist * 0.65)));
    applyThemeDamage(damageValue, Math.max(0, Math.floor(damageValue * 0.35)));
    applyThemeResist(resistValue, Math.max(0, Math.floor(resistValue * 0.35)));

    if (rarity === 'epic' || rarity === 'legendary' || rarity === 'mythic') {
      result.allElementalResistBonus = Math.max(1, Math.floor(resistValue * 0.35));
    }

    return result;
  }

  private rollElementalDamageBonuses(
    slot: GearSlot,
    rarity: GearRarity,
    chestType: ChestType,
  ): Pick<
    ReturnType<LootService['emptyElementalBonuses']>,
    | 'fireDamageBonus'
    | 'coldDamageBonus'
    | 'lightningDamageBonus'
    | 'chaosDamageBonus'
    | 'allElementalDamageBonus'
    | 'fireDamageFlat'
    | 'coldDamageFlat'
    | 'lightningDamageFlat'
    | 'chaosDamageFlat'
  > {
    const empty = {
      fireDamageBonus: 0,
      coldDamageBonus: 0,
      lightningDamageBonus: 0,
      chaosDamageBonus: 0,
      allElementalDamageBonus: 0,
      fireDamageFlat: 0,
      coldDamageFlat: 0,
      lightningDamageFlat: 0,
      chaosDamageFlat: 0,
    };

    if (slot !== 'weapon' && slot !== 'accessory') {
      return empty;
    }

    if (rarity === 'common') {
      return empty;
    }

    const caps = this.rarityElementCap(rarity, chestType);
    const chance = slot === 'weapon' ? 0.38 : 0.28;
    if (Math.random() >= chance || caps.damage === 0) {
      return empty;
    }

    const value = Math.max(1, Math.floor(Math.random() * caps.damage));
    const flat = Math.max(1, Math.floor(value * 0.35));
    const elementRoll = Math.random();
    if (elementRoll < 0.25) return { ...empty, fireDamageBonus: value, fireDamageFlat: flat };
    if (elementRoll < 0.5) return { ...empty, coldDamageBonus: value, coldDamageFlat: flat };
    if (elementRoll < 0.75) return { ...empty, lightningDamageBonus: value, lightningDamageFlat: flat };
    return { ...empty, chaosDamageBonus: value, chaosDamageFlat: flat };
  }

  private rollPrimaryPercentBonuses(
    slot: GearSlot,
    rarity: GearRarity,
    chestType: ChestType,
  ): {
    attackPercentBonus: number;
    defensePercentBonus: number;
    healthPercentBonus: number;
    physicalDamagePercentBonus: number;
  } {
    const empty = {
      attackPercentBonus: 0,
      defensePercentBonus: 0,
      healthPercentBonus: 0,
      physicalDamagePercentBonus: 0,
    };

    if (rarity === 'common') {
      return empty;
    }

    const qualityBoost = chestType === 'act_boss' ? 1.2 : chestType === 'boss' ? 1.08 : 1;
    const cap =
      rarity === 'mythic'
        ? 18
        : rarity === 'legendary'
          ? 14
          : rarity === 'epic'
            ? 10
            : rarity === 'rare'
              ? 7
              : 4;
    const rollPercent = () =>
      Math.max(1, Math.floor((Math.random() * cap + cap * 0.25) * qualityBoost));

    if (slot === 'weapon' && Math.random() < 0.32) {
      return { ...empty, attackPercentBonus: rollPercent(), physicalDamagePercentBonus: rollPercent() };
    }

    if (slot === 'armor' && Math.random() < 0.34) {
      return { ...empty, defensePercentBonus: rollPercent() };
    }

    if (slot === 'accessory' && Math.random() < 0.28) {
      return { ...empty, healthPercentBonus: rollPercent() };
    }

    return empty;
  }

  private rollDefensiveBonuses(
    slot: GearSlot,
    rarity: GearRarity,
  ): {
    dodgeChanceBonus: number;
    blockChanceBonus: number;
    damageReductionBonus: number;
  } {
    const empty = { dodgeChanceBonus: 0, blockChanceBonus: 0, damageReductionBonus: 0 };

    if (slot !== 'armor' || (rarity !== 'legendary' && rarity !== 'mythic')) {
      return empty;
    }

    const maxRoll = rarity === 'mythic' ? 0.08 : 0.06;
    const minRoll = rarity === 'mythic' ? 0.03 : 0.02;
    const rollValue = () =>
      Math.round((minRoll + Math.random() * (maxRoll - minRoll)) * 1000) / 1000;
    const pick = Math.random();

    if (pick < 0.34) return { ...empty, dodgeChanceBonus: rollValue() };
    if (pick < 0.67) return { ...empty, blockChanceBonus: rollValue() };
    return { ...empty, damageReductionBonus: rollValue() };
  }

  private rollSecondaryStats(
    slot: GearSlot,
    rarity: GearRarity,
    chestType: ChestType,
  ): {
    attackSpeedBonus: number;
    castSpeedBonus: number;
    critChanceBonus: number;
    critDamageBonus: number;
    cooldownReductionBonus: number;
  } {
    const qualityBoost = chestType === 'act_boss' ? 1.5 : chestType === 'boss' ? 1.2 : 1;
    const rarityBoost =
      rarity === 'mythic'
        ? 1.8
        : rarity === 'legendary'
          ? 1.5
          : rarity === 'epic'
            ? 1.4
            : rarity === 'rare'
              ? 1.1
              : rarity === 'uncommon'
                ? 1.05
                : 1;
    const boost = qualityBoost * rarityBoost;
    const empty = {
      attackSpeedBonus: 0,
      castSpeedBonus: 0,
      critChanceBonus: 0,
      critDamageBonus: 0,
      cooldownReductionBonus: 0,
    };
    const rollSignedSpeed = (maxPositive: number, maxNegative: number) => {
      const magnitude = Math.round((Math.random() * maxPositive * boost) * 100) / 100;
      if (Math.random() < 0.18) {
        return -Math.round(Math.random() * maxNegative * boost * 100) / 100;
      }
      return magnitude;
    };

    if (slot === 'weapon') {
      return {
        ...empty,
        attackSpeedBonus:
          Math.random() < 0.45 * boost ? rollSignedSpeed(0.08, 0.05) : 0,
        critChanceBonus: Math.random() < 0.3 * boost ? Math.round(0.015 * boost * 1000) / 1000 : 0,
      };
    }

    if (slot === 'accessory') {
      return {
        ...empty,
        castSpeedBonus: Math.random() < 0.25 * boost ? rollSignedSpeed(0.08, 0.05) : 0,
        cooldownReductionBonus:
          Math.random() < 0.3 * boost ? Math.max(1, Math.floor(4 * boost + Math.random() * 8 * boost)) : 0,
        critChanceBonus: Math.random() < 0.35 * boost ? Math.round(0.02 * boost * 1000) / 1000 : 0,
        critDamageBonus: Math.random() < 0.4 * boost ? Math.round(0.1 * boost * 100) / 100 : 0,
      };
    }

    if (slot === 'armor' && Math.random() < 0.22 * boost) {
      return {
        ...empty,
        cooldownReductionBonus: Math.max(1, Math.floor(2 * boost + Math.random() * 5 * boost)),
      };
    }

    return empty;
  }

  private rollRarityForChest(chestType: ChestType, stage: number): GearRarity {
    const weights = { ...CHEST_RARITY_WEIGHTS[chestType] };
    const stageBonus = Math.min(0.08, stage * 0.0008);
    weights.epic += stageBonus * 0.5;
    weights.legendary += stageBonus * 0.3;
    weights.mythic += stageBonus * 0.2;
    weights.common = Math.max(0.02, weights.common - stageBonus);

    const roll = Math.random();
    let cumulative = 0;

    for (const rarity of RARITY_ORDER) {
      cumulative += weights[rarity];
      if (roll <= cumulative) {
        return rarity;
      }
    }

    return 'common';
  }

  private rollRarity(stage: number): GearRarity {
    return this.rollRarityForChest('monster', stage);
  }
}
