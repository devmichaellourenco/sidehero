# 080 — Sistema de Party (Fase A: Domínio)

## Objetivo

Introduzir a fundação do sistema de party no domínio, seguindo SOLID e Clean Architecture, sem UI de edição ainda.

## Escopo da Fase A

- Modelo `roster` + `activePartyIds` em `GameState`
- Policies e validadores em `src/domain/party/`
- Combate e battle strip usam apenas `activeHeroes()`
- DTO expõe `activeParty`, `activePartyIds` e `canEditParty`
- Persistência grava `roster` + `activePartyIds` com fallback para saves legados

## Arquivos criados

| Arquivo | Função |
|---------|--------|
| `src/domain/party/PartyConstants.ts` | Constantes: min/max party (1–3), ratio XP bench (50%) |
| `src/domain/party/PartyValidator.ts` | Validação e normalização de `activePartyIds` |
| `src/domain/party/PartyEditPolicy.ts` | Gate: edição só fora de combate (`!combat && !phaseRun`) |
| `src/domain/party/BenchXpPolicy.ts` | Cálculo de XP da reserva (50%) — domínio pronto, wiring na Fase C |
| `src/domain/party/PartyNormalizer.ts` | Normaliza roster/party no load e no construtor de `GameState` |
| `src/domain/party/*.test.ts` | Testes unitários das policies |
| `src/domain/entities/GameState.party.test.ts` | Testes de getters e merge `withRosterHeroes` |

## Arquivos alterados

| Arquivo | Alteração |
|---------|-----------|
| `src/domain/entities/GameState.ts` | `roster`, `activePartyIds`, `activeHeroes()`, `benchHeroes()`, `withRosterHeroes()` |
| `src/domain/campaign/PhaseCombatHandlers.ts` | Combate inicia com `activeHeroes()` |
| `src/domain/services/combat/CombatTurnPhase.ts` | Turnos e fila usam party ativa |
| `src/application/dto/GameStateDto.ts` | Campos `activeParty`, `activePartyIds`, `canEditParty` |
| `src/application/presenters/GameStatePresenter.ts` | Mapeia roster vs party ativa; intent de combate usa party ativa |
| `src/presentation/components/BattleStripRenderer.ts` | Renderiza `activeParty` em vez do roster completo |
| `src/infrastructure/storage/ChromeStorageGameRepository.ts` | Serializa/deserializa party com migração |

## Comportamento atual

- Saves antigos: `heroes` vira `roster`; `activePartyIds` derivado dos IDs existentes (até 3)
- Starters continuam os 3 heróis ativos por padrão
- `heroes` permanece getter alias de `roster` (compatibilidade)
- Berserker/Paladino, UI de slots e XP bench **não** implementados nesta fase

## Próximas fases

- **B:** Unlock Berserker/Paladino via `UpgradeCatalog`
- **C:** `BenchXpPolicy` em `onBossDefeated`
- **D:** Use cases `SetPartySlot`, `ReorderParty` + gates em equip/skills
- **E:** UI painel Heróis (slots + reserva)
- **F:** Migração/persistência avançada se necessário

## Testes

```bash
npm test
```

## Status

Fase A concluída — domínio e combate alinhados ao modelo roster/party ativa.
