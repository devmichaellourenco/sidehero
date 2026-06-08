import { copyFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const resourcesRoot = join(root, 'public', 'ResourcesData');
const outRoot = join(root, 'dist', 'panel', 'assets');

const ASSET_MAP = [
  ['Fonts/Alata-Regular.ttf', 'fonts/Alata-Regular.ttf'],
  ['Fonts/JosefinSans-Bold.ttf', 'fonts/JosefinSans-Bold.ttf'],

  ['Sprites/Demo/Demo_Character/character_sample_03.png', 'characters/knight.png'],
  ['Sprites/Demo/Demo_Character/character_sample_02.png', 'characters/sorcerer.png'],
  ['Sprites/Demo/Demo_Character/character_sample_01.png', 'characters/priest.png'],
  ['Sprites/Demo/Demo_Character/character_sample_04.png', 'characters/slime.png'],
  ['Sprites/Demo/Demo_Character/character_sample_05.png', 'characters/goblin.png'],
  ['Sprites/Demo/Demo_Character/character_sample_06.png', 'characters/orc.png'],
  ['Sprites/Demo/Demo_Character/character_sample_08.png', 'characters/wraith.png'],
  ['Sprites/Demo/Demo_Character/character_sample_07.png', 'characters/dragon.png'],
  ['Sprites/Demo/Demo_Character/character_back_glow_small.png', 'characters/glow.png'],

  ['Sprites/Demo/Demo_Image/group_image_swordmark3.png', 'ui/brand.png'],
  ['Sprites/Demo/Demo_Icon_Chest/set_icon_gold_0.png', 'ui/gold.png'],
  ['Sprites/Demo/Demo_Icon_Chest/shop_img_chest_close_s_00.png', 'ui/chest.png'],
  ['Sprites/Demo/Demo_Icon/icon_color_energy.png', 'ui/energy.png'],
  ['Sprites/Component/Icon_ItemIcons_(Original)/icon_itemicon_flag.png', 'ui/stage.png'],
  ['Sprites/Component/Icon_ItemIcons_(Original)/icon_itemicon_battle.png', 'ui/attack.png'],
  ['Sprites/Component/Icon_ItemIcons_(Original)/icon_itemicon_shield.png', 'ui/defense.png'],
  ['Sprites/Component/Icon_ItemIcons_(Original)/icon_itemicon_life.png', 'ui/health.png'],
  ['Sprites/Component/Icon_ItemIcons_(Original)/icon_itemicon_inventory.png', 'ui/inventory.png'],

  ['Sprites/Demo/Demo_Background/background_gradient_01.png', 'backgrounds/battle.png'],
  ['Sprites/Demo/Demo_Background/background_05_sample_01.png', 'backgrounds/app.png'],

  ['Sprites/Component/Frame/frame_cardframe_00_d_front1.png', 'frames/card.png'],
  ['Sprites/Component/Frame/frame_itemframe_00_n_blue.png', 'frames/item-rare.png'],
  ['Sprites/Component/Frame/frame_itemframe_00_n_purple.png', 'frames/item-epic.png'],
  ['Sprites/Component/Frame/frame_itemframe_01_s.png', 'frames/item-common.png'],

  ['Sprites/Component/Button/btn_rectangle_01_n_blue.png', 'buttons/primary.png'],
  ['Sprites/Component/Button/btn_rectangle_01_n_brown.png', 'buttons/secondary.png'],

  ['Sprites/Component/Slider/slider_icontype_03_frame.png', 'sliders/frame.png'],
  ['Sprites/Component/Slider/slider_icontype_03_fill_1.png', 'sliders/fill-hero.png'],
  ['Sprites/Component/Slider/slider_icontype_03_fill_0.png', 'sliders/fill-enemy.png'],

  ['Sprites/Component/Icon_EquipmentIcons_(Original)/equip_axe_0.png', 'gear/weapon.png'],
  ['Sprites/Component/Icon_EquipmentIcons_(Original)/equip_shield_wood.png', 'gear/armor.png'],
  ['Sprites/Component/Icon_EquipmentIcons_(Original)/equip_ring_gold.png', 'gear/accessory.png'],
  ['Sprites/Component/Icon_EquipmentIcons_(Original)/equip_stone.png', 'gear/common.png'],
  ['Sprites/Component/Icon_EquipmentIcons_(Original)/equip_gem_red.png', 'gear/rare.png'],
  ['Sprites/Component/Icon_EquipmentIcons_(Original)/equip_cyristal.png', 'gear/epic.png'],
];

export async function copyAssets() {
  for (const [source, dest] of ASSET_MAP) {
    const sourcePath = join(resourcesRoot, source);
    const destPath = join(outRoot, dest);
    await mkdir(dirname(destPath), { recursive: true });
    await copyFile(sourcePath, destPath);
  }

  console.log(`Assets copiados: ${ASSET_MAP.length} arquivos em dist/panel/assets/`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  copyAssets().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
