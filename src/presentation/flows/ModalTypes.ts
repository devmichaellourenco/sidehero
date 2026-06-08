import { EquipPickerMode } from '../components/EquipPickerModalRenderer';

export type ModalView =
  | { type: 'inventory' }
  | { type: 'hero-detail'; heroId: string }
  | { type: 'equip-picker'; mode: EquipPickerMode }
  | { type: 'loot-reveal'; gearId: string }
  | { type: 'loot-batch'; gearIds: string[] }
  | { type: 'settings' }
  | { type: 'shop' }
  | { type: 'upgrades' };
