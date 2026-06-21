import { PartialResistanceProfile, ResistanceProfile, ZERO_RESISTANCES } from '../combat/ResistanceProfile';
import { tierInnateResistBonus } from '../combat/DifficultyCombatScaling';
import { getEnemyRosterEntry } from './EnemyRosterCatalog';

function inferThemeResists(enemyType: string): PartialResistanceProfile {
  const id = enemyType.toLowerCase();

  if (id.includes('fire') || id.includes('infernal') || id.includes('pyro') || id.includes('dragon')) {
    return { fire: 12 };
  }
  if (id.includes('frost') || id.includes('ice')) {
    return { cold: 15 };
  }
  if (id.includes('lightning') || id.includes('void') || id.includes('arcane')) {
    return { lightning: 10 };
  }
  if (
    id.includes('undead') ||
    id.includes('wraith') ||
    id.includes('necromancer') ||
    id.includes('lich') ||
    id.includes('zombie') ||
    id.includes('skeleton') ||
    id.includes('poison') ||
    id.includes('spider') ||
    id.includes('hydra') ||
    id.includes('slime') ||
    id.includes('manticore') ||
    id.includes('aberrant')
  ) {
    return { chaos: 10 };
  }
  if (id.includes('demon') || id.includes('cultist')) {
    return { fire: 8, chaos: 6 };
  }

  return {};
}

export function resolveEnemyInnateResists(
  enemyType: string,
  difficultyTier = 1,
): ResistanceProfile {
  const entry = getEnemyRosterEntry(enemyType);
  if (!entry) {
    return ZERO_RESISTANCES;
  }

  const theme = inferThemeResists(enemyType);
  const explicit = entry.innateResists ?? {};
  const roleBonus = entry.rosterRole === 'boss' ? 6 : entry.rosterRole === 'subboss' ? 3 : 0;
  const tierBonus = (entry.powerTier - 1) * 2;
  const globalTierBonus = tierInnateResistBonus(difficultyTier);

  return {
    fire: (explicit.fire ?? theme.fire ?? 0) + roleBonus + globalTierBonus,
    cold: (explicit.cold ?? theme.cold ?? 0) + roleBonus + globalTierBonus,
    lightning: (explicit.lightning ?? theme.lightning ?? 0) + roleBonus + globalTierBonus,
    chaos: (explicit.chaos ?? theme.chaos ?? 0) + roleBonus + globalTierBonus,
    allElemental: (explicit.allElemental ?? 0) + tierBonus,
  };
}
