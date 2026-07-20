import {
  BLOCK_DAMAGE_MULTIPLIER,
  MAX_BLOCK_CHANCE,
  MAX_DAMAGE_REDUCTION,
  MAX_DODGE_CHANCE,
} from '../../domain/combat/DefensiveMitigation';
import {
  EVASION_DODGE_PER_RANK,
  IRON_SKIN_DAMAGE_REDUCTION_PER_RANK,
  MANA_SHIELD_BLOCK_PER_RANK,
  VITALITY_HP_STR_FACTOR_PER_RANK,
  evasionDodgeBonusAtRank,
  ironSkinDamageReductionAtRank,
  isPassiveEquippedSkill,
  isPassiveSkillActive,
  manaShieldBlockAtRank,
  passiveSkillRank,
  vitalityHealthBonusAtRank,
} from '../../domain/combat/PassiveSkillEffects';
import { Hero } from '../../domain/entities/Hero';
import { HeroActiveSkillStatDto } from '../dto/GameStateDto';

const EQUIP_NOTE = 'Só funciona com a skill equipada em um slot de batalha.';

function fmtPct(value: number, digits = 1): string {
  return `${(value * 100).toFixed(digits)}%`;
}

function fmtInt(value: number): string {
  return Math.round(value).toLocaleString('pt-BR');
}

function passiveStatusLine(active: boolean): { text: string } {
  return {
    text: active ? 'Status: ativa (equipada na barra de skills).' : 'Status: inativa — equipe para aplicar o bônus.',
  };
}

export function buildPassiveSkillBattleStats(hero: Hero, skillId: string): HeroActiveSkillStatDto[] {
  if (!isPassiveEquippedSkill(skillId)) return [];

  const rank = passiveSkillRank(hero, skillId);
  const active = isPassiveSkillActive(hero, skillId);
  const previewRank = Math.max(1, rank);
  const str = hero.totalAttributes.str;

  switch (skillId) {
    case 'evasion': {
      const atPreview = evasionDodgeBonusAtRank(previewRank);
      const atCurrent = evasionDodgeBonusAtRank(rank);
      return [
        {
          label: 'Tipo',
          value: 'Passiva · Esquiva',
          tooltipLines: [
            { text: 'Não gasta turno nem entra em recarga.' },
            { text: 'Cada golpe recebido testa esquiva antes de bloqueio e redução.' },
            { text: EQUIP_NOTE },
          ],
        },
        {
          label: 'Esquiva',
          value:
            rank >= 1
              ? `+${fmtPct(atCurrent)} (level ${rank})`
              : `+${fmtPct(EVASION_DODGE_PER_RANK)} por level`,
          emphasize: true,
          tooltipLines: [
            {
              icon: 'dodge',
              text: `+${fmtPct(EVASION_DODGE_PER_RANK, 2)} esquiva por level.`,
            },
            { text: `Level ${previewRank} → +${fmtPct(atPreview)}.` },
            { text: `Teto global: ${fmtPct(MAX_DODGE_CHANCE)} (soma com DEX base e equipamento).` },
            passiveStatusLine(active),
          ],
        },
        {
          label: 'Mecânica',
          value: 'Anula o dano do golpe',
          tooltipLines: [
            { text: 'Esquiva bem-sucedida = 0 de dano naquele hit (skills e DOT por tick).' },
            { text: 'Não reduz parcialmente — evita o golpe por completo.' },
          ],
        },
      ];
    }
    case 'vitality': {
      const perLevel = vitalityHealthBonusAtRank(1, str);
      const atCurrent = vitalityHealthBonusAtRank(rank, str);
      return [
        {
          label: 'Tipo',
          value: 'Passiva · Vida máxima',
          tooltipLines: [
            { text: 'Aumenta o HP máximo do herói enquanto equipada.' },
            {
              icon: 'health',
              text: `Fórmula: level × STR × ${VITALITY_HP_STR_FACTOR_PER_RANK} HP.`,
            },
            { text: EQUIP_NOTE },
          ],
        },
        {
          label: 'Vida máxima',
          value:
            rank >= 1
              ? `+${fmtInt(atCurrent)} HP (level ${rank})`
              : `+${fmtInt(perLevel)} HP por level (STR ${str})`,
          emphasize: true,
          tooltipLines: [
            {
              icon: 'health',
              text: `Com STR ${str}: +${fmtInt(perLevel)} HP por level.`,
            },
            {
              text: `Level ${previewRank} → +${fmtInt(vitalityHealthBonusAtRank(previewRank, str))} HP.`,
            },
            passiveStatusLine(active),
          ],
        },
      ];
    }
    case 'iron_skin': {
      const atPreview = ironSkinDamageReductionAtRank(previewRank);
      const atCurrent = ironSkinDamageReductionAtRank(rank);
      return [
        {
          label: 'Tipo',
          value: 'Passiva · Redução',
          tooltipLines: [
            { text: 'Reduz dano recebido após esquiva/bloqueio.' },
            { text: EQUIP_NOTE },
          ],
        },
        {
          label: 'Redução de dano',
          value:
            rank >= 1
              ? `+${fmtPct(atCurrent)} (level ${rank})`
              : `+${fmtPct(IRON_SKIN_DAMAGE_REDUCTION_PER_RANK)} por level`,
          emphasize: true,
          tooltipLines: [
            {
              icon: 'damageReduction',
              text: `+${fmtPct(IRON_SKIN_DAMAGE_REDUCTION_PER_RANK, 0)} redução por level.`,
            },
            { text: `Level ${previewRank} → +${fmtPct(atPreview)}.` },
            { text: `Teto global: ${fmtPct(MAX_DAMAGE_REDUCTION)}.` },
            passiveStatusLine(active),
          ],
        },
        {
          label: 'Mecânica',
          value: 'Multiplica dano restante',
          tooltipLines: [
            { text: 'Aplica após esquiva e bloqueio (se houver).' },
            { text: 'Dano final = dano × (1 − redução total).' },
          ],
        },
      ];
    }
    case 'mana_shield': {
      const atPreview = manaShieldBlockAtRank(previewRank);
      const atCurrent = manaShieldBlockAtRank(rank);
      return [
        {
          label: 'Tipo',
          value: 'Passiva · Bloqueio',
          tooltipLines: [
            { text: 'Chance de bloquear golpes recebidos.' },
            { text: EQUIP_NOTE },
          ],
        },
        {
          label: 'Bloqueio',
          value:
            rank >= 1
              ? `+${fmtPct(atCurrent)} (level ${rank})`
              : `+${fmtPct(MANA_SHIELD_BLOCK_PER_RANK)} por level`,
          emphasize: true,
          tooltipLines: [
            { icon: 'block', text: `+${fmtPct(MANA_SHIELD_BLOCK_PER_RANK, 0)} bloqueio por level.` },
            { text: `Level ${previewRank} → +${fmtPct(atPreview)}.` },
            { text: `Teto global: ${fmtPct(MAX_BLOCK_CHANCE)}.` },
            passiveStatusLine(active),
          ],
        },
        {
          label: 'Mecânica',
          value: `Dano × ${BLOCK_DAMAGE_MULTIPLIER}`,
          tooltipLines: [
            { text: 'Se bloquear, o dano é reduzido pela metade (antes da redução %).' },
            { text: 'Testado depois da esquiva e antes da redução de dano.' },
          ],
        },
      ];
    }
    default:
      return [];
  }
}
