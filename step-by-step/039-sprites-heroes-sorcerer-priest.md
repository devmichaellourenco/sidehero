# 039 — Sprites de heróis (sorcerer e priest)

## Status: concluída

## Problema

Lyra (`sorcerer`) e Elara (`priest`) usavam sprites genéricos do pack Demo (`character_sample_02` e `character_sample_01`).

## Solução

Novos sprites em `public/sprites/heroes/` copiados no build para `dist/panel/assets/characters/`.

| Herói | Classe | Arquivo origem | Destino no build |
|-------|--------|----------------|------------------|
| Lyra | sorcerer | `feiticeira.png` | `characters/sorcerer.png` |
| Elara | priest | `priest.png` | `characters/priest.png` |
| Arthos | knight | `fighter.png` | `characters/knight.png` |

## Arquivos

| Arquivo | Função |
|---------|--------|
| `public/sprites/heroes/feiticeira.png` | Sprite da feiticeira (Lyra) |
| `public/sprites/heroes/priest.png` | Sprite da sacerdotisa (Elara) |
| `scripts/copy-assets.mjs` | `HERO_SPRITE_MAP` + `copyAssetBatch` para múltiplas origens |
| `src/presentation/assets/AssetCatalog.ts` | Sem alteração — já resolve `characters/sorcerer.png` e `characters/priest.png` |

## Onde aparece

- Battle strip (`BattleStripRenderer`)
- Painel de heróis (`HeroPanelRenderer`)
- Modal ficha (`HeroSheetTabRenderer`)
- Equip picker (`EquipPickerModalRenderer`)

## Como validar

```bash
npm run build
```

Recarregar extensão → Lyra e Elara com novos visuais na battle strip e nos modais.
