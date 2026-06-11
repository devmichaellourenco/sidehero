# 085 — Auto-batalha disponível por padrão

## Mudança

Com o combate temporal, a auto-batalha deixa de ser upgrade e passa a ser recurso base.

| Área | Antes | Depois |
|------|-------|--------|
| `FeatureAccessPolicy` | `autoBattle` com upgrade nível 1 | Sempre `true` |
| `GamePreferences` | Default `false` | Default `true` (sessão nova) |
| `UpgradeCatalog` | `auto_battle_1` desbloqueava toggle | Removido; II/III liberam 2x/3x |
| `auto_open_chests_1` | Exigia auto_battle nível 1 | Exige só `min_stage: 3` |

## Melhorias que permanecem

- **Auto-batalha II** → velocidade 2x
- **Auto-batalha III** → velocidade 3x

## Arquivos

- `FeatureAccessPolicy.ts`
- `GamePreferences.ts`
- `UpgradeCatalog.ts`
- `SettingsModalRenderer.ts`
- `FeatureFlagsHelper.ts`
