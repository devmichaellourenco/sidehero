import { CombatStatusEffectDto } from '../dto/GameStateDto';

/** Caminhos relativos a `panel/assets/` — resolvidos na presentation via `getAssetUrl`. */
const STATUS_EFFECT_ICON_PATH: Record<CombatStatusEffectDto['kind'], string> = {
  buff_attack: 'ui/defense.png',
  debuff_defense: 'ui/defense.png',
};

export function mapCombatStatusEffectIconPath(
  kind: CombatStatusEffectDto['kind'],
): string {
  return STATUS_EFFECT_ICON_PATH[kind];
}
