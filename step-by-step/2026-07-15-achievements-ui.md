# Achievements — botão e tela de lista

Data: 2026-07-15

## Objetivo

Expor achievements no painel: botão com ícone `book_open` e modal com lista de progresso/unlock.

## Alterações

| Arquivo | Função |
|---------|--------|
| `scripts/copy-assets.mjs` + `AssetCatalog` | Copia `icon_itemicon_book_open` → `ui/book-open.png` |
| `panel.html` / `PanelIconHydrator` / `panel.css` | Botão Achievements no menu |
| `GetAchievementsUseCase` + SW `GET_ACHIEVEMENTS` | Lista DTOs a partir do catálogo + progresso |
| `AchievementService.listEntries` | Monta snapshot para UI |
| `AchievementsFlow` / `AchievementsModalRenderer` | Carrega e renderiza a tela |
| `ModalTypes` / `ModalStackController` / `GameViewController` | View `achievements` |
| Spec + testes | Aceite UI + `AchievementsModalRenderer.test.ts` |

## Validação manual

1. Recarregar extensão / rebuild assets.
2. Toclar **Achievements** no menu.
3. Ver lista com `Hero - Out of the Side` e `0/1` (ou `1/1` se já limpou 1-1).
