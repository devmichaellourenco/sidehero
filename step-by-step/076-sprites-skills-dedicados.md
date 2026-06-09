# 076 — Sprites dedicados de skills

## Objetivo

Usar ícones exclusivos para `vitality`, `arcane_bolt` e `fireball` em vez dos placeholders genéricos.

## Arquivos fonte

`public/sprites/skills/`:
- `vitality.png`
- `arcane_bolt.png`
- `fireball.png`

## Pipeline

`copy-assets.mjs` copia para `dist/panel/assets/skills/` (mesmo padrão de `sprites/heroes`).

## Catálogo

| Arquivo | Função |
|---------|--------|
| `AssetCatalog.ts` | Entradas `skills.vitality`, `skills.arcane_bolt`, `skills.fireball` |
| `SkillIconCatalog.ts` | Mapeamento `skillId` → sprite dedicado |
| `SkillIconCatalog.test.ts` | Testes atualizados |

## Validação

```bash
npm test
npm run build
```
