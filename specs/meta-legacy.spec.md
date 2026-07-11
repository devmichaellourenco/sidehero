# Spec — Meta e Legado entre Temporadas

## Status

**Aceite:** 6/6 (100%) · finale v1 em Morthaven  
**Testes obrigatórios:** 1/1 presente na suite

## Objetivo

Após concluir temporada, o jogador ganha **selos** persistentes e compra bônus permanentes na árvore meta para acelerar a próxima run.

## Critérios de aceite

- [x] Progresso meta em repositório separado (`IMetaProgressRepository`)
- [x] Selos concedidos ao finalizar temporada (`MetaService`)
- [x] Árvore meta com upgrades permanentes (`MetaUpgradeCatalog`)
- [x] Bônus aplicados em nova run (`MetaBonuses`, escopo por feature)
- [x] Modal de legado acessível no painel
- [x] Temporada conclui ao vencer `4-50` (Duque de Morthaven) no perfil `base` — ver `combat-campaign.spec.md`

## Escopo v1

No jogo base, **fim de temporada** = vitória em `4-50`. Selos e Wow disparam nesse ponto. Mapas DLC (5–10) não alteram o ciclo meta até serem liberados em release futuro.

## Camadas e arquivos-chave

| Camada | Paths |
|--------|-------|
| Domain | `src/domain/meta/*` |
| Application | `GetMetaTreeUseCase`, `PurchaseMetaUpgradeUseCase`, `NewGameUseCase` (aplica meta) |
| Presentation | `MetaLegacyModalRenderer`, Wow banner fim de temporada |

## Invariantes

- Save de jogo (`side_hero_game_state`) separado do meta progress
- Meta não altera saves antigos retroativamente sem migração explícita

## Fora de escopo

- Leaderboards online

## Testes obrigatórios

- [x] `MetaService.test.ts`
