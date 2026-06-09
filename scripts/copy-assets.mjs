import { copyFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const resourcesRoot = join(root, 'public', 'ResourcesData');
const heroesSpritesRoot = join(root, 'public', 'sprites', 'heroes');
const skillsSpritesRoot = join(root, 'public', 'sprites', 'skills');
const publicRoot = join(root, 'public');
const outRoot = join(root, 'dist', 'panel', 'assets');

/** Sprites de heróis em public/sprites/heroes. */
const HERO_SPRITE_MAP = [
  ['fighter.png', 'characters/knight.png'],
  ['feiticeira.png', 'characters/sorcerer.png'],
  ['priest.png', 'characters/priest.png'],
];

/** Sprites de skills em public/sprites/skills (nome do arquivo = skillId). */
const SKILL_SPRITE_MAP = [
  ['vitality.png', 'skills/vitality.png'],
  ['arcane_bolt.png', 'skills/arcane_bolt.png'],
  ['fireball.png', 'skills/fireball.png'],
  ['heal.png', 'skills/heal.png'],
];

/** Logo e demais assets estáticos em public/. */
const PUBLIC_ASSET_MAP = [['logo.png', 'ui/brand.png']];

const ASSET_MAP = [
  ['Fonts/Alata-Regular.ttf', 'fonts/Alata-Regular.ttf'],
  ['Fonts/JosefinSans-Bold.ttf', 'fonts/JosefinSans-Bold.ttf'],

  ['Sprites/Demo/Demo_Character/character_sample_04.png', 'characters/slime.png'],
  ['Sprites/Demo/Demo_Character/character_sample_05.png', 'characters/goblin.png'],
  ['Sprites/Demo/Demo_Character/character_sample_06.png', 'characters/orc.png'],
  ['Sprites/Demo/Demo_Character/character_sample_08.png', 'characters/wraith.png'],
  ['Sprites/Demo/Demo_Character/character_sample_07.png', 'characters/dragon.png'],
  ['Sprites/Demo/Demo_Character/character_back_glow_small.png', 'characters/glow.png'],

  ['Sprites/Demo/Demo_Icon_Chest/set_icon_gold_0.png', 'ui/gold.png'],
  ['Sprites/Demo/Demo_Icon_Chest/shop_img_chest_close_s_00.png', 'ui/chest.png'],
  ['Sprites/Demo/Demo_Icon_Chest/shop_img_chest_open01_s_00.png', 'ui/chest-open.png'],
  ['Sprites/Component/Popup/popup_01_frame.png', 'ui/victory-frame.png'],
  ['Sprites/Demo/Demo_Image/image_glow_circle.png', 'ui/victory-glow.png'],
  ['Sprites/Demo/Demo_Image/group_image_wingbadge1.png', 'ui/victory-wings.png'],
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

async function copyAssetBatch(sourceRoot, entries) {
  for (const [source, dest] of entries) {
    const sourcePath = join(sourceRoot, source);
    const destPath = join(outRoot, dest);
    await mkdir(dirname(destPath), { recursive: true });
    await copyFile(sourcePath, destPath);
  }
}

export async function copyAssets() {
  await copyAssetBatch(resourcesRoot, ASSET_MAP);
  await copyAssetBatch(heroesSpritesRoot, HERO_SPRITE_MAP);
  await copyAssetBatch(skillsSpritesRoot, SKILL_SPRITE_MAP);
  await copyAssetBatch(publicRoot, PUBLIC_ASSET_MAP);

  const total =
    ASSET_MAP.length + HERO_SPRITE_MAP.length + SKILL_SPRITE_MAP.length + PUBLIC_ASSET_MAP.length;
  console.log(`Assets copiados: ${total} arquivos em dist/panel/assets/`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  copyAssets().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
