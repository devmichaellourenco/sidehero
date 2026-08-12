import {
  DEX_ATTACK_SPEED_SCALE,
  STR_ATTACK_SPEED_SCALE,
} from '../../src/domain/combat/CombatSpeedScaling';
import { getHeroCombatIdentity } from '../../src/domain/combat/HeroCombatIdentityCatalog';
import { LabFormulaConstants } from './types';

export function defaultFormulaConstants(): LabFormulaConstants {
  const knight = getHeroCombatIdentity('knight');
  return {
    attackPerLevel: knight.attackPerLevel,
    defensePerLevel: knight.defensePerLevel,
    healthPerLevel: knight.healthPerLevel,
    attrAtkStr: 0.5,
    attrAtkDex: 0.3,
    attrDefDex: 0.5,
    attrDefStr: 0.2,
    attrHpStr: 2,
    baseAspdFactor: knight.attackSpeedFactor,
    dexAspdScale: DEX_ATTACK_SPEED_SCALE,
    strAspdScale: STR_ATTACK_SPEED_SCALE,
    basicAttackRatio: knight.basicAttackDamageRatio,
    aspdFloor: 0.175,
  };
}

export interface FormulaFieldMeta {
  key: keyof LabFormulaConstants;
  label: string;
  formulaHint: string;
}

export interface FormulaGroup {
  id: string;
  title: string;
  equation: string;
  meaning: string;
  fields: readonly FormulaFieldMeta[];
}

/** Grupos do painel direito — uma fórmula por bloco, constantes abaixo. */
export const FORMULA_GROUPS: readonly FormulaGroup[] = [
  {
    id: 'atk',
    title: 'ATK — ataque',
    equation:
      'floor( (Base ATK + Gear ATK + (Level − 1)×[ATK / nível] + floor(STR×[STR → ATK] + DEX×[DEX → ATK]) ) × (1 + [ATK % gear + ATK % passivas]/100) )',
    meaning:
      'Base ATK = classe/nível-up ou sheet inimigo. Gear ATK e ATK % gear vêm do Combatente; ATK % passivas soma passivas ativas.',
    fields: [
      {
        key: 'attackPerLevel',
        label: 'ATK / nível',
        formulaHint: '(Level − 1) × isto',
      },
      {
        key: 'attrAtkStr',
        label: 'STR → ATK',
        formulaHint: 'peso da STR no bônus',
      },
      {
        key: 'attrAtkDex',
        label: 'DEX → ATK',
        formulaHint: 'peso da DEX no bônus',
      },
    ],
  },
  {
    id: 'def',
    title: 'DEF — defesa',
    equation:
      'floor( (Base DEF + Gear DEF + (Level − 1)×[DEF / nível] + floor(DEX×[DEX → DEF] + STR×[STR → DEF]) ) × (1 + [DEF % gear + DEF % passivas]/100) )',
    meaning:
      'Base DEF = armadura base. Gear DEF e DEF % gear no Combatente; DEF % passivas no mesmo %. Usada por HP%/DEF (ex.: Saúde de Titã).',
    fields: [
      {
        key: 'defensePerLevel',
        label: 'DEF / nível',
        formulaHint: '(Level − 1) × isto',
      },
      {
        key: 'attrDefDex',
        label: 'DEX → DEF',
        formulaHint: 'peso da DEX no bônus',
      },
      {
        key: 'attrDefStr',
        label: 'STR → DEF',
        formulaHint: 'peso da STR no bônus',
      },
    ],
  },
  {
    id: 'hp',
    title: 'HP — vida máxima',
    equation:
      'floor( (Base HP + Gear HP + (Level − 1)×[HP / nível] + STR×[STR → HP] ) × (1 + [HP % gear + HP % passivas]/100) )',
    meaning:
      'Base HP = vida base. Gear HP e HP % gear no Combatente; HP % passivas inclui flat, por nível e % por ponto de DEF.',
    fields: [
      {
        key: 'healthPerLevel',
        label: 'HP / nível',
        formulaHint: '(Level − 1) × isto',
      },
      {
        key: 'attrHpStr',
        label: 'STR → HP',
        formulaHint: 'STR × isto (flat)',
      },
    ],
  },
  {
    id: 'aspd',
    title: 'ASPD / TTA — velocidade',
    equation:
      'ASPD = max([Piso ASPD], [ASPD baseline]×[Fator baseline] + DEX×[DEX → ASPD] + STR×[STR → ASPD]?) · TTA = 1/ASPD · Hit básico = floor(ATK × [Ratio básico])',
    meaning:
      'ASPD baseline = perfil da classe (ou override no Combatente). STR → ASPD só com ASPD melee (STR) ligado.',
    fields: [
      {
        key: 'baseAspdFactor',
        label: 'Fator baseline',
        formulaHint: 'ASPD baseline × isto',
      },
      {
        key: 'dexAspdScale',
        label: 'DEX → ASPD',
        formulaHint: 'DEX × isto',
      },
      {
        key: 'strAspdScale',
        label: 'STR → ASPD',
        formulaHint: 'só se ASPD melee (STR)',
      },
      {
        key: 'basicAttackRatio',
        label: 'Ratio básico',
        formulaHint: 'Hit básico = ATK × isto',
      },
      {
        key: 'aspdFloor',
        label: 'Piso ASPD',
        formulaHint: 'mínimo no lab',
      },
    ],
  },
  {
    id: 'resists',
    title: 'Resistências',
    equation:
      'dano elemental = floor( ATK × (1 − Resist efetiva/100) ) · Resist efetiva = (Resist [elemento] + Resist All elemental) × (1 − [Pen % elemento + Pen % All elemental]/100)',
    meaning:
      'Físico usa armadura (Base DEF / Gear DEF), não resistência. Campos no Combatente: Resist Fogo/Gelo/Raio/Ar/All e Pen %.',
    fields: [],
  },
  {
    id: 'elemental',
    title: 'Skills de dano (classe / inimigo)',
    equation:
      'raw = max( Base×(powerPerRank×Rank)×(Attr×Fator) , piso ATK×Ratio ) · outgoing = raw×[Peso]×(1+[Dano %]/100)+[flat] · básico = floor(ATK×[Ratio básico])',
    meaning:
      'Skills de dano nunca ficam abaixo do ataque básico (ATK×Ratio básico). Rank/Attr sobem o catálogo; o piso só segura se o produto for menor. Inimigos flat podem ter minAttackRatio maior no catálogo.',
    fields: [],
  },
];

/** Lista plana (leitura do DOM / reset). */
export const FORMULA_FIELDS: readonly FormulaFieldMeta[] = FORMULA_GROUPS.flatMap(
  (group) => group.fields,
);

export function mergeFormulaConstants(
  partial?: Partial<LabFormulaConstants> | null,
): LabFormulaConstants {
  return { ...defaultFormulaConstants(), ...(partial ?? {}) };
}
