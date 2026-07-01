# 142 — Meta entre temporadas (Legado)

Implementação do item 7 do doc `138-analise-melhorias-jogo.md`.

## Conceito

**Selos de legado (✦)** persistem em `chrome.storage.local` separado do save da temporada. Ao concluir uma temporada, o jogador ganha selos e pode gastá-los em melhorias permanentes que afetam todas as runs futuras.

## Economia

- **Ganho base:** `5 + floor(tierMáximo / 3)` selos por temporada concluída.
- **Cofre de Selos** (melhoria de legado): +2 selos extras por temporada.

## Árvore permanente (9 nós)

| Trilha | Efeito |
|--------|--------|
| Bolsa Inicial I–III | +25 / +25 / +50 ouro ao iniciar nova temporada |
| Pacto Dourado I–III | +5% / +5% / +10% ouro de combate |
| Memória de Batalha I–II | +8% / +12% XP da party |
| Cofre de Selos | +2 selos por temporada |

## Arquitetura

| Camada | Arquivos |
|--------|----------|
| Domínio | `MetaProgress`, `MetaService`, `MetaUpgradeCatalog`, `MetaBonusScope` |
| Storage | `ChromeStorageMetaRepository` (`side_hero_meta_progress`) |
| Aplicação | `GetMetaTreeUseCase`, `PurchaseMetaUpgradeUseCase`; `TickGameUseCase` concede selos; `NewGameUseCase` aplica ouro inicial |
| Combate | `PhaseCombatHandlers` lê `MetaBonusScope` para ouro/XP |
| UI | `MetaLegacyModalRenderer`, link em Configurações, toast ao ganhar selos |

## Fluxo do jogador

1. Concluir temporada → toast `+N selos de legado!`
2. Configurações → **Abrir legado** → comprar bônus com selos
3. **Novo jogo** → progresso da run zera; selos e melhorias permanecem; ouro inicial com bônus

## Testes

- `MetaService.test.ts`
