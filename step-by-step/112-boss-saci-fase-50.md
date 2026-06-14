# 112 — Boss Saci na fase 1-50

## Objetivo

Substituir o boss do marco 1-50 por **Saci**, com sprite dedicado e skills elementais de fogo e vento.

## Alterações

| Arquivo | Mudança |
|---------|---------|
| `MilestonePhaseBlueprints.ts` | Fase renomeada para **Guardião Elemental**; wave 4 com `boss('saci', 1, 'Saci')` |
| `EnemyType.ts` | Novo tipo `saci` + inferência pelo nome |
| `WaveDefinition.ts` | Campo opcional `displayName` em `EnemySlot` |
| `WaveEnemyFactory.ts` | Respeita `displayName` (sem prefixo "Boss") |
| `EnemyCombatSkillCatalog.ts` | `saci_fire` (single) e `saci_wind` (AoE) |
| `EnemySkillDisplayCatalog.ts` | Chama Elemental / Rajada de Vento |
| `EnemyCombatBaselines.ts` | Perfil ágil com castSpeed elevado |
| `AssetCatalog.ts` + `copy-assets.mjs` | `saci_boss.png` → `characters/saci_boss.png` |
| `SkillIconCatalog.ts` | Ícones: fogo → fireball, vento → arcane_bolt |

## Skills do Saci

| ID | Nome | Efeito |
|----|------|--------|
| `saci_fire` | Chama Elemental | Dano mágico no herói mais ferido |
| `saci_wind` | Rajada de Vento | Dano mágico em área (todos os heróis) |

## Validação

```bash
npm test
npm run build
```

Fase **1-50** → nome **Guardião Elemental**, boss **Saci** com sprite e skills elementais no tooltip/combate.
