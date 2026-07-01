# 143 — Ícones de skills + feedback elemental

Implementação dos itens 8 e 9 do doc `138-analise-melhorias-jogo.md`.

## Ícones de skills

- **`SkillIconResolver`**: mapeamento explícito + inferência por definição de combate (tipo/kind, elemento) + padrões no `skillId`.
- **`SkillIconCatalog`**: delega para o resolver em vez de cair em `attack`/`weapon` genéricos.
- Cobertura: >80% das skills do registry com ícone temático (fogo, cura, escudo, etc.).

## Feedback elemental

- **`SkillElementResolver`**: elemento primário a partir de `damageComponents`.
- **Barra de skills no combate**: badge com elemento (Fogo, Gelo, Raio, Caos) no canto do ícone.
- **Tooltip de skill do herói**: destaque do tipo elemental na linha meta.
- **Inimigos**:
  - Chips visíveis no card (`element-chip-row`) com resistências e fraquezas.
  - Tooltip com linhas `Resist:` e `Fraqueza:`.
  - **`EnemyInnateResists`**: fraquezas temáticas (ex.: fogo fraco a gelo) com valores negativos que afetam o combate.

## Arquivos principais

| Arquivo | Papel |
|---------|--------|
| `SkillIconResolver.ts` | Ícones por skill |
| `SkillElementResolver.ts` | Elemento primário |
| `CombatResistMapper.ts` | Chips e linhas de tooltip |
| `CombatSkillIntentPresentation.ts` | Badge elemental na battle strip |
| `EnemyBattlePresentation.ts` | Chips no card do inimigo |

## Testes

- `SkillIconResolver.test.ts`
- `SkillElementResolver.test.ts`
- `CombatResistMapper.test.ts` (fraquezas/chips)
- `EnemyInnateResists.test.ts`
- `BattleResistTooltipPresentation.test.ts`
