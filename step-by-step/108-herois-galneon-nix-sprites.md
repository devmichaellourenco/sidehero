# 108 — Heróis Galneon e Nix (sprites aprendiz)

## Status: concluída

## Alterações

| Antes | Depois | Classe | Sprite |
|-------|--------|--------|--------|
| Arthos | **Galneon** | knight | `galneon_aprendiz.png` |
| Lyra | **Nix** | sorcerer | `nix_aprendiz.png` |

## Arquivos

| Arquivo | Função |
|---------|--------|
| `GameState.ts` | Nomes dos heróis iniciais |
| `scripts/copy-assets.mjs` | Mapeamento para `characters/knight.png` e `characters/sorcerer.png` |
| `public/sprites/heroes/galneon_aprendiz.png` | Arte do Galneon |
| `public/sprites/heroes/nix_aprendiz.png` | Arte da Nix |

## Build

```bash
npm run build
```

Recarregue a extensão. Saves antigos com **Arthos** / **Lyra** são renomeados ao carregar (`GameStateMigration`).
